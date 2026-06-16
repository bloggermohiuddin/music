const PlaylistsPage = {
    _unsubs: [],
    _editingId: null,

    async render() {
        const playlists = Store.get('playlists') || [];
        const songs = Store.get('songs') || [];
        const el = document.getElementById('main-content');
        if (!el) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">Playlists</h1>
                        <p class="text-sm mt-1" style="color:var(--text-secondary);">${playlists.length} playlist${playlists.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button id="new-playlist-btn" class="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2" style="background:var(--primary); color:white;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        New Playlist
                    </button>
                </div>

                ${playlists.length === 0 ? `
                <div class="text-center py-16">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                        <svg class="w-10 h-10" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                    </div>
                    <h2 class="text-lg font-semibold mb-2" style="color:var(--text);">No playlists yet</h2>
                    <p class="text-sm mb-6" style="color:var(--text-secondary);">Create your first playlist to organize your music</p>
                    <button onclick="PlaylistsPage._createPlaylist()" class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105" style="background:var(--primary); color:white;">Create Playlist</button>
                </div>
                ` : `
                <div id="playlist-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    ${playlists.map(p => {
                        return `
                        <div class="p-5 rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer group" 
                            style="background:var(--card-bg); border:1px solid var(--border);"
                            onclick="Router.navigate('/playlist/${p.id}')">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:var(--surface);">
                                    <svg class="w-6 h-6" style="color:var(--primary);" fill="currentColor" viewBox="0 0 24 24"><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                                </div>
                                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onclick="event.stopPropagation(); PlaylistsPage._renamePlaylist('${p.id}')" class="p-1.5 rounded" style="color:var(--text-secondary); hover:color:var(--text);">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); PlaylistsPage._deletePlaylist('${p.id}')" class="p-1.5 rounded" style="color:#ef4444;">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 class="text-base font-semibold truncate" style="color:var(--text);">${Utils.htmlEncode(p.name)}</h3>
                            <p class="text-sm mt-1 song-count" data-playlist="${p.id}" style="color:var(--text-secondary);">0 songs</p>
                            <p class="text-xs mt-1" style="color:var(--text-muted);">Created ${Utils.formatDate(p.created_at)}</p>
                        </div>`;
                    }).join('')}
                </div>
                `}
            </div>
        `;

        this._bindEvents();
        this._populateCounts();
    },

    async _populateCounts() {
        const els = document.querySelectorAll('.song-count');
        for (const el of els) {
            const playlistId = el.dataset.playlist;
            const songs = await DB.getPlaylistSongs(playlistId);
            el.textContent = `${songs.length} song${songs.length !== 1 ? 's' : ''}`;
        }
    },

    _bindEvents() {
        document.getElementById('new-playlist-btn')?.addEventListener('click', () => this._createPlaylist());
    },

    async _createPlaylist() {
        const name = await Modal.prompt('New Playlist', '');
        if (!name || !name.trim()) return;
        await DB.add('playlists', { name: name.trim(), created_at: Date.now() });
        await Store.loadPlaylists();
        this.render();
        Store.showNotification(`Playlist "${name}" created`, 'success');
    },

    async _renamePlaylist(id) {
        const playlist = Store.get('playlists').find(p => p.id === id);
        if (!playlist) return;
        const name = await Modal.prompt('Rename Playlist', playlist.name);
        if (!name || !name.trim() || name === playlist.name) return;
        playlist.name = name.trim();
        await DB.put('playlists', playlist);
        await Store.loadPlaylists();
        this.render();
    },

    async _deletePlaylist(id) {
        const ok = await Modal.confirm('Delete Playlist', 'Are you sure you want to delete this playlist? This cannot be undone.');
        if (!ok) return;
        const items = await DB.getByIndex('playlist_songs', 'playlist_id', id);
        for (const item of items) await DB.delete('playlist_songs', item.id);
        await DB.delete('playlists', id);
        await Store.loadPlaylists();
        this.render();
        Store.showNotification('Playlist deleted', 'info');
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

const PlaylistDetailPage = {
    async render(params) {
        const playlistId = params.id;
        const playlist = Store.get('playlists').find(p => p.id === playlistId);
        const songs = await DB.getPlaylistSongs(playlistId);
        const allSongs = Store.get('songs');
        const el = document.getElementById('main-content');
        if (!el || !playlist) return;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <button onclick="Router.navigate('/playlists')" class="p-2 rounded-lg" style="color:var(--text-secondary); hover:background:var(--surface-hover);">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">${Utils.htmlEncode(playlist.name)}</h1>
                            <p class="text-sm mt-1" style="color:var(--text-secondary);">${songs.length} song${songs.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="play-all-btn" class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2" style="background:var(--primary); color:white;">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            Play All
                        </button>
                        <button id="add-to-playlist-btn" class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                            + Add Songs
                        </button>
                    </div>
                </div>

                ${songs.length === 0 ? `
                <div class="text-center py-16">
                    <p style="color:var(--text-muted);">This playlist is empty. Add some songs!</p>
                </div>
                ` : `
                <div class="rounded-xl overflow-hidden" style="background:var(--card-bg); border:1px solid var(--border);">
                    <div class="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted); border-bottom:1px solid var(--border);">
                        <div class="col-span-1">#</div>
                        <div class="col-span-6">Title</div>
                        <div class="col-span-3 hidden sm:block">Artist</div>
                        <div class="col-span-1">Duration</div>
                        <div class="col-span-1"></div>
                    </div>
                    ${songs.map((song, i) => `
                        <div class="grid grid-cols-12 gap-3 px-4 py-2.5 items-center transition-all duration-200 cursor-pointer"
                            style="hover:background:var(--surface-hover);" data-song-id="${song.id}"
                            onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='transparent'">
                            <div class="col-span-1 text-sm" style="color:var(--text-muted);">${i + 1}</div>
                            <div class="col-span-6 flex items-center gap-3">
                                <div class="w-10 h-10 rounded flex-shrink-0 overflow-hidden" style="background:var(--surface);">
                                    ${song.thumbnail 
                                        ? `<img src="${song.thumbnail}" alt="" class="w-full h-full object-cover" loading="lazy">`
                                        : `<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                    }
                                </div>
                                <p class="text-sm font-medium truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</p>
                            </div>
                            <div class="col-span-3 text-sm hidden sm:block truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</div>
                            <div class="col-span-1 text-sm" style="color:var(--text-muted);">${Utils.formatTime(song.duration)}</div>
                            <div class="col-span-1">
                                <button onclick="event.stopPropagation(); PlaylistDetailPage._removeSong('${playlistId}', '${song.id}')" class="p-1 rounded" style="color:#ef4444;">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                `}

                <div id="add-songs-panel" class="mt-4 hidden">
                    <h3 class="text-lg font-semibold mb-3" style="color:var(--text);">Add songs</h3>
                    <div class="space-y-1 max-h-60 overflow-y-auto">
                        ${allSongs.filter(s => !songs.find(ps => ps.id === s.id)).map(song => `
                            <div class="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer"
                                style="hover:background:var(--surface-hover);"
                                onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='transparent'">
                                <span class="truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</span>
                                <button onclick="PlaylistDetailPage._addSong('${playlistId}', '${song.id}')" class="p-1.5 rounded" style="color:var(--primary);">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('play-all-btn')?.addEventListener('click', () => {
            Store.setQueue(songs, 0);
            if (songs.length > 0) {
                Player.loadSong(songs[0]);
                Player.play();
                Router.navigate('/player');
            }
        });

        document.getElementById('add-to-playlist-btn')?.addEventListener('click', () => {
            const panel = document.getElementById('add-songs-panel');
            if (panel) panel.classList.toggle('hidden');
        });
    },

    async _addSong(playlistId, songId) {
        await DB.addToPlaylist(playlistId, songId);
        Store.showNotification('Song added to playlist', 'success');
        PlaylistDetailPage.render({ id: playlistId });
    },

    async _removeSong(playlistId, songId) {
        await DB.removeFromPlaylist(playlistId, songId);
        Store.showNotification('Song removed from playlist', 'info');
        PlaylistDetailPage.render({ id: playlistId });
    }
};

window.PlaylistsPage = PlaylistsPage;
window.PlaylistDetailPage = PlaylistDetailPage;
