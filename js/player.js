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
        this._waveformData = new Uint8Array(128);
        this._animationFrame = null;
        this._reverb = null;
        this._echo = null;
        this._bassBoost = null;
        this._effectsConnected = false;
        this._widgetChannel = null;
        this._setupAudio();
        this._setupEventListeners();
        this._setupMediaSession();
        this._setupWidget();
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
            this.analyser.fftSize = 256;
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

    _setupWidget() {
        try {
            this._widgetChannel = new BroadcastChannel('audivo-widget');
            this._widgetChannel.onmessage = (e) => {
                if (!e.data) return;
                switch (e.data.type) {
                    case 'request-state':
                    case 'state-update':
                        this._broadcastWidgetState();
                        break;
                    case 'command':
                        switch (e.data.action) {
                            case 'play': this.play(); break;
                            case 'pause': this.pause(); break;
                            case 'prev': this.previous(); break;
                            case 'next': this.next(); break;
                            case 'seek':
                                if (e.data.time !== undefined) this.seek(e.data.time);
                                break;
                        }
                        break;
                }
            };
        } catch (e) {}
    }

    _broadcastWidgetState() {
        if (!this._widgetChannel) return;
        const song = Store.get('currentSong');
        const playing = !this.audio.paused;
        this._widgetChannel.postMessage({
            type: 'state-update',
            title: song?.title || null,
            artist: song?.artist || null,
            thumbnail: song?.thumbnail || null,
            playing,
            currentTime: this.audio.currentTime || 0,
            duration: this.audio.duration || 0
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
        this._effectsApplied = false;
        if (this._sleepTimerEnd && song.duration) {
            const trackRemaining = (song.duration - 5) * 1000;
            const timerRemaining = this._sleepTimerEnd - Date.now();
            if (trackRemaining < timerRemaining) {
                this._sleepTimerEnd = Date.now() + trackRemaining;
                clearTimeout(this._sleepTimer);
                this._sleepTimer = setTimeout(() => {
                    this._sleepTimerEnd = null;
                    this.fadeOut(3000);
                    Store.showNotification('Sleep timer: elapsed, playback stopped', 'info');
                    Store.set('sleepTimer', null);
                }, trackRemaining);
            }
        }
        const { blob, ...meta } = song;
        Store.set('currentSong', meta);
        Store.set('currentTime', 0);
        Store.set('duration', song.duration || 0);

        if (this._currentBlobUrl) {
            URL.revokeObjectURL(this._currentBlobUrl);
            this._currentBlobUrl = null;
        }
        if (song.blob && song.blob instanceof Blob) {
            const url = URL.createObjectURL(song.blob);
            this.audio.src = url;
            this._currentBlobUrl = url;
        } else if (song.blob) {
            try {
                const reconstructed = new Blob([song.blob], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(reconstructed);
                this.audio.src = url;
                this._currentBlobUrl = url;
            } catch (e) {
                this.audio.src = '';
                Store.showNotification('Failed to load audio data', 'error');
                return;
            }
        } else {
            this.audio.src = '';
            Store.showNotification('No audio data available', 'error');
            return;
        }

        this._updateMediaSession();
        this._broadcastWidgetState();
        try {
            await DB.addToHistory(song.id, 0);
        } catch (e) {
            console.warn('Failed to add to history:', e);
        }
        Store.loadHistory();
    }

    async play() {
        if (!this._init) await this.initAudioContext();
        if (this._init && !this._effectsApplied) {
            const fx = Store.get('effects') || { reverb: 0, echo: 0, bassBoost: 0 };
            const hasFx = fx.reverb > 0 || fx.echo > 0 || fx.bassBoost > 0;
            if (hasFx) {
                await this.setEffects();
            }
            this._effectsApplied = true;
        }
        if (this.audio.paused && this.audio.src) {
            try {
                await this.audio.play();
                this._startWaveform();
                this._broadcastWidgetState();
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
                this._broadcastWidgetState();
            }
        }
    }

    pause() {
        this.audio.pause();
        this._stopWaveform();
        this._broadcastWidgetState();
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
            const path = window.location.pathname;
            if (path === '/player' || path.endsWith('/player')) {
                PlayerPage.render();
            }
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
        const clamped = Utils.clamp(vol, 0, 1);
        this.audio.volume = clamped;
        Store.set('volume', clamped);
        const slider = document.getElementById('settings-volume');
        if (slider) slider.value = clamped;
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

    updateEqualizer() {
        if (!this._eqFilters) this._eqFilters = {};
        const eq = Store.get('equalizer');
        if (!this.audioContext) return;
        const freqs = Object.keys(eq);
        for (const freq of freqs) {
            if (!this._eqFilters[freq]) {
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = parseInt(freq);
                filter.Q.value = 1.4;
                filter.gain.value = eq[freq];
                if (this._lastEqNode) {
                    this._lastEqNode.connect(filter);
                }
                this._lastEqNode = filter;
                this._eqFilters[freq] = filter;
            } else {
                this._eqFilters[freq].gain.value = eq[freq];
            }
        }
        const anyActive = Object.values(eq).some(v => v !== 0);
        if (anyActive && !this._eqConnected && this._lastEqNode) {
            this.gainNode.disconnect();
            this._lastEqNode.connect(this.gainNode);
            this._eqConnected = true;
        } else if (!anyActive && this._eqConnected) {
            this.gainNode.disconnect();
            this.analyser.connect(this.gainNode);
            this._eqConnected = false;
        }
    }

    async _createReverbImpulse(duration = 2, decay = 2) {
        const rate = this.audioContext.sampleRate;
        const length = rate * duration;
        const impulse = this.audioContext.createBuffer(2, length, rate);
        for (let ch = 0; ch < 2; ch++) {
            const data = impulse.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        return impulse;
    }

    async setEffects() {
        if (!this.audioContext) return;
        this._effectsApplied = false;
        const fx = Store.get('effects') || { reverb: 0, echo: 0, bassBoost: 0 };

        // Reverb
        if (fx.reverb > 0 && !this._reverb) {
            this._reverb = this.audioContext.createConvolver();
            this._reverb.buffer = await this._createReverbImpulse(2, 2);
            this._reverbWet = this.audioContext.createGain();
            this._reverbWet.gain.value = fx.reverb / 100;
        } else if (fx.reverb > 0 && this._reverbWet) {
            this._reverbWet.gain.value = fx.reverb / 100;
        } else if (fx.reverb === 0 && this._reverb) {
            this._reverb = null;
            this._reverbWet = null;
        }

        // Echo
        if (fx.echo > 0 && !this._echo) {
            this._echo = this.audioContext.createDelay(2);
            this._echo.delayTime.value = 0.3;
            this._echoFeedback = this.audioContext.createGain();
            this._echoFeedback.gain.value = fx.echo / 150;
            this._echoFilter = this.audioContext.createBiquadFilter();
            this._echoFilter.type = 'lowpass';
            this._echoFilter.frequency.value = 2000;
            this._echo.connect(this._echoFeedback);
            this._echoFeedback.connect(this._echoFilter);
            this._echoFilter.connect(this._echo);
            this._echoGain = this.audioContext.createGain();
            this._echoGain.gain.value = fx.echo / 100;
        } else if (fx.echo > 0 && this._echoGain) {
            this._echoGain.gain.value = fx.echo / 100;
            if (this._echoFeedback) this._echoFeedback.gain.value = fx.echo / 150;
        } else if (fx.echo === 0 && this._echo) {
            this._echo = null;
            this._echoFeedback = null;
            this._echoFilter = null;
            this._echoGain = null;
        }

        // Bass boost
        if (fx.bassBoost > 0 && !this._bassBoost) {
            this._bassBoost = this.audioContext.createBiquadFilter();
            this._bassBoost.type = 'lowshelf';
            this._bassBoost.frequency.value = 100;
            this._bassBoost.gain.value = fx.bassBoost * 0.6;
        } else if (fx.bassBoost > 0 && this._bassBoost) {
            this._bassBoost.gain.value = fx.bassBoost * 0.6;
        } else if (fx.bassBoost === 0 && this._bassBoost) {
            this._bassBoost = null;
        }

        this._connectEffects();
    }

    _connectEffects() {
        this._disconnectEffects();
        const input = this._eqConnected ? this._lastEqNode : this.analyser;

        let node = input;

        if (this._bassBoost) {
            node.connect(this._bassBoost);
            node = this._bassBoost;
        }

        const hasReverb = !!this._reverb;
        const hasEcho = !!this._echo;

        if (hasReverb || hasEcho) {
            const fxSplit = this.audioContext.createGain();
            fxSplit.gain.value = 1;
            node.connect(fxSplit);

            if (hasReverb) {
                const reverbIn = this.audioContext.createGain();
                reverbIn.gain.value = 1;
                fxSplit.connect(reverbIn);
                reverbIn.connect(this._reverb);
                this._reverb.connect(this._reverbWet);
                this._reverbWet.connect(this.gainNode);
            }

            if (hasEcho) {
                const echoIn = this.audioContext.createGain();
                echoIn.gain.value = 1;
                fxSplit.connect(echoIn);
                echoIn.connect(this._echo);
                this._echo.connect(this._echoFeedback);
                this._echoFeedback.connect(this._echoFilter);
                this._echoFilter.connect(this._echo);
                this._echo.connect(this._echoGain);
                this._echoGain.connect(this.gainNode);
            }

            const dryGain = this.audioContext.createGain();
            dryGain.gain.value = hasReverb ? Math.max(0.3, 1 - (Store.get('effects')?.reverb || 0) / 150) : 1;
            fxSplit.connect(dryGain);
            dryGain.connect(this.gainNode);
            this._fxSplit = fxSplit;
            this._fxDryGain = dryGain;
        } else {
            node.connect(this.gainNode);
        }
        this.gainNode.connect(this.audioContext.destination);
        this._effectsConnected = true;
    }

    _disconnectEffects() {
        try { this.gainNode.disconnect(); } catch(e) {}
        const input = this._eqConnected ? this._lastEqNode : this.analyser;
        try { input.disconnect(); } catch(e) {}
        try { if (this._bassBoost) this._bassBoost.disconnect(); } catch(e) {}
        try { if (this._fxSplit) this._fxSplit.disconnect(); } catch(e) {}
        try { if (this._fxDryGain) this._fxDryGain.disconnect(); } catch(e) {}
        try { if (this._reverb) this._reverb.disconnect(); } catch(e) {}
        try { if (this._reverbWet) this._reverbWet.disconnect(); } catch(e) {}
        try { if (this._echo) this._echo.disconnect(); } catch(e) {}
        try { if (this._echoFeedback) this._echoFeedback.disconnect(); } catch(e) {}
        try { if (this._echoFilter) this._echoFilter.disconnect(); } catch(e) {}
        try { if (this._echoGain) this._echoGain.disconnect(); } catch(e) {}
        this._effectsConnected = false;
    }

    _onTimeUpdate() {
        Store.set('currentTime', this.audio.currentTime);
        if (!this._widgetThrottle) {
            this._widgetThrottle = true;
            setTimeout(() => {
                this._broadcastWidgetState();
                this._widgetThrottle = false;
            }, 1000);
        }
    }

    _onLoadedMetadata() {
        Store.set('duration', this.audio.duration);
    }

    async _onEnded() {
        const crossfade = Store.get('crossfade');
        if (crossfade > 0) {
            await this._applyCrossfade();
        }
        await this.next();
    }

    _onError(e) {
        console.error('Audio error:', e);
        Store.showNotification('Playback error occurred', 'error');
    }

    _applyCrossfade() {
        return new Promise(resolve => {
            const duration = Store.get('crossfade');
            const userVolume = Store.get('volume');
            const fadeOutInterval = 50;
            const steps = Math.floor((duration * 1000) / fadeOutInterval);
            const stepSize = userVolume / steps;
            let currentStep = 0;

            if (this._crossfadeTimer) {
                clearInterval(this._crossfadeTimer);
            }

            this._crossfadeTimer = setInterval(() => {
                currentStep++;
                const vol = Math.max(0, userVolume - (currentStep * stepSize));
                this.audio.volume = vol;
                if (currentStep >= steps) {
                    clearInterval(this._crossfadeTimer);
                    this.audio.volume = Store.get('volume');
                    resolve();
                }
            }, fadeOutInterval);
        });
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
        this._sleepTimerEnd = Date.now() + ms;
        this._sleepTimer = setTimeout(() => {
            this._sleepTimerEnd = null;
            this.fadeOut(3000);
            Store.showNotification(`Sleep timer: elapsed, playback stopped`, 'info');
            Store.set('sleepTimer', null);
        }, ms);
        Store.set('sleepTimer', minutes);
        Store.showNotification(`Sleep timer set for ${minutes} minutes`, 'info');
    }

    cancelSleepTimer() {
        if (this._sleepTimer) {
            clearTimeout(this._sleepTimer);
            this._sleepTimer = null;
        }
        this._sleepTimerEnd = null;
        Store.set('sleepTimer', null);
    }

    getSleepTimerRemaining() {
        if (!this._sleepTimerEnd) return null;
        const remaining = Math.max(0, this._sleepTimerEnd - Date.now());
        if (remaining <= 0) {
            this._sleepTimerEnd = null;
            return null;
        }
        return remaining;
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
