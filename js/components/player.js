const PlayerPage = {
    _unsubs: [],
    _waveformBars: [],

    async render() {
        const song = Store.get('currentSong');
        const queue = Store.get('queue');
        const isPlaying = Store.get('isPlaying');
        const currentTime = Store.get('currentTime');
        const duration = Store.get('duration');
        const volume = Store.get('volume');
        const muted = Store.get('muted');
        const shuffle = Store.get('shuffle');
        const repeat = Store.get('repeat');
        const speed = Store.get('playbackSpeed');

        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="h-full flex flex-col pb-28 md:pb-32">
                <div class="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 p-4 md:p-8 ${Store.get('carMode') ? 'scale-110' : ''}">
                    <div class="w-full max-w-md md:w-80 lg:w-96">
                        <div class="relative aspect-square rounded-2xl overflow-hidden shadow-2xl" style="background:var(--surface); box-shadow:0 20px 60px var(--shadow);">
                            ${song?.thumbnail 
                                ? `<img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover transition-all duration-500">`
                                : `<div class="w-full h-full flex items-center justify-center"><svg class="w-24 h-24" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                            }
                            <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,0.4), transparent);"></div>
                        </div>
                    </div>

                    <div class="flex-1 w-full max-w-lg">
                        <div class="mb-2">
                            <h1 class="text-2xl md:text-3xl font-bold truncate" style="color:var(--text);">${song ? Utils.htmlEncode(song.title) : 'No track selected'}</h1>
                            <p class="text-base mt-1" style="color:var(--text-secondary);">${song ? Utils.htmlEncode(song.artist) : 'Select a song to play'}</p>
                        </div>

                        <div id="waveform-container" class="h-16 md:h-20 mb-4 rounded-xl overflow-hidden" style="background:var(--surface);">
                            <canvas id="waveform-canvas" class="w-full h-full"></canvas>
                        </div>

                        <div class="mb-2">
                            <div class="relative h-1.5 rounded-full cursor-pointer group" style="background:var(--surface);" id="seek-bar">
                                <div class="absolute left-0 top-0 h-full rounded-full" style="background:var(--primary); width:${duration > 0 ? (currentTime / duration * 100) : 0}%; transition:width 0.1s linear;"></div>
                                <div class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                    style="background:var(--primary); left:${duration > 0 ? (currentTime / duration * 100) : 0}%; transform:translate(-50%, -50%); box-shadow:0 0 10px var(--primary);"></div>
                            </div>
                            <div class="flex justify-between mt-1">
                                <span class="text-xs" style="color:var(--text-muted);">${Utils.formatTime(currentTime)}</span>
                                <span class="text-xs" style="color:var(--text-muted);">${Utils.formatTime(duration)}</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-center gap-3 md:gap-4 mb-4 ${Store.get('carMode') ? 'scale-125 my-6' : ''}">
                            <button id="btn-shuffle" class="p-2 rounded-full transition-all duration-200" style="color:${shuffle ? 'var(--primary)' : 'var(--text-secondary)'};">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            </button>
                            <button id="btn-prev" class="p-2 rounded-full transition-all duration-200" style="color:var(--text-secondary);">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                            </button>
                            <button id="btn-play-pause" class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105" style="background:var(--primary); color:white; box-shadow:0 4px 20px var(--primary);">
                                ${isPlaying 
                                    ? `<svg class="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
                                    : `<svg class="w-7 h-7 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`}
                            </button>
                            <button id="btn-next" class="p-2 rounded-full transition-all duration-200" style="color:var(--text-secondary);">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                            </button>
                            <button id="btn-repeat" class="p-2 rounded-full transition-all duration-200" style="color:${repeat !== 'none' ? 'var(--primary)' : 'var(--text-secondary)'};">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                ${repeat === 'one' ? '<span class="absolute text-[8px] font-bold">1</span>' : ''}
                            </button>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2 flex-1">
                                <button id="btn-volume" class="p-1.5 rounded" style="color:var(--text-secondary);">
                                    ${muted || volume === 0 
                                        ? `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
                                        : `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`}
                                </button>
                                <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="${muted ? 0 : volume}" 
                                    class="w-20 md:w-24 h-1 rounded-full appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="flex flex-wrap gap-1.5">
                                    ${[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => `
                                        <button class="speed-btn px-2.5 py-1 rounded-lg text-xs transition-all ${speed === s ? 'ring-2' : 'hover:scale-105'}" 
                                            data-speed="${s}"
                                            style="${speed === s ? 'background:var(--primary); color:white;' : 'background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);'}">${s}x</button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 flex items-center gap-2 ${Store.get('carMode') ? 'scale-125' : ''}">
                            <button id="btn-car-mode" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200" style="background:var(--surface); color:${Store.get('carMode') ? 'var(--primary)' : 'var(--text-secondary)'}; border:1px solid var(--border);" title="Car Mode">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                            </button>
                            <button onclick="PlayerPage._toggleFav('${song.id}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200" style="background:var(--surface); color:${song.favorite ? 'var(--primary)' : 'var(--text-secondary)'}; border:1px solid var(--border);">
                                <svg class="w-3.5 h-3.5" fill="${song.favorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                ${song.favorite ? 'Favorited' : 'Favorite'}
                            </button>
                            <button onclick="PlayerPage._addToQueue('${song.id}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                Add to Queue
                            </button>
                            <button onclick="PlayerPage._toggleLyrics()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200" style="background:var(--surface); color:${Store.get('lyricsPanelOpen') ? 'var(--primary)' : 'var(--text-secondary)'}; border:1px solid var(--border);">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4H6l-1 0a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-2.5M18 13.5l-7 7M13.5 4v4a2 2 0 002 2h4M13.5 4L18 8.5"/></svg>
                                Lyrics
                            </button>
                        </div>
                        `}

                        <div id="sleep-timer-section" class="mt-4">
                            ${this._renderSleepTimer()}
                        </div>

                        <div id="lyrics-section" class="mt-4 ${Store.get('lyricsPanelOpen') ? '' : 'hidden'}">
                            ${this._renderLyrics()}
                        </div>
                    </div>
                </div>

                <div id="queue-panel" class="px-4 md:px-8 pb-4">
                    <button id="toggle-queue" class="flex items-center gap-2 text-sm font-medium mb-2" style="color:var(--text-secondary);">
                        <svg id="queue-arrow" class="w-4 h-4 transition-transform duration-200 ${(Store.get('queuePanelOpen') ? 'rotate-90' : '')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        Queue (${queue.length})
                    </button>
                    <div id="queue-actions" class="flex gap-1.5 mb-2 ${queue.length > 0 ? '' : 'hidden'}">
                        <button id="btn-shuffle-all" class="px-2.5 py-1 rounded-lg text-xs transition-all hover:scale-105" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">Shuffle All</button>
                        <button id="btn-sort-queue" class="px-2.5 py-1 rounded-lg text-xs transition-all hover:scale-105" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">A-Z</button>
                    </div>
                    <div id="queue-list" class="${(queue.length > 0 && Store.get('queuePanelOpen') ? '' : 'hidden')} space-y-1 max-h-40 overflow-y-auto">
                        ${queue.map((s, i) => `
                            <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === Store.get('queueIndex') ? 'active' : ''} transition-all queue-item cursor-pointer"
                                draggable="true"
                                style="${i === Store.get('queueIndex') ? 'background:var(--surface-active); color:var(--primary);' : 'color:var(--text-secondary); hover:background:var(--surface-hover);'}"
                                data-queue-index="${i}"
                                onclick="PlayerPage._playQueueIndex(${i})">
                                <span class="text-xs w-4 flex-shrink-0 cursor-grab" style="color:var(--text-muted);" title="Drag to reorder">${i === Store.get('queueIndex') ? '▶' : '⋮'}</span>
                                <span class="flex-1 truncate">${Utils.htmlEncode(s.title)}</span>
                                <span class="text-xs" style="color:var(--text-muted);">${Utils.htmlEncode(s.artist)}</span>
                                <button onclick="event.stopPropagation(); PlayerPage._removeFromQueue(${i})" class="p-1 rounded-lg transition-all hover:scale-110" style="color:var(--text-muted); hover:color:#ef4444; hover:background:rgba(239,68,68,0.1);">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this._bindEvents();
        this._startWaveformDrawing();
        this._startSleepCountdown();
    },

    _bindEvents() {
        document.getElementById('btn-play-pause')?.addEventListener('click', () => Player.togglePlay());
        document.getElementById('btn-next')?.addEventListener('click', () => Player.next());
        document.getElementById('btn-prev')?.addEventListener('click', () => Player.previous());

        document.getElementById('btn-shuffle')?.addEventListener('click', () => {
            Store.set('shuffle', !Store.get('shuffle'));
            this.render();
        });

        document.getElementById('btn-repeat')?.addEventListener('click', () => {
            const modes = ['none', 'all', 'one'];
            const current = Store.get('repeat');
            const next = modes[(modes.indexOf(current) + 1) % modes.length];
            Store.set('repeat', next);
            this.render();
        });

        document.getElementById('btn-car-mode')?.addEventListener('click', () => {
            const enabled = !Store.get('carMode');
            Store.set('carMode', enabled);
            document.body.classList.toggle('car-mode', enabled);
            this.render();
        });
        document.getElementById('btn-volume')?.addEventListener('click', () => Player.toggleMute());

        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                Player.setVolume(parseFloat(e.target.value));
            });
        }

        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.dataset.speed);
                Player.setPlaybackSpeed(speed);
                document.querySelectorAll('.speed-btn').forEach(b => {
                    b.style.background = 'var(--surface)';
                    b.style.color = 'var(--text-secondary)';
                    b.style.border = '1px solid var(--border)';
                });
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
                btn.style.border = 'none';
            });
        });

        const seekBar = document.getElementById('seek-bar');
        if (seekBar) {
            seekBar.addEventListener('click', (e) => {
                const rect = seekBar.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const duration = Store.get('duration');
                Player.seek(ratio * duration);
            });
        }

        document.getElementById('toggle-queue')?.addEventListener('click', () => {
            const open = !Store.get('queuePanelOpen');
            Store.set('queuePanelOpen', open);
            const list = document.getElementById('queue-list');
            const arrow = document.getElementById('queue-arrow');
            if (list) list.classList.toggle('hidden', !open);
            if (arrow) arrow.classList.toggle('rotate-90', open);
        });

        document.getElementById('btn-shuffle-all')?.addEventListener('click', () => {
            const songs = Store.get('songs');
            if (songs.length === 0) return;
            const shuffled = Utils.shuffleArray([...songs]);
            Store.setQueue(shuffled, 0);
            Player.loadSong(shuffled[0]);
            Player.play();
            this.render();
        });

        document.getElementById('btn-sort-queue')?.addEventListener('click', () => {
            const queue = Store.get('queue');
            const sorted = [...queue].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            const current = Store.get('currentSong');
            const newIdx = sorted.findIndex(s => s.id === current?.id);
            Store.setQueue(sorted, newIdx >= 0 ? newIdx : 0);
            this.render();
        });

        this._initQueueDragDrop();
    },

    _startWaveformDrawing() {
        const canvas = document.getElementById('waveform-canvas');
        if (!canvas) return;
        const container = canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        }
        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        const peaks = new Float32Array(128).fill(0);
        let lastTime = 0;

        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        const draw = (time) => {
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;
            ctx.clearRect(0, 0, w, h);

            const data = Player.getWaveformData();
            const isPlaying = Store.get('isPlaying');
            if (data && data.length > 0) {
                const barCount = Math.min(data.length, 64);
                const gap = 3;
                const barWidth = (w - gap * barCount) / barCount;
                const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1db954';

                for (let i = 0; i < barCount; i++) {
                    const value = data[i] || 0;
                    const barH = (value / 255) * h * 0.85;

                    if (barH > peaks[i]) peaks[i] = barH;
                    else peaks[i] = Math.max(0, peaks[i] - dt * 200);

                    const x = i * (barWidth + gap);
                    const radius = Math.min(barWidth / 2, 4);

                    const gradient = ctx.createLinearGradient(0, h, 0, h - barH);
                    gradient.addColorStop(0, primary + '30');
                    gradient.addColorStop(0.5, primary + 'aa');
                    gradient.addColorStop(1, primary);
                    ctx.fillStyle = gradient;

                    if (barWidth > 2 * radius) {
                        ctx.beginPath();
                        ctx.moveTo(x + radius, h - barH);
                        ctx.lineTo(x + barWidth - radius, h - barH);
                        ctx.quadraticCurveTo(x + barWidth, h - barH, x + barWidth, h - barH + radius);
                        ctx.lineTo(x + barWidth, h);
                        ctx.lineTo(x, h);
                        ctx.lineTo(x, h - barH + radius);
                        ctx.quadraticCurveTo(x, h - barH, x + radius, h - barH);
                        ctx.fill();
                    } else {
                        ctx.fillRect(x, h - barH, barWidth, barH);
                    }

                    if (peaks[i] > 4) {
                        ctx.fillStyle = primary;
                        ctx.fillRect(x, h - peaks[i] - 3, barWidth, 2);
                    }
                }
            }

            if (!document.hidden && isPlaying) {
                this._waveformFrame = requestAnimationFrame(draw);
            } else if (!isPlaying) {
                this._waveformFrame = requestAnimationFrame(draw);
            }
        };
        this._waveformFrame = requestAnimationFrame(draw);
    },

    updatePlayButton() {
        const btn = document.getElementById('btn-play-pause');
        if (!btn) return;
        const isPlaying = Store.get('isPlaying');
        btn.innerHTML = isPlaying
            ? `<svg class="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
            : `<svg class="w-7 h-7 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    },

    updateProgress() {
        const currentTime = Store.get('currentTime');
        const duration = Store.get('duration');
        const seekBar = document.getElementById('seek-bar');
        if (seekBar) {
            const fill = seekBar.querySelector('div:first-child');
            const thumb = seekBar.querySelector('div:nth-child(2)');
            const pct = duration > 0 ? (currentTime / duration * 100) : 0;
            if (fill) fill.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
        }
        const timeContainer = seekBar?.nextElementSibling;
        if (timeContainer) {
            const spans = timeContainer.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[0].textContent = Utils.formatTime(currentTime);
                spans[1].textContent = Utils.formatTime(duration);
            }
        }
    },

    _stopWaveformDrawing() {
        if (this._waveformFrame) {
            cancelAnimationFrame(this._waveformFrame);
            this._waveformFrame = null;
        }
    },

    async _toggleFav(songId) {
        await DB.toggleFavorite(songId);
        await Store.loadFavorites();
        await Store.loadSongs();
        const song = Store.get('songs').find(s => s.id === songId);
        if (song) Store.set('currentSong', song);
        this._updateFavButton(songId);
    },

    _updateFavButton(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song) return;
        const btn = document.querySelector('[onclick*="_toggleFav"]');
        if (!btn) return;
        btn.style.color = song.favorite ? 'var(--primary)' : 'var(--text-secondary)';
        btn.innerHTML = `
            <svg class="w-3.5 h-3.5" fill="${song.favorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            ${song.favorite ? 'Favorited' : 'Favorite'}
        `;
    },

    _addToQueue(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (song) {
            Store.addToQueue(song);
            Store.showNotification(`Added to queue`, 'success');
        }
    },

    _removeFromQueue(index) {
        const wasCurrent = index === Store.get('queueIndex');
        Store.removeFromQueue(index);
        const queueEl = document.getElementById('queue-list');
        const queue = Store.get('queue');
        if (wasCurrent && queue.length > 0) {
            const nextIdx = Math.min(index, queue.length - 1);
            Store.set('queueIndex', nextIdx);
            Player.loadSong(queue[nextIdx]);
            Player.play();
        }
        if (queueEl) {
            if (queue.length === 0) {
                queueEl.classList.add('hidden');
            } else {
                queueEl.innerHTML = queue.map((s, i) => `
                    <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === Store.get('queueIndex') ? 'active' : ''} transition-all"
                        style="${i === Store.get('queueIndex') ? 'background:var(--surface-active); color:var(--primary);' : 'color:var(--text-secondary); hover:background:var(--surface-hover);'}">
                        <span class="text-xs w-4" style="color:var(--text-muted);">${i + 1}</span>
                        <span class="flex-1 truncate">${Utils.htmlEncode(s.title)}</span>
                        <span class="text-xs" style="color:var(--text-muted);">${Utils.htmlEncode(s.artist)}</span>
                        <button onclick="event.stopPropagation(); PlayerPage._removeFromQueue(${i})" class="p-1 rounded-lg transition-all hover:scale-110" style="color:var(--text-muted); hover:color:#ef4444; hover:background:rgba(239,68,68,0.1);">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                `).join('');
            }
        }
        const toggleBtn = document.getElementById('toggle-queue');
        if (toggleBtn) {
            const countSpan = toggleBtn.childNodes[toggleBtn.childNodes.length - 1];
            if (countSpan) countSpan.textContent = ` Queue (${queue.length})`;
        }
    },

    async _playQueueIndex(index) {
        const queue = Store.get('queue');
        if (index < 0 || index >= queue.length) return;
        Store.set('queueIndex', index);
        await Player.loadSong(queue[index]);
        Player.play();
        this.render();
    },

    _renderSleepTimer() {
        const remaining = Player.getSleepTimerRemaining();
        const presets = [5, 10, 15, 30, 45, 60];

        if (remaining) {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            return `
                <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl" style="background:var(--surface); border:1px solid var(--border);">
                    <svg class="w-4 h-4 flex-shrink-0" style="color:var(--primary);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium" style="color:var(--text-secondary);">Sleep Timer</p>
                        <p class="text-sm font-bold tabular-nums" style="color:var(--primary);" id="sleep-timer-countdown">${mins}:${String(secs).padStart(2, '0')}</p>
                    </div>
                    <button onclick="PlayerPage._cancelSleepTimer()" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105" style="background:#ef4444; color:white;">Cancel</button>
                </div>
            `;
        }

        return `
            <div class="px-3 py-2.5 rounded-xl" style="background:var(--surface); border:1px solid var(--border);">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p class="text-xs font-medium" style="color:var(--text-secondary);">Sleep Timer</p>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-2">
                    ${presets.map(m => `<button onclick="PlayerPage._setSleepTimer(${m})" class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105" style="background:var(--card-bg); color:var(--text-secondary); border:1px solid var(--border);">${m}m</button>`).join('')}
                </div>
                <div class="flex gap-1.5">
                    <input type="number" id="sleep-custom-input" min="1" max="480" placeholder="min" class="w-16 px-2 py-1 rounded-lg text-xs outline-none" style="background:var(--card-bg); color:var(--text); border:1px solid var(--border);">
                    <button onclick="PlayerPage._setCustomSleepTimer()" class="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105" style="background:var(--primary); color:white;">Set</button>
                </div>
            </div>
        `;
    },

    _setSleepTimer(minutes) {
        Player.startSleepTimer(minutes);
        this._updateSleepTimer();
    },

    _setCustomSleepTimer() {
        const input = document.getElementById('sleep-custom-input');
        const minutes = parseInt(input?.value);
        if (!minutes || minutes < 1 || minutes > 480) {
            Store.showNotification('Enter 1-480 minutes', 'warning');
            return;
        }
        Player.startSleepTimer(minutes);
        this._updateSleepTimer();
    },

    _cancelSleepTimer() {
        Player.cancelSleepTimer();
        this._updateSleepTimer();
    },

    _updateSleepTimer() {
        const section = document.getElementById('sleep-timer-section');
        if (section) section.innerHTML = this._renderSleepTimer();
        this._startSleepCountdown();
    },

    _toggleLyrics() {
        const open = !Store.get('lyricsPanelOpen');
        Store.set('lyricsPanelOpen', open);
        const section = document.getElementById('lyrics-section');
        if (section) {
            section.classList.toggle('hidden', !open);
            if (open) {
                section.innerHTML = this._renderLyrics();
                this._loadLyrics();
            }
        }
    },

    _renderLyrics() {
        const lyrics = Store.get('lyrics');
        const loading = Store.get('lyricsLoading');
        const error = Store.get('lyricsError');
        const song = Store.get('currentSong');

        if (!song) return '';

        if (loading) {
            return `<div class="text-center py-8"><div class="w-6 h-6 mx-auto" style="border:2px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite;"></div><p class="text-xs mt-2" style="color:var(--text-muted);">Loading lyrics...</p></div>`;
        }

        if (error) {
            return `<div class="text-center py-6"><p class="text-sm" style="color:var(--text-muted);">${error}</p></div>`;
        }

        if (!lyrics) {
            return `<div class="text-center py-6"><p class="text-sm" style="color:var(--text-muted);">No lyrics found. Tap to search.</p><button onclick="PlayerPage._loadLyrics()" class="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">Search Lyrics</button></div>`;
        }

        // Synced lyrics
        if (lyrics.lines && lyrics.lines.length > 0) {
            const currentTime = Store.get('currentTime');
            const currentIdx = lyrics.lines.findIndex(l => l.time > currentTime);
            const activeIdx = currentIdx > 0 ? currentIdx - 1 : (currentIdx === -1 ? lyrics.lines.length - 1 : 0);
            return `
                <div class="rounded-xl overflow-hidden" style="background:var(--surface); border:1px solid var(--border); max-height:300px; overflow-y:auto;" id="lyrics-container">
                    <div class="p-4 space-y-3" id="lyrics-list">
                        ${lyrics.lines.map((line, i) => `
                            <div class="lyric-line text-sm transition-all duration-300 ${i === activeIdx ? 'active-lyric' : ''}" 
                                data-lyric-idx="${i}"
                                style="color:${i === activeIdx ? 'var(--primary)' : 'var(--text-secondary)'}; font-weight:${i === activeIdx ? '600' : '400'};">
                                ${Utils.htmlEncode(line.text)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Plain lyrics
        if (lyrics.plain) {
            return `
                <div class="rounded-xl overflow-hidden" style="background:var(--surface); border:1px solid var(--border); max-height:300px; overflow-y:auto;">
                    <div class="p-4 text-sm whitespace-pre-line" style="color:var(--text-secondary); line-height:1.8;">
                        ${Utils.htmlEncode(lyrics.plain)}
                    </div>
                </div>
            `;
        }

        return '';
    },

    async _loadLyrics() {
        const song = Store.get('currentSong');
        if (!song) return;

        Store.set('lyricsLoading', true);
        Store.set('lyricsError', null);

        try {
            // Check local DB first
            const local = await DB.getLyrics(song.id);
            if (local) {
                const parsed = local.synced_lyrics ? this._parseLRC(local.synced_lyrics) : null;
                Store.set('lyrics', {
                    plain: local.plain_lyrics,
                    synced: local.synced_lyrics,
                    lines: parsed
                });
                Store.set('lyricsLoading', false);
                if (parsed) this._startLyricsSync();
                const section = document.getElementById('lyrics-section');
                if (section) section.innerHTML = this._renderLyrics();
                return;
            }

            // Fetch from lrclib.net
            const result = await DB.searchLyricsOnline(song.artist, song.title, song.album, song.duration);
            if (result && (result.plainLyrics || result.syncedLyrics)) {
                const parsed = result.syncedLyrics ? this._parseLRC(result.syncedLyrics) : null;
                Store.set('lyrics', {
                    plain: result.plainLyrics || null,
                    synced: result.syncedLyrics || null,
                    lines: parsed
                });
                await DB.saveLyrics(song.id, result.plainLyrics || null, result.syncedLyrics || null);
                if (parsed) this._startLyricsSync();
            } else {
                // Try search fallback
                const query = `${song.artist} ${song.title}`;
                const results = await DB.searchLyricsByQuery(query);
                if (results && results.length > 0) {
                    const best = results[0];
                    const detail = best.id ? await DB.searchLyricsOnline(song.artist, song.title, song.album, song.duration) : null;
                    if (detail && (detail.plainLyrics || detail.syncedLyrics)) {
                        const parsed = detail.syncedLyrics ? this._parseLRC(detail.syncedLyrics) : null;
                        Store.set('lyrics', {
                            plain: detail.plainLyrics || null,
                            synced: detail.syncedLyrics || null,
                            lines: parsed
                        });
                        await DB.saveLyrics(song.id, detail.plainLyrics || null, detail.syncedLyrics || null);
                        if (parsed) this._startLyricsSync();
                    } else {
                        Store.set('lyricsError', 'No lyrics available for this song');
                    }
                } else {
                    Store.set('lyricsError', 'No lyrics found on lrclib.net');
                }
            }
        } catch (e) {
            console.warn('Lyrics load error:', e);
            Store.set('lyricsError', 'Failed to load lyrics');
        }
        Store.set('lyricsLoading', false);
        const section = document.getElementById('lyrics-section');
        if (section) section.innerHTML = this._renderLyrics();
    },

    _parseLRC(lrcText) {
        if (!lrcText) return null;
        const lines = lrcText.split('\n');
        const parsed = [];
        for (const line of lines) {
            const match = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const centiseconds = parseInt(match[3] || '0');
                const time = minutes * 60 + seconds + centiseconds / 100;
                const text = match[4].trim();
                if (text) parsed.push({ time, text });
            }
        }
        return parsed.length > 0 ? parsed.sort((a, b) => a.time - b.time) : null;
    },

    _startLyricsSync() {
        this._stopLyricsSync();
        this._lyricsSyncFrame = requestAnimationFrame(this._updateLyricLine.bind(this));
    },

    _stopLyricsSync() {
        if (this._lyricsSyncFrame) {
            cancelAnimationFrame(this._lyricsSyncFrame);
            this._lyricsSyncFrame = null;
        }
    },

    _updateLyricLine() {
        const lyrics = Store.get('lyrics');
        const currentTime = Store.get('currentTime');
        const container = document.getElementById('lyrics-container');
        if (!lyrics || !lyrics.lines || lyrics.lines.length === 0 || !container) {
            this._stopLyricsSync();
            return;
        }

        const isPlaying = Store.get('isPlaying');
        const currentIdx = lyrics.lines.findIndex(l => l.time > currentTime);
        const activeIdx = currentIdx > 0 ? currentIdx - 1 : (currentIdx === -1 ? lyrics.lines.length - 1 : 0);

        document.querySelectorAll('.lyric-line').forEach((el, i) => {
            const isActive = i === activeIdx;
            if (isActive) {
                el.style.color = 'var(--primary)';
                el.style.fontWeight = '600';
                el.classList.add('active-lyric');
            } else {
                el.style.color = 'var(--text-secondary)';
                el.style.fontWeight = '400';
                el.classList.remove('active-lyric');
            }
        });

        const activeEl = document.querySelector(`.lyric-line[data-lyric-idx="${activeIdx}"]`);
        if (activeEl) {
            const containerRect = container.getBoundingClientRect();
            const elRect = activeEl.getBoundingClientRect();
            const offset = elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2;
            container.scrollTop += offset * 0.1;
        }

        if (isPlaying) {
            this._lyricsSyncFrame = requestAnimationFrame(this._updateLyricLine.bind(this));
        }
    },

    _initQueueDragDrop() {
        let dragSrcIdx = null;
        document.querySelectorAll('.queue-item').forEach(el => {
            el.addEventListener('dragstart', (e) => {
                dragSrcIdx = parseInt(el.dataset.queueIndex);
                e.dataTransfer.effectAllowed = 'move';
                el.style.opacity = '0.5';
            });
            el.addEventListener('dragend', () => {
                el.style.opacity = '';
                document.querySelectorAll('.queue-item').forEach(i => i.style.border = '');
            });
            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                document.querySelectorAll('.queue-item').forEach(i => i.style.border = '');
                el.style.border = '1px dashed var(--primary)';
            });
            el.addEventListener('dragleave', () => {
                el.style.border = '';
            });
            el.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIdx = parseInt(el.dataset.queueIndex);
                if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
                const queue = Store.get('queue').slice();
                const [moved] = queue.splice(dragSrcIdx, 1);
                queue.splice(targetIdx, 0, moved);
                const current = Store.get('currentSong');
                const newIdx = queue.findIndex(s => s.id === current?.id);
                Store.setQueue(queue, newIdx >= 0 ? newIdx : 0);
                this.render();
                dragSrcIdx = null;
            });
        });
    },

    _startSleepCountdown() {
        if (this._sleepCountdownInterval) {
            clearInterval(this._sleepCountdownInterval);
            this._sleepCountdownInterval = null;
        }
        this._sleepCountdownInterval = setInterval(() => {
            const el = document.getElementById('sleep-timer-countdown');
            if (!el) return;
            const remaining = Player.getSleepTimerRemaining();
            if (!remaining) {
                el.textContent = '0:00';
                this._updateSleepTimer();
                clearInterval(this._sleepCountdownInterval);
                this._sleepCountdownInterval = null;
                return;
            }
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            el.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
        }, 1000);
    },

    cleanup() {
        this._stopWaveformDrawing();
        this._stopLyricsSync();
        if (this._sleepCountdownInterval) clearInterval(this._sleepCountdownInterval);
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.PlayerPage = PlayerPage;
