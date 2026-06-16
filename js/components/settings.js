const SettingsPage = {
    _unsubs: [],

    async render() {
        const theme = Theme.getCurrentTheme();
        const themes = Theme.getAllThemes();
        const volume = Store.get('volume');
        const speed = Store.get('playbackSpeed');
        const crossfade = Store.get('crossfade');
        const storageInfo = Store.get('storageInfo');

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
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium" style="color:var(--text);">Playback Speed</p>
                                    <p class="text-xs" style="color:var(--text-secondary);">Current: ${speed}x</p>
                                </div>
                                <select id="settings-speed" class="text-sm px-3 py-2 rounded-lg" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                                    ${[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => `<option value="${s}" ${speed === s ? 'selected' : ''}>${s}x</option>`).join('')}
                                </select>
                            </div>
                        </div>
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
                                <button onclick="SettingsPage._exportBackup()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">Export Backup</button>
                                <button onclick="document.getElementById('import-backup-input').click()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">Import Backup</button>
                                <input type="file" id="import-backup-input" accept=".json" class="hidden" onchange="SettingsPage._importBackup(this.files[0])">
                            </div>
                        </div>
                    </section>

                    <section class="p-5 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">About</h2>
                        <div class="space-y-2 text-sm" style="color:var(--text-secondary);">
                            <p>Audivo <span id="app-version">v2.0</span></p>
                            <p>Offline-first PWA Music Application</p>
                            <p>All data stored locally in your browser</p>
                            <p>No server, no backend, no tracking</p>
                        </div>
                    </section>
                </div>
            </div>
        `;

        this._bindEvents();
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
            this.render();
        });
        document.getElementById('settings-speed')?.addEventListener('change', (e) => {
            Player.setPlaybackSpeed(parseFloat(e.target.value));
        });

        // Fetch version from Service Worker
        const vEl = document.getElementById('app-version');
        if (vEl && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => { vEl.textContent = 'v' + e.data; };
            navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
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

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.SettingsPage = SettingsPage;
