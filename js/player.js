class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.gainNode = null;
        this._init = false;
        this._crossfadeTimer = null;
        this._fadeTimer = null;
        this._mediaSession = 'mediaSession' in navigator;
        this._waveformData = new Uint8Array(64);
        this._animationFrame = null;
        this._setupAudio();
        this._setupEventListeners();
        this._setupMediaSession();
    }

    _setupAudio() {
        this.audio.crossOrigin = 'anonymous';
        this.audio.preload = 'auto';
        this.audio.volume = Store.get('volume');
    }

    _setupEventListeners() {
        this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this._onLoadedMetadata());
        this.audio.addEventListener('ended', () => this._onEnded());
        this.audio.addEventListener('error', (e) => this._onError(e));
        this.audio.addEventListener('waiting', () => Store.set('loading', true));
        this.audio.addEventListener('canplay', () => Store.set('loading', false));
        this.audio.addEventListener('play', () => Store.set('isPlaying', true));
        this.audio.addEventListener('pause', () => Store.set('isPlaying', false));
        this.audio.addEventListener('volumechange', () => {
            Store.set('volume', this.audio.volume);
            localStorage.setItem('player-volume', this.audio.volume);
        });
    }

    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 128;
            this.gainNode = this.audioContext.createGain();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this._init = true;
    }

    _setupMediaSession() {
        if (!this._mediaSession) return;
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
        navigator.mediaSession.setActionHandler('seekforward', () => this.seekRelative(10));
        navigator.mediaSession.setActionHandler('seekbackward', () => this.seekRelative(-10));
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime) this.seek(details.seekTime);
        });
    }

    _updateMediaSession() {
        if (!this._mediaSession) return;
        const song = Store.get('currentSong');
        if (!song) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title || 'Unknown',
            artist: song.artist || 'Unknown Artist',
            album: song.album || 'Unknown Album',
            artwork: song.thumbnail ? [{ src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }] : []
        });
    }

    async loadSong(song) {
        this.stop();
        Store.set('currentSong', song);
        Store.set('currentTime', 0);
        Store.set('duration', song.duration || 0);

        if (song.blob) {
            const url = URL.createObjectURL(song.blob);
            this.audio.src = url;
            this._currentBlobUrl = url;
        } else {
            this.audio.src = '';
            Store.showNotification('No audio data available', 'error');
            return;
        }

        this._updateMediaSession();
        await DB.addToHistory(song.id, 0);
        Store.loadHistory();
    }

    async play() {
        if (!this._init) await this.initAudioContext();
        if (this.audio.paused && this.audio.src) {
            try {
                await this.audio.play();
                this._startWaveform();
            } catch (e) {
                console.error('Play failed:', e);
                Store.showNotification('Playback failed', 'error');
            }
        } else if (!this.audio.src) {
            const queue = Store.get('queue');
            if (queue.length > 0) {
                await this.loadSong(queue[0]);
                await this.audio.play();
                this._startWaveform();
            }
        }
    }

    pause() {
        this.audio.pause();
        this._stopWaveform();
    }

    stop() {
        this.audio.pause();
        this.audio.src = '';
        if (this._currentBlobUrl) {
            URL.revokeObjectURL(this._currentBlobUrl);
            this._currentBlobUrl = null;
        }
        Store.set('isPlaying', false);
        Store.set('currentTime', 0);
        this._stopWaveform();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    async next() {
        const queue = Store.get('queue');
        if (queue.length === 0) return;
        let nextIndex = Store.get('queueIndex') + 1;
        const shuffle = Store.get('shuffle');
        const repeat = Store.get('repeat');

        if (shuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else if (repeat === 'one') {
            nextIndex = Store.get('queueIndex');
        } else if (nextIndex >= queue.length) {
            if (repeat === 'all') {
                nextIndex = 0;
            } else {
                this.pause();
                Store.set('queueIndex', -1);
                return;
            }
        }

        Store.set('queueIndex', nextIndex);
        const song = queue[nextIndex];
        if (song) {
            await this.loadSong(song);
            this.play();
        }
    }

    async previous() {
        const queue = Store.get('queue');
        if (queue.length === 0) return;
        let prevIndex = Store.get('queueIndex') - 1;
        const shuffle = Store.get('shuffle');

        if (shuffle) {
            prevIndex = Math.floor(Math.random() * queue.length);
        } else if (prevIndex < 0) {
            prevIndex = queue.length - 1;
        }

        Store.set('queueIndex', prevIndex);
        const song = queue[prevIndex];
        if (song) {
            await this.loadSong(song);
            this.play();
        }
    }

    seek(time) {
        if (this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
        }
    }

    seekRelative(seconds) {
        this.seek(this.audio.currentTime + seconds);
    }

    setVolume(vol) {
        this.audio.volume = Utils.clamp(vol, 0, 1);
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        Store.set('muted', this.audio.muted);
    }

    setPlaybackSpeed(speed) {
        this.audio.playbackRate = speed;
        Store.set('playbackSpeed', speed);
    }

    setCrossfade(seconds) {
        Store.set('crossfade', seconds);
    }

    _onTimeUpdate() {
        Store.set('currentTime', this.audio.currentTime);
    }

    _onLoadedMetadata() {
        Store.set('duration', this.audio.duration);
    }

    async _onEnded() {
        const crossfade = Store.get('crossfade');
        if (crossfade > 0) {
            this._applyCrossfade();
        }
        await this.next();
    }

    _onError(e) {
        console.error('Audio error:', e);
        Store.showNotification('Playback error occurred', 'error');
    }

    _applyCrossfade() {
        const duration = Store.get('crossfade');
        const fadeOutInterval = 50;
        const steps = Math.floor((duration * 1000) / fadeOutInterval);
        const stepSize = 1 / steps;
        let currentStep = 0;

        if (this._crossfadeTimer) {
            clearInterval(this._crossfadeTimer);
        }

        this._crossfadeTimer = setInterval(() => {
            currentStep++;
            const vol = Math.max(0, 1 - (currentStep * stepSize));
            this.audio.volume = vol;
            if (currentStep >= steps) {
                clearInterval(this._crossfadeTimer);
                this.audio.volume = Store.get('volume');
            }
        }, fadeOutInterval);
    }

    fadeIn(duration = 2000) {
        this.audio.volume = 0;
        this.play();
        const steps = 50;
        const interval = duration / steps;
        const stepSize = Store.get('volume') / steps;
        let step = 0;

        if (this._fadeTimer) clearInterval(this._fadeTimer);

        this._fadeTimer = setInterval(() => {
            step++;
            this.audio.volume = Math.min(step * stepSize, Store.get('volume'));
            if (step >= steps) {
                clearInterval(this._fadeTimer);
                this.audio.volume = Store.get('volume');
            }
        }, interval);
    }

    fadeOut(duration = 2000) {
        const steps = 50;
        const interval = duration / steps;
        const stepSize = this.audio.volume / steps;
        let step = 0;

        if (this._fadeTimer) clearInterval(this._fadeTimer);

        return new Promise(resolve => {
            this._fadeTimer = setInterval(() => {
                step++;
                this.audio.volume = Math.max(0, this.audio.volume - stepSize);
                if (step >= steps) {
                    clearInterval(this._fadeTimer);
                    this.pause();
                    this.audio.volume = Store.get('volume');
                    resolve();
                }
            }, interval);
        });
    }

    _startWaveform() {
        if (!this.analyser) return;
        const update = () => {
            this.analyser.getByteFrequencyData(this._waveformData);
            document.dispatchEvent(new CustomEvent('waveform', {
                detail: { data: Array.from(this._waveformData) }
            }));
            this._animationFrame = requestAnimationFrame(update);
        };
        update();
    }

    _stopWaveform() {
        if (this._animationFrame) {
            cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        }
    }

    startSleepTimer(minutes) {
        if (this._sleepTimer) clearTimeout(this._sleepTimer);
        const ms = minutes * 60 * 1000;
        this._sleepTimer = setTimeout(() => {
            this.fadeOut(3000);
            Store.showNotification(`Sleep timer: ${minutes} min elapsed, playback stopped`, 'info');
        }, ms);
        Store.set('sleepTimer', minutes);
        Store.showNotification(`Sleep timer set for ${minutes} minutes`, 'info');
    }

    cancelSleepTimer() {
        if (this._sleepTimer) {
            clearTimeout(this._sleepTimer);
            this._sleepTimer = null;
        }
        Store.set('sleepTimer', null);
    }

    getAudioContext() {
        return this.audioContext;
    }

    getAnalyser() {
        return this.analyser;
    }

    getWaveformData() {
        return Array.from(this._waveformData);
    }

    getCurrentPosition() {
        return this.audio.currentTime;
    }

    getDuration() {
        return this.audio.duration;
    }

    isPlaying() {
        return !this.audio.paused;
    }
}

window.Player = new AudioPlayer();
