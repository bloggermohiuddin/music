const LibraryPage = {
    _unsubs: [],
    _sortBy: 'date',
    _viewMode: 'grid',
    _selectMode: false,
    _selected: new Set(),
    _collapsedGroups: new Set(),

    async render() {
        const songs = Store.get('songs');
        const sorted = this._getSortedSongs(songs);
        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">Library</h1>
                        <p class="text-sm mt-1" style="color:var(--text-secondary);">${songs.length} song${songs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex rounded-lg overflow-hidden" style="border:1px solid var(--border);">
                            <button data-view="grid" class="view-toggle p-2 ${this._viewMode === 'grid' ? 'active' : ''}" style="${this._viewMode === 'grid' ? 'background:var(--surface-active); color:var(--text);' : 'color:var(--text-secondary); hover:background:var(--surface-hover);'}">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/></svg>
                            </button>
                            <button data-view="list" class="view-toggle p-2 ${this._viewMode === 'list' ? 'active' : ''}" style="${this._viewMode === 'list' ? 'background:var(--surface-active); color:var(--text);' : 'color:var(--text-secondary); hover:background:var(--surface-hover);'}">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>
                            </button>
                            <button data-view="artist" class="view-toggle p-2 ${this._viewMode === 'artist' ? 'active' : ''}" style="${this._viewMode === 'artist' ? 'background:var(--surface-active); color:var(--text);' : 'color:var(--text-secondary); hover:background:var(--surface-hover);'}">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </button>
                        </div>
                        <select id="sort-select" class="text-sm px-3 py-2 rounded-lg" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                            <option value="date" ${this._sortBy === 'date' ? 'selected' : ''}>Recently Added</option>
                            <option value="title" ${this._sortBy === 'title' ? 'selected' : ''}>Title</option>
                            <option value="artist" ${this._sortBy === 'artist' ? 'selected' : ''}>Artist</option>
                            <option value="duration" ${this._sortBy === 'duration' ? 'selected' : ''}>Duration</option>
                        </select>
                        <button id="upload-btn" class="p-2 rounded-lg" style="color:var(--primary); hover:background:var(--surface-hover);" title="Upload Music">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                        </button>
                        <button id="select-btn" class="p-2 rounded-lg" style="color:${this._selectMode ? 'var(--primary)' : 'var(--text-secondary)'}; hover:background:var(--surface-hover);" title="Select Songs">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                        <input type="file" id="library-upload" accept="audio/*" multiple class="hidden">
                    </div>
                </div>

                ${songs.length === 0 ? `
                <div class="text-center py-20">
                    <div class="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                        <svg class="w-12 h-12" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    </div>
                    <h2 class="text-xl font-bold mb-2" style="color:var(--text);">Your library is empty</h2>
                    <p class="text-sm mb-6" style="color:var(--text-secondary);">Upload your first song to get started</p>
                    <button onclick="document.getElementById('library-upload')?.click()" class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105" style="background:var(--primary); color:white;">Upload Music</button>
                </div>
                ` : (this._viewMode === 'grid' ? this._renderGridView(sorted) : this._viewMode === 'artist' ? this._renderArtistView(sorted) : this._renderListView(sorted))}
            </div>

            ${this._selectMode && this._selected.size > 0 ? `
            <div class="fixed bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl" style="background:var(--glass-bg); border:1px solid var(--glass-border); backdrop-filter:blur(20px);">
                <span class="text-sm font-medium" style="color:var(--text);">${this._selected.size} selected</span>
                <button id="batch-delete" class="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105" style="background:#ef4444; color:white;">
                    Delete
                </button>
                <button id="batch-cancel" class="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">
                    Cancel
                </button>
            </div>
            ` : ''}
        `;

        this._bindEvents();
    },

    _getSortedSongs(songs) {
        const s = [...songs];
        switch (this._sortBy) {
            case 'title': s.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
            case 'artist': s.sort((a, b) => (a.artist || '').localeCompare(b.artist || '')); break;
            case 'duration': s.sort((a, b) => (a.duration || 0) - (b.duration || 0)); break;
            default: s.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)); break;
        }
        return s;
    },

    _renderGridView(songs) {
        return `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                ${songs.map(song => `
                    <div class="song-card group rounded-xl p-3 transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
                        style="background:var(--card-bg); border:1px solid ${this._selected.has(song.id) ? 'var(--primary)' : 'var(--border)'};" 
                        data-song-id="${song.id}" data-grid-song="${song.id}">
                        <div class="relative mb-3">
                            ${this._selectMode ? `
                            <label class="absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all" style="background:${this._selected.has(song.id) ? 'var(--primary)' : 'rgba(0,0,0,0.5)'}; border:2px solid ${this._selected.has(song.id) ? 'white' : 'rgba(255,255,255,0.3)'};">
                                <input type="checkbox" class="hidden" ${this._selected.has(song.id) ? 'checked' : ''} data-select="${song.id}">
                                ${this._selected.has(song.id) ? '<svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                            </label>` : ''}
                            <div class="aspect-square rounded-lg overflow-hidden" style="background:var(--surface);">
                                ${song.thumbnail 
                                    ? `<img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover" loading="lazy">`
                                    : `<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                }
                            </div>
                            <button class="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" 
                                style="background:var(--primary); color:white;" 
                                onclick="event.stopPropagation(); LibraryPage._playSong('${song.id}')">
                                <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                        </div>
                        <h3 class="text-sm font-semibold truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</h3>
                        <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
                        <p class="text-xs mt-1" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    _renderListView(songs) {
        return `
            <div class="rounded-xl overflow-hidden" style="background:var(--card-bg); border:1px solid var(--border);">
                <div class="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted); border-bottom:1px solid var(--border);">
                    <div class="col-span-1">#</div>
                    <div class="col-span-5">Title</div>
                    <div class="col-span-3 hidden sm:block">Artist</div>
                    <div class="col-span-2 hidden md:block">Duration</div>
                    <div class="col-span-1"></div>
                </div>
                ${songs.map((song, i) => `
                    <div class="song-list-item grid grid-cols-12 gap-3 px-4 py-2.5 items-center transition-all duration-200 cursor-pointer" 
                        style="hover:background:var(--surface-hover); ${this._selected.has(song.id) ? 'background:var(--surface-active);' : ''}" data-song-id="${song.id}"
                        onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${this._selected.has(song.id) ? 'var(--surface-active)' : 'transparent'}'">
                        <div class="col-span-1 text-sm flex items-center gap-2" style="color:var(--text-muted);">
                            ${this._selectMode ? `
                            <label class="w-5 h-5 rounded flex items-center justify-center cursor-pointer flex-shrink-0" style="background:${this._selected.has(song.id) ? 'var(--primary)' : 'transparent'}; border:2px solid ${this._selected.has(song.id) ? 'white' : 'var(--text-muted)'};">
                                <input type="checkbox" class="hidden" ${this._selected.has(song.id) ? 'checked' : ''} data-select="${song.id}">
                                ${this._selected.has(song.id) ? '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                            </label>` : ''}
                            <span>${i + 1}</span>
                        </div>
                        <div class="col-span-5 flex items-center gap-3">
                            <div class="w-10 h-10 rounded flex-shrink-0 overflow-hidden" style="background:var(--surface);">
                                ${song.thumbnail 
                                    ? `<img src="${song.thumbnail}" alt="" class="w-full h-full object-cover" loading="lazy">`
                                    : `<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                }
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</p>
                                <p class="text-xs truncate sm:hidden" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
                            </div>
                        </div>
                        <div class="col-span-3 text-sm hidden sm:block truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</div>
                        <div class="col-span-2 text-sm hidden md:block" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</div>
                        <div class="col-span-1 flex items-center gap-1">
                            <button onclick="event.stopPropagation(); LibraryPage._toggleFav('${song.id}')" class="p-1.5 rounded" style="color:${song.favorite ? 'var(--primary)' : 'var(--text-muted)'}; hover:color:var(--primary);">
                                <svg class="w-4 h-4" fill="${song.favorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            </button>
                            <button onclick="event.stopPropagation(); LibraryPage._playSong('${song.id}')" class="p-1.5 rounded" style="color:var(--primary);">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    _renderArtistView(songs) {
        const groups = {};
        songs.forEach(s => {
            const artist = s.artist || 'Unknown Artist';
            if (!groups[artist]) groups[artist] = [];
            groups[artist].push(s);
        });
        const sorted = Object.keys(groups).sort((a, b) => a.localeCompare(b));

        return `
            <div class="space-y-2">
                ${sorted.map(artist => {
                    const isCollapsed = this._collapsedGroups.has(artist);
                    const artistSongs = groups[artist];
                    const totalDuration = artistSongs.reduce((sum, s) => sum + (s.duration || 0), 0);
                    const thumb = artistSongs.find(s => s.thumbnail)?.thumbnail;
                    return `
                        <div class="rounded-xl overflow-hidden" style="background:var(--card-bg); border:1px solid var(--border);">
                            <button class="artist-group-header w-full flex items-center gap-4 px-4 py-3 transition-all" style="color:var(--text); hover:background:var(--surface-hover);" data-artist="${Utils.htmlEncode(artist)}">
                                <div class="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style="background:var(--surface);">
                                    ${thumb 
                                        ? `<img src="${thumb}" alt="" class="w-full h-full object-cover">`
                                        : `<svg class="w-6 h-6" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
                                    }
                                </div>
                                <div class="flex-1 text-left min-w-0">
                                    <p class="font-semibold truncate">${Utils.htmlEncode(artist)}</p>
                                    <p class="text-xs" style="color:var(--text-muted);">${artistSongs.length} song${artistSongs.length !== 1 ? 's' : ''} · ${Utils.formatTime(totalDuration)}</p>
                                </div>
                                <svg class="w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                            <div class="artist-songs ${isCollapsed ? 'hidden' : ''}">
                                ${artistSongs.map(song => `
                                    <div class="song-list-item flex items-center gap-3 px-4 py-2 transition-all cursor-pointer" 
                                        style="hover:background:var(--surface-hover); ${this._selected.has(song.id) ? 'background:var(--surface-active);' : ''}" 
                                        data-song-id="${song.id}">
                                        ${this._selectMode ? `
                                        <label class="w-5 h-5 rounded flex items-center justify-center cursor-pointer flex-shrink-0" style="background:${this._selected.has(song.id) ? 'var(--primary)' : 'transparent'}; border:2px solid ${this._selected.has(song.id) ? 'white' : 'var(--text-muted)'};">
                                            <input type="checkbox" class="hidden" ${this._selected.has(song.id) ? 'checked' : ''} data-select="${song.id}">
                                            ${this._selected.has(song.id) ? '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                                        </label>` : ''}
                                        <div class="w-10 h-10 rounded flex-shrink-0 overflow-hidden" style="background:var(--surface);">
                                            ${song.thumbnail 
                                                ? `<img src="${song.thumbnail}" alt="" class="w-full h-full object-cover" loading="lazy">`
                                                : `<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                            }
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</p>
                                            <p class="text-xs truncate" style="color:var(--text-muted);">${Utils.htmlEncode(song.album || 'Unknown Album')}</p>
                                        </div>
                                        <span class="text-xs" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</span>
                                        <button onclick="event.stopPropagation(); LibraryPage._playSong('${song.id}')" class="p-1.5 rounded" style="color:var(--primary);">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    _playSong(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song) return;
        const queue = Store.get('songs');
        const idx = queue.findIndex(s => s.id === songId);
        Store.setQueue(queue, idx);
        Player.loadSong(song);
        Player.play();
        Router.navigate('/player');
    },

    async _toggleFav(songId) {
        await DB.toggleFavorite(songId);
        await Store.loadFavorites();
        await Store.loadSongs();
        this.render();
    },

    _bindEvents() {
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this._sortBy = e.target.value;
            this.render();
        });

        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                this._viewMode = btn.dataset.view;
                this.render();
            });
        });

        document.getElementById('select-btn')?.addEventListener('click', () => {
            this._selectMode = !this._selectMode;
            this._selected.clear();
            this.render();
        });

        document.querySelectorAll('input[data-select]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.select;
                if (e.target.checked) {
                    this._selected.add(id);
                } else {
                    this._selected.delete(id);
                }
                this.render();
            });
        });

        document.getElementById('batch-delete')?.addEventListener('click', async () => {
            const count = this._selected.size;
            const confirmed = await Modal.confirm(`Delete ${count} song${count !== 1 ? 's' : ''}?`, 'Delete Songs');
            if (confirmed) {
                for (const id of this._selected) {
                    await DB.deleteSong(id);
                }
                this._selected.clear();
                this._selectMode = false;
                await Store.loadSongs();
                await Store.loadFavorites();
                await Store.loadHistory();
                Store.showNotification(`${count} song${count !== 1 ? 's' : ''} deleted`, 'success');
                this.render();
            }
        });

        document.getElementById('batch-cancel')?.addEventListener('click', () => {
            this._selected.clear();
            this._selectMode = false;
            this.render();
        });

        const uploadBtn = document.getElementById('upload-btn');
        const uploadInput = document.getElementById('library-upload');
        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', async (e) => {
                await HomePage._handleUpload(e.target.files);
                uploadInput.value = '';
                await Store.loadSongs();
                this.render();
            });
        }

        document.querySelectorAll('.song-card, .song-list-item').forEach(el => {
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (this._selectMode) return;
                const id = el.dataset.songId;
                if (id) this._playSong(id);
            });
            el.addEventListener('click', (e) => {
                if (!this._selectMode) return;
                if (e.target.closest('button') || e.target.closest('label') || e.target.closest('input')) return;
                const id = el.dataset.songId;
                if (!id) return;
                if (this._selected.has(id)) {
                    this._selected.delete(id);
                } else {
                    this._selected.add(id);
                }
                this.render();
            });
        });

        document.querySelectorAll('.artist-group-header').forEach(btn => {
            btn.addEventListener('click', () => {
                const artist = btn.dataset.artist;
                if (this._collapsedGroups.has(artist)) {
                    this._collapsedGroups.delete(artist);
                } else {
                    this._collapsedGroups.add(artist);
                }
                this.render();
            });
        });
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.LibraryPage = LibraryPage;
