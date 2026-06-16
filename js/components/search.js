const SearchPage = {
    _unsubs: [],

    async render() {
        const el = document.getElementById('main-content');
        if (!el) return;
        const query = Store.get('searchQuery') || '';
        const results = query ? Store.get('searchResults') : [];

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="max-w-2xl mx-auto mb-6">
                    <div class="relative">
                        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-input" placeholder="Search songs, artists, albums..." 
                            class="w-full pl-12 pr-4 py-3.5 rounded-xl text-base outline-none transition-all duration-200 focus:ring-2"
                            style="background:var(--input-bg); color:var(--text); border:1px solid var(--border); focus:border-color:var(--primary); focus:ring-color:var(--primary);"
                            value="${Utils.htmlEncode(query)}">
                        ${query ? `<button id="search-clear" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded" style="color:var(--text-muted);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>` : ''}
                    </div>
                </div>

                ${!query ? `
                <div class="max-w-2xl mx-auto">
                    <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Browse</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        ${['All Songs', 'Favorites', 'Recently Played', 'Downloads', 'Playlists', 'Settings'].map(cat => {
                            const paths = { 'All Songs': '/library', 'Favorites': '/favorites', 'Recently Played': '/history', 'Downloads': '/downloads', 'Playlists': '/playlists', 'Settings': '/settings' };
                            return `<a href="javascript:Router.navigate('${paths[cat]}')" 
                                class="p-4 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                                style="background:var(--card-bg); border:1px solid var(--border); color:var(--text);">${cat}</a>`;
                        }).join('')}
                    </div>
                </div>
                ` : `
                <div class="max-w-4xl mx-auto">
                    <p class="text-sm mb-4" style="color:var(--text-secondary);">${results.length} result${results.length !== 1 ? 's' : ''} for "${Utils.htmlEncode(query)}"</p>
                    ${results.length === 0 ? `
                    <div class="text-center py-12">
                        <p style="color:var(--text-muted);">No songs found for "${Utils.htmlEncode(query)}". Try a different search.</p>
                    </div>
                    ` : `
                    <div class="space-y-1">
                        ${results.map(song => `
                            <div class="search-item flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer"
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
                                    <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)} · ${Utils.htmlEncode(song.album || 'Unknown Album')}</p>
                                </div>
                                <span class="text-xs flex-shrink-0" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</span>
                                <button onclick="event.stopPropagation(); SearchPage._playSong('${song.id}')" class="p-2 rounded-full flex-shrink-0" style="color:var(--primary); hover:background:var(--surface-hover);">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    `}
                </div>
                `}
            </div>
        `;

        this._bindEvents();
    },

    _playSong(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song) return;
        const results = Store.get('searchResults');
        const idx = results.findIndex(s => s.id === songId);
        Store.setQueue(results, idx);
        Player.loadSong(song);
        Player.play();
        Router.navigate('/player');
    },

    _bindEvents() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');

        if (input) {
            input.addEventListener('input', Utils.debounce(async (e) => {
                const query = e.target.value.trim();
                Store.set('searchQuery', query);
                if (query) {
                    const results = await DB.searchSongs(query);
                    Store.set('searchResults', results);
                } else {
                    Store.set('searchResults', []);
                }
                this.render();
            }, 200));
            input.focus();
        }

        clearBtn?.addEventListener('click', () => {
            Store.set('searchQuery', '');
            Store.set('searchResults', []);
            this.render();
        });

        document.querySelectorAll('.search-item').forEach(el => {
            el.addEventListener('dblclick', (e) => { e.stopPropagation();
                const id = el.dataset.songId;
                if (id) this._playSong(id);
            });
        });
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.SearchPage = SearchPage;
