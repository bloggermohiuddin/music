const SettingsPage = {
    _unsubs: [],

    async render() {
        const theme = Theme.getCurrentTheme();
        const themes = Theme.getAllThemes();
        const volume = Store.get('volume');
        const speed = Store.get('playbackSpeed');
        const crossfade = Store.get('crossfade');
        const storageInfo = Store.get('storageInfo');
        const eq = Store.get('equalizer');
        const fx = Store.get('effects') || { reverb: 0, echo: 0, bassBoost: 0 };
        const repeat = Store.get('repeat');
        const shuffle = Store.get('shuffle');

        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32 max-w-3xl mx-auto">
                <h1 class="text-2xl md:text-3xl font-bold mb-6" style="color:var(--text);">Settings</h1>

                <div class="space-y-6">
                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Appearance</h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            ${themes.map(t => `
                                <button onclick="SettingsPage._setTheme('${t.key}')" 
                                    class="p-3 rounded-xl text-center text-sm font-medium transition-all duration-200 ${theme?.key === t.key ? 'ring-2' : ''}"
                                    style="${theme?.key === t.key ? `background:var(--surface-active); color:var(--text); ring-color:var(--primary);` : `background:var(--surface); color:var(--text-secondary); hover:background:var(--surface-hover);`}">
                                    <div class="text-lg mb-1">${t.icon}</div>
                                    ${t.name}
                                </button>
                            `).join('')}
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Playback</h2>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium" style="color:var(--text);">Default Volume</p>
                                    <p class="text-xs" style="color:var(--text-secondary);">${Math.round(volume * 100)}%</p>
                                </div>
                                <input type="range" id="settings-volume" min="0" max="1" step="0.01" value="${volume}" 
                                    class="w-32 h-1.5 rounded-full appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium" style="color:var(--text);">Crossfade</p>
                                    <p class="text-xs" style="color:var(--text-secondary);">${crossfade} seconds</p>
                                </div>
                                <input type="range" id="settings-crossfade" min="0" max="12" step="1" value="${crossfade}" 
                                    class="w-32 h-1.5 rounded-full appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <div>
                                <p class="text-sm font-medium mb-2" style="color:var(--text);">Playback Speed</p>
                                <div class="flex flex-wrap gap-1.5">
                                    ${[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => `
                                        <button class="settings-speed-btn px-2.5 py-1 rounded-lg text-xs transition-all ${speed === s ? 'ring-2' : 'hover:scale-105'}" 
                                            data-speed="${s}"
                                            style="${speed === s ? 'background:var(--primary); color:white;' : 'background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);'}">${s}x</button>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-medium mb-2" style="color:var(--text);">Default Repeat</p>
                                <div class="flex gap-1.5">
                                    ${['none', 'all', 'one'].map(r => `
                                        <button class="settings-repeat-btn px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                            data-repeat="${r}"
                                            style="${repeat === r ? 'background:var(--primary); color:white;' : 'background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);'}">${r === 'none' ? 'Off' : r === 'all' ? 'All' : 'One'}</button>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-medium mb-2" style="color:var(--text);">Default Shuffle</p>
                                <button id="settings-shuffle-toggle" class="relative w-12 h-6 rounded-full transition-all"
                                    style="background:${shuffle ? 'var(--primary)' : 'var(--surface)'};">
                                    <div class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all shadow"
                                        style="background:white; transform:translateX(${shuffle ? '24px' : '0'});"></div>
                                </button>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium" style="color:var(--text);">Car Mode</p>
                                    <p class="text-xs" style="color:var(--text-secondary);">Larger controls for driving</p>
                                </div>
                                <button id="settings-car-mode-toggle" class="relative w-12 h-6 rounded-full transition-all"
                                    style="background:${Store.get('carMode') ? 'var(--primary)' : 'var(--surface)'};">
                                    <div class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all shadow"
                                        style="background:white; transform:translateX(${Store.get('carMode') ? '24px' : '0'});"></div>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Equalizer</h2>
                        <div class="flex items-center justify-between mb-3">
                            <button id="eq-reset" class="text-xs px-2.5 py-1 rounded-lg transition-all" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">Reset</button>
                            <button id="eq-toggle" class="text-xs px-2.5 py-1 rounded-lg transition-all" 
                                style="background:${Object.values(eq).some(v => v !== 0) ? 'var(--primary); color:white;' : 'var(--surface); color:var(--text-secondary); border:1px solid var(--border);'}">
                                ${Object.values(eq).some(v => v !== 0) ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                        <div class="flex items-end gap-1 h-32" id="eq-sliders">
                            ${Object.entries(eq).map(([freq, gain]) => `
                                <div class="flex-1 flex flex-col items-center gap-1">
                                    <input type="range" min="-12" max="12" step="1" value="${gain}" 
                                        class="eq-slider w-6 h-20 appearance-none cursor-pointer" data-freq="${freq}"
                                        orient="vertical"
                                        style="background:var(--surface); accent-color:var(--primary); writing-mode:vertical-lr; direction:rtl;">
                                    <span class="text-[9px]" style="color:var(--text-muted);">${freq >= 1000 ? (freq/1000)+'k' : freq}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p class="text-xs text-center mt-2" style="color:var(--text-muted);">-12dB to +12dB</p>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Storage</h2>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <p class="text-sm" style="color:var(--text);">Total Songs</p>
                                <p class="text-sm font-medium" style="color:var(--text);">${storageInfo.songCount || 0}</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <p class="text-sm" style="color:var(--text);">Total Size</p>
                                <p class="text-sm font-medium" style="color:var(--text);">${Utils.formatSize(storageInfo.totalSize || 0)}</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <p class="text-sm" style="color:var(--text);">Thumbnails</p>
                                <p class="text-sm font-medium" style="color:var(--text);">${storageInfo.thumbnailCount || 0}</p>
                            </div>
                            <div class="flex flex-wrap gap-2 mt-4">
                                <button onclick="SettingsPage._clearStorage('songs')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:#ef4444; border:1px solid var(--border);">Delete All Songs</button>
                                <button onclick="SettingsPage._clearCache()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:#f59e0b; border:1px solid var(--border);">Clear Cache</button>
                                <button onclick="SettingsPage._exportBackup()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">Export Backup</button>
                                <button onclick="document.getElementById('import-backup-input').click()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">Import Backup</button>
                                <input type="file" id="import-backup-input" accept=".json" class="hidden" onchange="SettingsPage._importBackup(this.files[0])">
                            </div>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Audio Effects</h2>
                        <div class="space-y-4">
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <label class="text-sm" style="color:var(--text);">Reverb</label>
                                    <span class="text-xs" style="color:var(--text-muted);" id="fx-reverb-val">${fx.reverb}%</span>
                                </div>
                                <input type="range" min="0" max="100" value="${fx.reverb}" id="fx-reverb" class="w-full h-1.5 rounded-lg appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <label class="text-sm" style="color:var(--text);">Echo</label>
                                    <span class="text-xs" style="color:var(--text-muted);" id="fx-echo-val">${fx.echo}%</span>
                                </div>
                                <input type="range" min="0" max="100" value="${fx.echo}" id="fx-echo" class="w-full h-1.5 rounded-lg appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <label class="text-sm" style="color:var(--text);">Bass Boost</label>
                                    <span class="text-xs" style="color:var(--text-muted);" id="fx-bass-val">${fx.bassBoost}%</span>
                                </div>
                                <input type="range" min="0" max="100" value="${fx.bassBoost}" id="fx-bass" class="w-full h-1.5 rounded-lg appearance-none cursor-pointer" style="background:var(--surface); accent-color:var(--primary);">
                            </div>
                            <button id="fx-reset" class="text-xs px-2.5 py-1 rounded-lg transition-all" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">Reset All Effects</button>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Keyboard Shortcuts</h2>
                        <div class="grid grid-cols-2 gap-2 text-sm" style="color:var(--text-secondary);">
                            <div class="flex justify-between"><span>Space</span><span style="color:var(--text);">Play/Pause</span></div>
                            <div class="flex justify-between"><span>←</span><span style="color:var(--text);">Seek -5s</span></div>
                            <div class="flex justify-between"><span>→</span><span style="color:var(--text);">Seek +5s</span></div>
                            <div class="flex justify-between"><span>↑</span><span style="color:var(--text);">Volume +10%</span></div>
                            <div class="flex justify-between"><span>↓</span><span style="color:var(--text);">Volume -10%</span></div>
                            <div class="flex justify-between"><span>N</span><span style="color:var(--text);">Next track</span></div>
                            <div class="flex justify-between"><span>P</span><span style="color:var(--text);">Previous track</span></div>
                            <div class="flex justify-between"><span>M</span><span style="color:var(--text);">Mute toggle</span></div>
                            <div class="flex justify-between"><span>F</span><span style="color:var(--text);">Fullscreen</span></div>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Listening Stats</h2>
                        <div id="stats-content" class="space-y-4">
                            <p class="text-sm" style="color:var(--text-muted);">Loading stats...</p>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Updates</h2>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium" style="color:var(--text);">App Version</p>
                                <p class="text-xs" style="color:var(--text-secondary);"><span id="app-version">v2.0</span> · Last checked: <span id="update-last-check">Never</span></p>
                            </div>
                            <button id="check-update-btn" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--primary); color:white;">
                                Check for Updates
                            </button>
                        </div>
                        <p id="update-status" class="text-xs mt-2 hidden" style="color:var(--text-muted);"></p>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">About</h2>
                        <div class="space-y-2 text-sm" style="color:var(--text-secondary);">
                            <p>Audivo <span id="app-version-about">v2.0</span></p>
                            <p>Offline-first PWA Music Application</p>
                            <p>All data stored locally in your browser</p>
                            <p>No server, no backend, no tracking</p>
                        </div>
                        <div class="mt-4 flex gap-2">
                            <button onclick="SettingsPage._resetAll()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:#ef4444; border:1px solid var(--border);">Reset All Settings</button>
                            <button onclick="SettingsPage._reloadApp()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--primary); color:white;">
                                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                Reload App
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        `;

        this._bindEvents();
        this._loadStats();
    },

    _bindEvents() {
        document.getElementById('settings-volume')?.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            Player.setVolume(vol);
        });
        document.getElementById('settings-crossfade')?.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            Player.setCrossfade(val);
            Store.set('crossfade', val);
            const cfLabel = document.getElementById('settings-crossfade')?.parentElement?.querySelector('p:last-child');
            if (cfLabel) cfLabel.textContent = val + ' seconds';
        });
        document.querySelectorAll('.settings-speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.dataset.speed);
                Player.setPlaybackSpeed(speed);
                document.querySelectorAll('.settings-speed-btn').forEach(b => {
                    b.style.background = 'var(--surface)';
                    b.style.color = 'var(--text-secondary)';
                    b.style.border = '1px solid var(--border)';
                    b.classList.remove('ring-2');
                });
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
                btn.style.border = 'none';
                btn.classList.add('ring-2');
            });
        });
        document.querySelectorAll('.settings-repeat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const repeat = btn.dataset.repeat;
                Store.set('repeat', repeat);
                document.querySelectorAll('.settings-repeat-btn').forEach(b => {
                    b.style.background = 'var(--surface)';
                    b.style.color = 'var(--text-secondary)';
                    b.style.border = '1px solid var(--border)';
                });
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
                btn.style.border = 'none';
            });
        });
        document.getElementById('settings-car-mode-toggle')?.addEventListener('click', function() {
            const current = Store.get('carMode');
            Store.set('carMode', !current);
            document.body.classList.toggle('car-mode', !current);
            this.style.background = !current ? 'var(--primary)' : 'var(--surface)';
            this.querySelector('div').style.transform = !current ? 'translateX(24px)' : 'translateX(0)';
        });
        document.getElementById('settings-shuffle-toggle')?.addEventListener('click', function() {
            const current = Store.get('shuffle');
            Store.set('shuffle', !current);
            this.style.background = !current ? 'var(--primary)' : 'var(--surface)';
            this.querySelector('div').style.transform = !current ? 'translateX(24px)' : 'translateX(0)';
        });

        // Equalizer
        document.querySelectorAll('.eq-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const freq = e.target.dataset.freq;
                const gain = parseFloat(e.target.value);
                const eq = { ...Store.get('equalizer') };
                eq[freq] = gain;
                Store.set('equalizer', eq);
                Player.updateEqualizer();
            });
        });
        document.getElementById('eq-reset')?.addEventListener('click', () => {
            const eq = { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 };
            Store.set('equalizer', eq);
            Player.updateEqualizer();
            this.render();
        });
        document.getElementById('eq-toggle')?.addEventListener('click', () => {
            const eq = Store.get('equalizer');
            const anyActive = Object.values(eq).some(v => v !== 0);
            if (anyActive) {
                const reset = { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 };
                Store.set('equalizer', reset);
            } else {
                Store.set('equalizer', { 60: 3, 170: 2, 310: 0, 600: -1, 1000: 0, 3000: 1, 6000: 2, 12000: 3, 14000: 2, 16000: 1 });
            }
            Player.updateEqualizer();
            this.render();
        });

        // Fetch version from Service Worker
        const vEl = document.getElementById('app-version');
        const vEl2 = document.getElementById('app-version-about');
        if (vEl && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => {
                vEl.textContent = 'v' + e.data;
                if (vEl2) vEl2.textContent = 'v' + e.data;
            };
            navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
        }
        const lastCheck = localStorage.getItem('update-last-check');
        const lastCheckEl = document.getElementById('update-last-check');
        if (lastCheckEl && lastCheck) lastCheckEl.textContent = lastCheck;

        document.getElementById('check-update-btn')?.addEventListener('click', () => SettingsPage._checkUpdate());

        // Effects
        const fxSliders = [
            { id: 'fx-reverb', key: 'reverb', valId: 'fx-reverb-val' },
            { id: 'fx-echo', key: 'echo', valId: 'fx-echo-val' },
            { id: 'fx-bass', key: 'bassBoost', valId: 'fx-bass-val' }
        ];
        fxSliders.forEach(({ id, key, valId }) => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                const fx = Store.get('effects');
                fx[key] = val;
                Store.set('effects', { ...fx });
                document.getElementById(valId).textContent = val + '%';
                Player.setEffects();
            });
        });
        document.getElementById('fx-reset')?.addEventListener('click', () => {
            Store.set('effects', { reverb: 0, echo: 0, bassBoost: 0 });
            Player.setEffects();
            this.render();
        });
    },

    async _loadStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        try {
            const history = Store.get('history') || [];
            const songs = Store.get('songs') || [];

            // Total listening time (estimate from history play counts * durations)
            let totalSeconds = 0;
            const artistCounts = {};
            const dayCounts = {};
            const now = Date.now();
            const weekMs = 7 * 24 * 60 * 60 * 1000;

            for (const h of history) {
                const song = songs.find(s => s.id === h.song_id);
                if (!song) continue;
                const dur = song.duration || 0;
                totalSeconds += dur;

                // Artist counts
                const artist = song.artist || 'Unknown';
                artistCounts[artist] = (artistCounts[artist] || 0) + 1;

                // Day counts (last 7 days)
                if (h.last_played && (now - h.last_played) < weekMs) {
                    const date = new Date(h.last_played);
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                }
            }

            // Format total time
            const hours = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            // Top artists
            const topArtists = Object.entries(artistCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            const maxCount = topArtists.length > 0 ? topArtists[0][1] : 1;

            // Day order
            const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayData = dayOrder.map(d => ({ day: d, count: dayCounts[d] || 0 }));
            const maxDay = Math.max(...dayData.map(d => d.count), 1);

            container.innerHTML = `
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="p-3 rounded-lg" style="background:var(--surface);">
                        <p class="text-2xl font-bold" style="color:var(--primary);">${history.length}</p>
                        <p class="text-xs" style="color:var(--text-muted);">Songs Played</p>
                    </div>
                    <div class="p-3 rounded-lg" style="background:var(--surface);">
                        <p class="text-2xl font-bold" style="color:var(--primary);">${timeStr}</p>
                        <p class="text-xs" style="color:var(--text-muted);">Listen Time</p>
                    </div>
                    <div class="p-3 rounded-lg" style="background:var(--surface);">
                        <p class="text-2xl font-bold" style="color:var(--primary);">${Object.keys(artistCounts).length}</p>
                        <p class="text-xs" style="color:var(--text-muted);">Artists</p>
                    </div>
                </div>

                ${topArtists.length > 0 ? `
                <div>
                    <p class="text-xs font-semibold mb-2 uppercase tracking-wider" style="color:var(--text-muted);">Top Artists</p>
                    <div class="space-y-2">
                        ${topArtists.map(([name, count]) => `
                            <div class="flex items-center gap-2">
                                <span class="text-xs w-20 truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(name)}</span>
                                <div class="flex-1 h-4 rounded overflow-hidden" style="background:var(--surface);">
                                    <div class="h-full rounded transition-all duration-500" style="background:var(--primary); width:${(count / maxCount) * 100}%;"></div>
                                </div>
                                <span class="text-xs w-6 text-right" style="color:var(--text-muted);">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${history.length > 0 ? `
                <div>
                    <p class="text-xs font-semibold mb-2 uppercase tracking-wider" style="color:var(--text-muted);">Last 7 Days</p>
                    <div class="flex items-end gap-1.5" style="height:80px;">
                        ${dayData.map(d => `
                            <div class="flex-1 flex flex-col items-center gap-1">
                                <div class="w-full rounded-t transition-all duration-500" style="background:var(--primary); height:${d.count > 0 ? Math.max((d.count / maxDay) * 60, 4) : 0}px; min-height:${d.count > 0 ? '4px' : '0'};"></div>
                                <span class="text-[10px]" style="color:var(--text-muted);">${d.day}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${history.length === 0 ? '<p class="text-sm text-center py-4" style="color:var(--text-muted);">Play some songs to see your stats</p>' : ''}
            `;
        } catch (e) {
            container.innerHTML = '<p class="text-sm" style="color:var(--text-muted);">Could not load stats</p>';
        }
    },

    _setTheme(key) {
        Theme.setTheme(key);
        this.render();
    },

    async _clearStorage(type) {
        const ok = await Modal.confirm('Delete All', `Are you sure you want to delete all ${type}? This cannot be undone.`);
        if (!ok) return;
        if (type === 'songs') {
            Player.stop();
            const songs = await DB.getAll('songs');
            for (const s of songs) await DB.deleteSong(s.id);
        }
        await Store.refreshAll();
        this.render();
        Store.showNotification('Storage cleared', 'info');
    },

    async _clearCache() {
        const ok = await Modal.confirm('Clear Cache', 'Delete all cached audio and thumbnails? Songs will remain in your library.');
        if (!ok) return;
        try {
            const names = await caches.keys();
            for (const name of names) await caches.delete(name);
            Store.showNotification('Cache cleared', 'success');
        } catch (e) {
            Store.showNotification('Failed to clear cache', 'error');
        }
    },

    async _exportBackup() {
        try {
            const data = await DB.exportDatabase();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            Utils.downloadBlob(blob, `music-backup-${Date.now()}.json`);
            Store.showNotification('Backup exported successfully', 'success');
        } catch (e) {
            Store.showNotification('Export failed', 'error');
        }
    },

    async _importBackup(file) {
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await DB.importDatabase(data);
            await Store.refreshAll();
            this.render();
            Store.showNotification(`Imported "${file.name}" successfully`, 'success');
        } catch (e) {
            Store.showNotification('Import failed: invalid file', 'error');
        }
    },

    async _reloadApp() {
        const ok = await Modal.confirm('Reload App', 'This will refresh the application. Unsaved data will not be lost.');
        if (!ok) return;
        window.location.reload();
    },

    async _resetAll() {
        const ok = await Modal.confirm('Reset All Settings', 'Reset volume, crossfade, speed, equalizer, and all preferences to defaults? Your songs and playlists will NOT be deleted.');
        if (!ok) return;
        Store.set('volume', 0.8);
        Store.set('playbackSpeed', 1);
        Store.set('crossfade', 0);
        Store.set('repeat', 'none');
        Store.set('shuffle', false);
        Store.set('carMode', false);
        document.body.classList.remove('car-mode');
        Store.set('equalizer', { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 });
        Store.set('effects', { reverb: 0, echo: 0, bassBoost: 0 });
        Player.setVolume(0.8);
        Player.setPlaybackSpeed(1);
        Player.setCrossfade(0);
        Player.updateEqualizer();
        Player.setEffects();
        this.render();
        Store.showNotification('Settings reset to defaults', 'success');
    },

    async _checkUpdate() {
        const btn = document.getElementById('check-update-btn');
        const status = document.getElementById('update-status');
        if (!btn || !status) return;

        btn.disabled = true;
        btn.textContent = 'Checking...';
        status.className = 'text-xs mt-2';
        status.style.color = 'var(--text-muted)';
        status.textContent = 'Checking for updates...';

        try {
            // Get current SW version
            const currentVersion = await new Promise((resolve) => {
                if (!navigator.serviceWorker.controller) { resolve(null); return; }
                const channel = new MessageChannel();
                channel.port1.onmessage = (e) => resolve(e.data);
                channel.port1.onmessageerror = () => resolve(null);
                navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
                setTimeout(() => resolve(null), 3000);
            });

            // Fetch fresh sw.js to check for newer version
            const freshSW = await fetch('/sw.js?_=' + Date.now(), { cache: 'no-store' });
            const freshText = await freshSW.text();
            const versionMatch = freshText.match(/const APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
            const freshVersion = versionMatch ? versionMatch[1] : null;

            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem('update-last-check', timeStr);
            document.getElementById('update-last-check').textContent = timeStr;

            if (!currentVersion || !freshVersion) {
                status.textContent = 'Could not determine version';
                status.style.color = '#ef4444';
                btn.disabled = false;
                btn.textContent = 'Check for Updates';
                return;
            }

            if (currentVersion !== freshVersion) {
                status.textContent = 'Update found (v' + freshVersion + ')! Reloading...';
                status.style.color = 'var(--primary)';
                // Force SW update
                const registration = await navigator.serviceWorker.getRegistration('/');
                if (registration) {
                    await registration.update();
                    if (registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                }
                return;
            }

            // Same version — do standard update check in case byte differs
            const registration = await navigator.serviceWorker.getRegistration('/');
            if (registration) {
                await registration.update();
                if (registration.waiting) {
                    status.textContent = 'Update found! Applying...';
                    status.style.color = 'var(--primary)';
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    return;
                }
                if (registration.installing) {
                    status.textContent = 'Update installing...';
                    status.style.color = 'var(--primary)';
                    return;
                }
            }

            status.textContent = 'Up to date (v' + currentVersion + ')';
            status.style.color = '#22c55e';
        } catch (e) {
            console.error('Update check failed:', e);
            status.textContent = 'Update check failed — try again';
            status.style.color = '#ef4444';
        }

        btn.disabled = false;
        btn.textContent = 'Check for Updates';
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.SettingsPage = SettingsPage;
