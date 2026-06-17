const ContextMenu = {
    _el: null,
    _song: null,
    _longPressTimer: null,

    init() {
        this._el = document.getElementById('context-menu');
        document.addEventListener('click', (e) => {
            if (!this._el.classList.contains('hidden') && this._el.contains(e.target)) return;
            this.hide();
        });
        document.addEventListener('contextmenu', (e) => {
            const songEl = e.target.closest('[data-song-id]');
            if (songEl) {
                e.preventDefault();
                this.show(e.clientX, e.clientY, songEl.dataset.songId);
            }
        });

        document.addEventListener('touchstart', (e) => {
            const songEl = e.target.closest('[data-song-id]');
            if (!songEl) return;
            e.preventDefault();
            const touch = e.touches[0];
            this._longPressTimer = setTimeout(() => {
                this.show(touch.clientX, touch.clientY, songEl.dataset.songId);
            }, 400);
        }, { passive: false });

        document.addEventListener('touchend', () => clearTimeout(this._longPressTimer));
        document.addEventListener('touchmove', () => clearTimeout(this._longPressTimer));
    },

    show(x, y, songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song || !this._el) return;
        this._song = song;

        const isFav = Store.get('favorites').some(f => f.id === songId);
        const inQueue = Store.get('queue').some(q => q.id === songId);

        this._el.innerHTML = `
            <div class="py-1">
                <button data-action="play" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text);">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Play
                </button>
                <button data-action="play-next" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                    Play Next
                </button>
                <button data-action="queue" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text); ${inQueue ? 'opacity:0.5' : ''}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    ${inQueue ? 'Already in Queue' : 'Add to Queue'}
                </button>
                <button data-action="playlist" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    Add to Playlist
                </button>
                <button data-action="favorite" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:${isFav ? 'var(--primary)' : 'var(--text)'};">
                    <svg class="w-4 h-4" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    ${isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button data-action="share" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    Share
                </button>
                <button data-action="edit" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:var(--text);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Edit Details
                </button>
                <div class="my-1" style="border-top:1px solid var(--border);"></div>
                <button data-action="delete" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style="color:#ef4444;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Delete
                </button>
            </div>
        `;

        const menuW = 220;
        const menuH = 300;
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        let posX = x;
        let posY = y;
        if (x + menuW > viewW) posX = viewW - menuW - 8;
        if (y + menuH > viewH) posY = viewH - menuH - 8;
        if (posX < 0) posX = 8;
        if (posY < 0) posY = 8;

        this._el.style.left = posX + 'px';
        this._el.style.top = posY + 'px';
        this._el.classList.remove('hidden');
        this._el.style.opacity = '1';
        this._el.style.transform = 'scale(1)';

        this._el.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._handleAction(btn.dataset.action);
            });
        });
    },

    hide() {
        if (!this._el) return;
        this._el.style.opacity = '0';
        this._el.style.transform = 'scale(0.95)';
        setTimeout(() => this._el.classList.add('hidden'), 150);
    },

    async _handleAction(action) {
        if (!this._song) return;
        const song = this._song;
        this.hide();

        switch (action) {
            case 'play':
                const songs = Store.get('songs');
                const idx = songs.findIndex(s => s.id === song.id);
                if (idx >= 0) {
                    Store.set('queue', songs.slice(idx));
                    Store.set('queueIndex', 0);
                    Player.loadSong(songs[idx]);
                    Player.play();
                    Router.navigate('/player');
                }
                break;
            case 'play-next':
                Store.addToQueue(song, Store.get('queueIndex') + 1);
                Store.showNotification('Playing next', 'success');
                break;
            case 'queue':
                Store.addToQueue(song);
                Store.showNotification('Added to queue', 'success');
                break;
            case 'playlist':
                const playlists = Store.get('playlists');
                if (playlists.length === 0) {
                    const name = await Modal.prompt('Create a playlist first', 'Playlist name');
                    if (name) {
                        const plId = await DB.add('playlists', { name: name.trim(), created_at: Date.now() });
                        await Store.loadPlaylists();
                        await DB.addToPlaylist(plId, song.id);
                        Store.showNotification(`Added to "${name}"`, 'success');
                    }
                } else {
                    this._showPlaylistPicker(song, playlists);
                }
                break;
            case 'favorite':
                await DB.toggleFavorite(song.id);
                await Store.loadFavorites();
                await Store.loadSongs();
                Store.showNotification(song.favorite ? 'Removed from favorites' : 'Added to favorites', 'success');
                break;
            case 'share':
                if (navigator.share) {
                    try {
                        await navigator.share({ title: song.title, text: `${song.title} - ${song.artist}` });
                    } catch (e) {}
                } else {
                    await navigator.clipboard?.writeText(`${song.title} - ${song.artist}`);
                    Store.showNotification('Copied to clipboard', 'success');
                }
                break;
            case 'edit':
                this._showEditModal(song);
                break;
            case 'delete':
                const confirmed = await Modal.confirm(`Delete "${song.title}"?`, 'Delete Song');
                if (confirmed) {
                    await DB.deleteSong(song.id);
                    await Store.loadSongs();
                    await Store.loadFavorites();
                    await Store.loadHistory();
                    Store.showNotification('Song deleted', 'success');
                }
                break;
        }
    },

    _showPlaylistPicker(song, playlists) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.backdropFilter = 'blur(4px)';

        const box = document.createElement('div');
        box.className = 'rounded-2xl p-4 w-72 max-h-80 overflow-y-auto';
        box.style.background = 'var(--glass-bg)';
        box.style.border = '1px solid var(--glass-border)';

        box.innerHTML = `
            <h3 class="text-sm font-semibold mb-3" style="color:var(--text);">Add to Playlist</h3>
            ${playlists.map(p => `
                <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-surface" style="color:var(--text-secondary);" data-pl-id="${p.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                    ${Utils.htmlEncode(p.name)}
                </button>
            `).join('')}
            <button class="w-full mt-2 px-3 py-2 rounded-lg text-sm" style="color:var(--text-muted);" id="ctx-cancel-pl">Cancel</button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        box.querySelectorAll('button[data-pl-id]').forEach(btn => {
            btn.addEventListener('click', async () => {
                await DB.addSongToPlaylist(btn.dataset.plId, song.id);
                const pl = playlists.find(p => p.id === btn.dataset.plId);
                Store.showNotification(`Added to "${pl?.name}"`, 'success');
                overlay.remove();
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        box.querySelector('#ctx-cancel-pl')?.addEventListener('click', () => overlay.remove());
    },

    _showEditModal(song) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.backdropFilter = 'blur(4px)';

        const box = document.createElement('div');
        box.className = 'rounded-2xl p-5 w-80 max-w-[90vw] max-h-[85vh] overflow-y-auto';
        box.style.background = 'var(--glass-bg)';
        box.style.border = '1px solid var(--glass-border)';

        box.innerHTML = `
            <h3 class="text-base font-semibold mb-4" style="color:var(--text);">Edit Song Details</h3>
            <div class="space-y-3">
                <div id="edit-thumb-preview" class="w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center mb-1" style="background:var(--surface);">
                    ${song.thumbnail 
                        ? `<img src="${song.thumbnail}" class="w-full h-full object-cover">`
                        : `<svg class="w-12 h-12" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
                    }
                </div>
                <div>
                    <label class="text-xs font-medium mb-1 block" style="color:var(--text-secondary);">Title</label>
                    <input id="edit-title" type="text" value="${Utils.htmlEncode(song.title)}" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                </div>
                <div>
                    <label class="text-xs font-medium mb-1 block" style="color:var(--text-secondary);">Artist</label>
                    <input id="edit-artist" type="text" value="${Utils.htmlEncode(song.artist)}" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                </div>
                <div>
                    <label class="text-xs font-medium mb-1 block" style="color:var(--text-secondary);">Album</label>
                    <input id="edit-album" type="text" value="${Utils.htmlEncode(song.album || '')}" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                </div>
                <div>
                    <label class="text-xs font-medium mb-1 block" style="color:var(--text-secondary);">Thumbnail</label>
                    <input id="edit-thumb" type="text" value="${song.thumbnail || ''}" placeholder="Paste image URL..." class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">
                    <div class="flex gap-2 mt-1.5">
                        <button id="edit-thumb-upload" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">
                            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            Upload Image
                        </button>
                        <button id="edit-thumb-clear" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style="background:var(--surface); color:#ef4444; border:1px solid var(--border);">Clear</button>
                    </div>
                    <input type="file" id="edit-thumb-file" accept="image/*" class="hidden">
                </div>
            </div>
            <div class="flex gap-2 mt-5">
                <button id="edit-save" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style="background:var(--primary); color:white;">Save</button>
                <button id="edit-cancel" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">Cancel</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const thumbInput = box.querySelector('#edit-thumb');
        const thumbPreview = box.querySelector('#edit-thumb-preview');

        thumbInput.addEventListener('input', () => {
            const url = thumbInput.value.trim();
            thumbPreview.innerHTML = url 
                ? `<img src="${url}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<svg class=\\'w-12 h-12\\' style=\\'color:var(--text-muted);\\' fill=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/></svg>'">`
                : `<svg class="w-12 h-12" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
        });

        box.querySelector('#edit-thumb-upload')?.addEventListener('click', () => {
            box.querySelector('#edit-thumb-file')?.click();
        });

        box.querySelector('#edit-thumb-file')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                thumbInput.value = ev.target.result;
                thumbInput.dispatchEvent(new Event('input'));
            };
            reader.readAsDataURL(file);
        });

        box.querySelector('#edit-thumb-clear')?.addEventListener('click', () => {
            thumbInput.value = '';
            thumbInput.dispatchEvent(new Event('input'));
        });

        box.querySelector('#edit-save').addEventListener('click', async () => {
            const title = box.querySelector('#edit-title').value.trim();
            const artist = box.querySelector('#edit-artist').value.trim();
            const album = box.querySelector('#edit-album').value.trim();
            const thumbnail = box.querySelector('#edit-thumb').value.trim();

            if (!title) {
                box.querySelector('#edit-title').style.borderColor = '#ef4444';
                return;
            }

            await DB.updateSong(song.id, {
                title: title || song.title,
                artist: artist || song.artist,
                album: album || song.album,
                thumbnail: thumbnail || song.thumbnail
            });
            await Store.loadSongs();
            await Store.loadFavorites();
            Store.showNotification('Song updated', 'success');
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        box.querySelector('#edit-cancel')?.addEventListener('click', () => overlay.remove());
    }
};

window.ContextMenu = ContextMenu;
