const MiniPlayerComponent = {
    _unsubs: [],
    _currentSongId: null,

    async render() {
        const container = document.getElementById('mini-player');
        if (!container) return;

        const song = Store.get('currentSong');
        const isPlaying = Store.get('isPlaying');
        const currentTime = Store.get('currentTime');
        const duration = Store.get('duration');

        if (!song) {
            container.innerHTML = '';
            this._currentSongId = null;
            return;
        }

        this._currentSongId = song.id;

        container.innerHTML = `
            <div id="mini-player-bar" class="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 cursor-pointer"
                style="background:var(--player-bg); border-top:1px solid var(--border); backdrop-filter:blur(20px);"
                onclick="Router.navigate('/player')">
                <div id="mini-progress" class="absolute top-0 left-0 h-0.5 transition-none" style="background:var(--primary); width:${duration > 0 ? (currentTime / duration * 100) : 0}%;"></div>
                <div class="flex items-center gap-3 px-4 py-2 max-w-screen-2xl mx-auto">
                    <div class="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style="background:var(--surface);">
                        ${song.thumbnail 
                            ? `<img src="${song.thumbnail}" alt="" class="w-full h-full object-cover" loading="eager" decoding="async">`
                            : `<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                        }
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</p>
                        <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
                    </div>
                    <div class="flex items-center gap-2" onclick="event.stopPropagation();">
                        <button id="mini-prev" class="p-1.5 rounded-full" style="color:var(--text-secondary);">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="mini-play-pause" class="w-9 h-9 rounded-full flex items-center justify-center transition-all" style="background:var(--primary); color:white;">
                            ${isPlaying 
                                ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
                                : `<svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`}
                        </button>
                        <button id="mini-next" class="p-1.5 rounded-full" style="color:var(--text-secondary);">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mini-play-pause')?.addEventListener('click', (e) => {
            e.stopPropagation();
            Player.togglePlay();
        });
        document.getElementById('mini-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            Player.next();
        });
        document.getElementById('mini-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            Player.previous();
        });
    },

    updateProgress() {
        const bar = document.getElementById('mini-progress');
        if (!bar) return;
        const duration = Store.get('duration');
        const currentTime = Store.get('currentTime');
        bar.style.width = duration > 0 ? (currentTime / duration * 100) + '%' : '0%';
    },

    updatePlayButton() {
        const btn = document.getElementById('mini-play-pause');
        if (!btn) return;
        const isPlaying = Store.get('isPlaying');
        btn.innerHTML = isPlaying
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
            : '<svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.MiniPlayerComponent = MiniPlayerComponent;
