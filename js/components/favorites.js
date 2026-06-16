const FavoritesPage = {
    async render() {
        const favorites = Store.get('favorites') || [];
        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">Favorites</h1>
                        <p class="text-sm mt-1" style="color:var(--text-secondary);">${favorites.length} song${favorites.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                ${favorites.length === 0 ? `
                <div class="text-center py-16">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                        <svg class="w-10 h-10" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </div>
                    <h2 class="text-lg font-semibold mb-2" style="color:var(--text);">No favorites yet</h2>
                    <p class="text-sm" style="color:var(--text-secondary);">Tap the heart icon on any song to add it to your favorites</p>
                </div>
                ` : `
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    ${favorites.map(song => `
                        <div class="song-card group rounded-xl p-3 transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
                            style="background:var(--card-bg); border:1px solid var(--border);" 
                            data-song-id="${song.id}">
                            <div class="relative mb-3">
                                <div class="aspect-square rounded-lg overflow-hidden" style="background:var(--surface);">
                                    ${song.thumbnail 
                                        ? `<img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover" loading="lazy">`
                                        : `<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                    }
                                </div>
                                <button class="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300" 
                                    style="background:rgba(0,0,0,0.6); color:#ef4444;" 
                                    onclick="event.stopPropagation(); FavoritesPage._unfavorite('${song.id}')">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </button>
                                <button class="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" 
                                    style="background:var(--primary); color:white;" 
                                    onclick="event.stopPropagation(); FavoritesPage._playSong('${song.id}')">
                                    <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </button>
                            </div>
                            <h3 class="text-sm font-semibold truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</h3>
                            <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
                        </div>
                    `).join('')}
                </div>
                `}
            </div>
        `;

        document.querySelectorAll('.song-card').forEach(el => {
            el.addEventListener('dblclick', (e) => { e.stopPropagation();
                const id = el.dataset.songId;
                FavoritesPage._playSong(id);
            });
        });
    },

    _playSong(songId) {
        const song = Store.get('favorites').find(s => s.id === songId);
        if (!song) return;
        const queue = Store.get('favorites');
        const idx = queue.findIndex(s => s.id === songId);
        Store.setQueue(queue, idx);
        Player.loadSong(song);
        Player.play();
        Router.navigate('/player');
    },

    async _unfavorite(songId) {
        await DB.toggleFavorite(songId);
        await Store.loadFavorites();
        await Store.loadSongs();
        this.render();
        Store.showNotification('Removed from favorites', 'info');
    }
};

window.FavoritesPage = FavoritesPage;
