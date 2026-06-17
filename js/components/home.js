const HomePage = {
    _unsubs: [],

    async render() {
        const songs = Store.get('songs');
        const history = Store.get('history');
        const favorites = Store.get('favorites');
        const recentSongs = [...songs].sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).slice(0, 12);
        const recentPlayed = history.slice(0, 8);

        const el = document.getElementById('main-content');
        if (!el) return;
        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4 gap-3">
                        <h1 class="text-xl md:text-3xl font-bold min-w-0" style="color:var(--text);">Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</h1>
                        <button onclick="Router.navigate('/library')" class="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0 whitespace-nowrap" style="background:var(--surface); color:var(--text-secondary); border:1px solid var(--border);">View Library</button>
                    </div>
                    ${recentPlayed.length > 0 ? this._renderSection('Recently Played', recentPlayed, 'small') : ''}
                </div>

                <div class="mb-8">
                    ${favorites.length > 0 ? this._renderSection('Your Favorites', favorites.slice(0, 6), 'small') : ''}
                </div>

                <div class="mb-8">
                    ${recentSongs.length > 0 ? this._renderSection('Latest Added', recentSongs, 'card') : this._renderEmptyState()}
                </div>

                ${songs.length > 0 ? `
                <div class="mb-8">
                    <h2 class="text-xl font-bold mb-4" style="color:var(--text);">Quick Stats</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${[
                            { label: 'Total Songs', value: songs.length, icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
                            { label: 'Favorites', value: favorites.length, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                            { label: 'Playlists', value: Store.get('playlists').length, icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
                            { label: 'Total Size', value: Utils.formatSize(Store.get('storageInfo').totalSize || 0), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                        ].map(stat => `
                            <div class="p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]" style="background:var(--card-bg); border:1px solid var(--border);">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:var(--surface);">
                                        <svg class="w-5 h-5" style="color:var(--primary);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${stat.icon}"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs" style="color:var(--text-muted);">${stat.label}</p>
                                        <p class="text-lg font-bold" style="color:var(--text);">${stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
        this._bindSongs();
    },

    _renderSection(title, items, style) {
        if (style === 'small') {
            return `
                <div class="mb-4">
                    <h2 class="text-xl font-bold mb-4" style="color:var(--text);">${title}</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        ${items.map(song => this._renderSmallCard(song)).join('')}
                    </div>
                </div>
            `;
        }
        return `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold" style="color:var(--text);">${title}</h2>
                    <button onclick="Router.navigate('/library')" class="text-sm font-medium" style="color:var(--primary);">See all</button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    ${items.map(song => this._renderCard(song)).join('')}
                </div>
            </div>
        `;
    },

    _renderCard(song) {
        return `
            <div class="song-card group rounded-xl p-3 transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
                style="background:var(--card-bg); border:1px solid var(--border); touch-action:manipulation;" 
                data-song-id="${song.id}"
                onclick="HomePage._playSong('${song.id}')">
                <div class="relative mb-3">
                    <div class="aspect-square rounded-lg overflow-hidden" style="background:var(--surface);">
                        ${song.thumbnail 
                            ? `<img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover" loading="lazy">`
                            : `<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                        }
                    </div>
                    <button class="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" 
                        style="background:var(--primary); color:white;" onclick="event.stopPropagation(); HomePage._playSong('${song.id}')">
                        <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
                <h3 class="text-sm font-semibold truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</h3>
                <p class="text-xs truncate mt-0.5" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
            </div>
        `;
    },

    _renderSmallCard(song) {
        return `
            <div class="song-card group rounded-xl p-3 transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
                style="background:var(--card-bg); border:1px solid var(--border); touch-action:manipulation;" 
                data-song-id="${song.id}"
                onclick="HomePage._playSong('${song.id}')">
                <div class="relative mb-2">
                    <div class="aspect-square rounded-lg overflow-hidden" style="background:var(--surface);">
                        ${song.thumbnail 
                            ? `<img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover" loading="lazy">`
                            : `<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                        }
                    </div>
                    <button class="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" 
                        style="background:var(--primary); color:white;" onclick="event.stopPropagation(); HomePage._playSong('${song.id}')">
                        <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
                <h3 class="text-sm font-semibold truncate" style="color:var(--text);">${Utils.htmlEncode(song.title)}</h3>
                <p class="text-xs truncate" style="color:var(--text-secondary);">${Utils.htmlEncode(song.artist)}</p>
            </div>
        `;
    },

    _renderEmptyState() {
        return `
            <div class="text-center py-16">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                    <svg class="w-10 h-10" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                </div>
                <h2 class="text-xl font-bold mb-2" style="color:var(--text);">Your music awaits</h2>
                <p class="text-sm mb-6" style="color:var(--text-secondary);">Upload songs or paste a YouTube link to get started</p>
                <div class="flex items-center justify-center gap-3">
                    <button onclick="document.getElementById('upload-input')?.click()" class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105" style="background:var(--primary); color:white;">Upload Music</button>
                    <button onclick="Router.navigate('/downloads')" class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">Download from YouTube</button>
                </div>
                <input type="file" id="upload-input" accept="audio/*" multiple class="hidden" onchange="HomePage._handleUpload(this.files)">
            </div>
        `;
    },

    async _playSong(songId) {
        const song = Store.get('songs').find(s => s.id === songId);
        if (!song) return;
        const queue = Store.get('songs');
        const idx = queue.findIndex(s => s.id === songId);
        Store.setQueue(queue, idx);
        await Player.loadSong(song);
        Player.play();
        Router.navigate('/player');
    },

    async _handleUpload(files) {
        if (!files || files.length === 0) return;
        for (const file of files) {
            if (!Utils.isAudioFile(file.name)) continue;
            try {
                const metadata = await Utils.extractMetadata(file);
                const blob = new Blob([await Utils.readFileAsArrayBuffer(file)], { type: file.type });
                const dups = await DB.detectDuplicates(file.size, metadata.title || file.name);
                if (dups.length > 0) {
                    Store.showNotification(`"${metadata.title || file.name}" already exists`, 'warning');
                    continue;
                }
                await Store.addSong({
                    title: metadata.title,
                    artist: metadata.artist,
                    album: metadata.album,
                    duration: metadata.duration,
                    thumbnail: metadata.thumbnail,
                    blob: blob,
                    source_type: 'upload',
                    size: file.size,
                    created_at: Date.now()
                });
                Store.showNotification(`"${metadata.title}" uploaded successfully`, 'success');
            } catch (e) {
                Store.showNotification(`Failed to upload ${file.name}`, 'error');
            }
        }
    },

    _bindSongs() { },

    cleanup() {
        (this._unsubs || []).forEach(u => u());
        this._unsubs = [];
    }
};

window.HomePage = HomePage;
