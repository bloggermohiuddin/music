const HistoryPage = {
    async render() {
        const history = Store.get('history') || [];
        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">Recently Played</h1>
                        <p class="text-sm mt-1" style="color:var(--text-secondary);">${history.length} song${history.length !== 1 ? 's' : ''}</p>
                    </div>
                    ${history.length > 0 ? `<button onclick="HistoryPage._clearHistory()" class="px-4 py-2 rounded-lg text-sm font-medium" style="background:var(--surface); color:#ef4444; border:1px solid var(--border);">Clear History</button>` : ''}
                </div>

                ${history.length === 0 ? `
                <div class="text-center py-16">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                        <svg class="w-10 h-10" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h2 class="text-lg font-semibold mb-2" style="color:var(--text);">No listening history</h2>
                    <p class="text-sm" style="color:var(--text-secondary);">Start playing music to build your history</p>
                </div>
                ` : `
                <div class="space-y-1">
                    ${history.map((song, i) => `
                        <div class="history-item flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer"
                            style="hover:background:var(--surface-hover);" data-song-id="${song.id}"
                            onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='transparent'">
                            <div class="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden" style="background:var(--surface);">
                                ${song.thumbnail 
                                    ? `<img src="${song.thumbnail}" alt="" class="w-full h-full object-cover" loading="lazy">`
                                    : `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                }
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</p>
                                <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
                            </div>
                            <span class="text-xs flex-shrink-0" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</span>
                            <span class="text-xs flex-shrink-0 hidden sm:block" style="color:var(--text-muted);">${song.last_played ? Utils.formatDate(song.last_played) : ''}</span>
                            <button onclick="event.stopPropagation(); HistoryPage._playSong('${song.id}')" class="p-2 rounded-full flex-shrink-0" style="color:var(--primary);">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                `}
            </div>
        `;

        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('dblclick', () => {
                const id = el.dataset.songId;
                HistoryPage._playSong(id);
            });
        });
    },

    _playSong(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song) return;
        const queue = Store.get('history');
        const idx = queue.findIndex(s => s.id === songId);
        Store.setQueue(queue, idx);
        Player.loadSong(song);
        Player.play();
        Router.navigate('/player');
    },

    async _clearHistory() {
        const ok = await Modal.confirm('Clear History', 'Are you sure you want to clear all listening history?');
        if (!ok) return;
        await DB.clear('history');
        await Store.loadHistory();
        await this.render();
        Store.showNotification('History cleared', 'info');
    }
};

window.HistoryPage = HistoryPage;
