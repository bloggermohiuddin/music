class MusicDatabase {
    constructor() {
        this.dbName = 'MusicPlayerDB';
        this.version = 4;
        this.db = null;
        this.stores = {
            songs: '++id, title, artist, album, duration, source_type, created_at, size, favorite',
            playlists: '++id, name, created_at',
            playlist_songs: '++id, playlist_id, song_id, position',
            history: '++id, song_id, last_played, position',
            favorites: '++id, song_id, added_at',
            downloads: '++id, url, title, progress, status, song_id, created_at',
            lyrics: '++id, song_id, plain_lyrics, synced_lyrics, fetched_at',
            settings: '++id, key, value'
        };
    }

    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                Object.entries(this.stores).forEach(([name, schema]) => {
                    if (!db.objectStoreNames.contains(name)) {
                        const store = db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
                        schema.split(',').forEach(field => {
                            const f = field.trim().replace(/^\+{2}/, '');
                            if (f !== 'id') {
                                store.createIndex(f, f, { unique: false });
                            }
                        });
                    }
                });
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this);
            };
            request.onerror = () => reject(request.error);
        });
    }

    _store(name) {
        return this.db.transaction([name], 'readwrite').objectStore(name);
    }

    _storeRO(name) {
        return this.db.transaction([name], 'readonly').objectStore(name);
    }

    async add(storeName, data) {
        if (!data.id) data.id = Utils.generateId();
        return new Promise((resolve, reject) => {
            const req = this._store(storeName).add(data);
            req.onsuccess = () => resolve(data.id);
            req.onerror = () => reject(req.error);
        });
    }

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const req = this._store(storeName).put(data);
            req.onsuccess = () => resolve(data.id);
            req.onerror = () => reject(req.error);
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const req = this._storeRO(storeName).get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const req = this._storeRO(storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const req = this._store(storeName).delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const req = this._store(storeName).clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async count(storeName) {
        return new Promise((resolve, reject) => {
            const req = this._storeRO(storeName).count();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const req = this._storeRO(storeName).index(indexName).getAll(value);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async getByIndexRange(storeName, indexName, range) {
        return new Promise((resolve, reject) => {
            const req = this._storeRO(storeName).index(indexName).getAll(range);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async searchSongs(query) {
        const songs = await this.getAll('songs');
        const q = query.toLowerCase();
        return songs.filter(s =>
            (s.title && s.title.toLowerCase().includes(q)) ||
            (s.artist && s.artist.toLowerCase().includes(q)) ||
            (s.album && s.album.toLowerCase().includes(q))
        );
    }

    async addSong(songData) {
        const song = {
            id: songData.id || Utils.generateId(),
            title: songData.title || 'Unknown',
            artist: songData.artist || 'Unknown Artist',
            album: songData.album || 'Unknown Album',
            duration: songData.duration || 0,
            thumbnail: songData.thumbnail || null,
            blob: songData.blob || null,
            source_type: songData.source_type || 'upload',
            youtube_url: songData.youtube_url || null,
            size: songData.size || 0,
            created_at: songData.created_at || Date.now(),
            favorite: songData.favorite || 0
        };
        await this.put('songs', song);
        return song.id;
    }

    async addToHistory(songId, position = 0) {
        const existing = await this.getByIndex('history', 'song_id', songId);
        if (existing.length > 0) {
            const entry = existing[0];
            entry.last_played = Date.now();
            entry.position = position;
            await this.put('history', entry);
        } else {
            await this.add('history', {
                song_id: songId,
                last_played: Date.now(),
                position: position
            });
        }
    }

    async getHistory() {
        const history = await this.getAll('history');
        history.sort((a, b) => b.last_played - a.last_played);
        const songs = [];
        for (const h of history) {
            const song = await this.get('songs', h.song_id);
            if (song) songs.push({ ...song, last_played: h.last_played, resumePosition: h.position });
        }
        return songs;
    }

    async toggleFavorite(songId) {
        const song = await this.get('songs', songId);
        if (song) {
            song.favorite = song.favorite ? 0 : 1;
            await this.put('songs', song);
            if (song.favorite) {
                const existing = await this.getByIndex('favorites', 'song_id', songId);
                if (existing.length === 0) {
                    await this.add('favorites', { song_id: songId, added_at: Date.now() });
                }
            } else {
                const existing = await this.getByIndex('favorites', 'song_id', songId);
                for (const e of existing) await this.delete('favorites', e.id);
            }
        }
    }

    async getFavorites() {
        const favs = await this.getAll('favorites');
        favs.sort((a, b) => b.added_at - a.added_at);
        const songs = [];
        for (const f of favs) {
            const song = await this.get('songs', f.song_id);
            if (song) songs.push({ ...song, added_at: f.added_at });
        }
        return songs;
    }

    async getPlaylistSongs(playlistId) {
        const items = await this.getByIndex('playlist_songs', 'playlist_id', playlistId);
        items.sort((a, b) => a.position - b.position);
        const songs = [];
        for (const item of items) {
            const song = await this.get('songs', item.song_id);
            if (song) songs.push(song);
        }
        return songs;
    }

    async addToPlaylist(playlistId, songId) {
        const items = await this.getByIndex('playlist_songs', 'playlist_id', playlistId);
        const maxPos = items.reduce((max, item) => Math.max(max, item.position), -1);
        await this.add('playlist_songs', {
            playlist_id: playlistId,
            song_id: songId,
            position: maxPos + 1
        });
    }

    async removeFromPlaylist(playlistId, songId) {
        const items = await this.getByIndex('playlist_songs', 'playlist_id', playlistId);
        for (const item of items) {
            if (item.song_id === songId) {
                await this.delete('playlist_songs', item.id);
            }
        }
    }

    async reorderPlaylist(playlistId, songIds) {
        const items = await this.getByIndex('playlist_songs', 'playlist_id', playlistId);
        const itemMap = {};
        items.forEach(item => { itemMap[item.song_id] = item; });
        for (let i = 0; i < songIds.length; i++) {
            const item = itemMap[songIds[i]];
            if (item) {
                item.position = i;
                await this.put('playlist_songs', item);
            }
        }
    }

    async getSetting(key) {
        const items = await this.getByIndex('settings', 'key', key);
        return items.length > 0 ? items[0].value : null;
    }

    async setSetting(key, value) {
        const items = await this.getByIndex('settings', 'key', key);
        if (items.length > 0) {
            items[0].value = value;
            await this.put('settings', items[0]);
        } else {
            await this.add('settings', { key, value });
        }
    }

    async getStorageInfo() {
        const songs = await this.getAll('songs');
        let totalSize = 0;
        let songCount = 0;
        let thumbnailCount = 0;
        let thumbnailSize = 0;
        for (const s of songs) {
            if (s.blob) {
                totalSize += s.size || s.blob.size || 0;
                songCount++;
            }
            if (s.thumbnail) {
                thumbnailCount++;
                thumbnailSize += s.thumbnail.length;
            }
        }
        return { totalSize, songCount, thumbnailCount, thumbnailSize };
    }

    async exportDatabase() {
        const data = {};
        for (const name of Object.keys(this.stores)) {
            if (name !== 'settings') {
                data[name] = await this.getAll(name);
            }
        }
        return data;
    }

    async importDatabase(data) {
        for (const [name, items] of Object.entries(data)) {
            if (this.stores[name]) {
                await this.clear(name);
                for (const item of items) {
                    await this.add(name, item);
                }
            }
        }
    }

    async getDownloadQueue() {
        return await this.getAll('downloads');
    }

    async addDownload(downloadData) {
        downloadData.id = downloadData.id || Utils.generateId();
        downloadData.status = downloadData.status || 'queued';
        downloadData.progress = downloadData.progress || 0;
        downloadData.created_at = downloadData.created_at || Date.now();
        await this.put('downloads', downloadData);
        return downloadData.id;
    }

    async updateDownload(id, data) {
        const existing = await this.get('downloads', id);
        if (existing) {
            Object.assign(existing, data);
            await this.put('downloads', existing);
        }
    }

    async deleteSong(songId) {
        const song = await this.get('songs', songId);
        if (song && song.blob) {
            song.blob = null;
            await this.put('songs', song);
        }
        await this.delete('songs', songId);
        const historyItems = await this.getByIndex('history', 'song_id', songId);
        for (const h of historyItems) await this.delete('history', h.id);
        const favItems = await this.getByIndex('favorites', 'song_id', songId);
        for (const f of favItems) await this.delete('favorites', f.id);
        const psItems = await this.getByIndex('playlist_songs', 'song_id', songId);
        for (const p of psItems) await this.delete('playlist_songs', p.id);
    }

    async updateSong(songId, updates) {
        const song = await this.get('songs', songId);
        if (!song) return null;
        Object.assign(song, updates);
        await this.put('songs', song);
        return song;
    }

    async detectDuplicates(fileSize, title) {
        const songs = await this.getAll('songs');
        return songs.filter(s => s.size === fileSize);
    }

    async saveLyrics(songId, plainLyrics, syncedLyrics) {
        const existing = await this.getByIndex('lyrics', 'song_id', songId);
        const data = { song_id: songId, plain_lyrics: plainLyrics || null, synced_lyrics: syncedLyrics || null, fetched_at: Date.now() };
        if (existing.length > 0) {
            data.id = existing[0].id;
            await this.put('lyrics', data);
        } else {
            await this.add('lyrics', data);
        }
    }

    async getLyrics(songId) {
        const items = await this.getByIndex('lyrics', 'song_id', songId);
        return items.length > 0 ? items[0] : null;
    }

    async deleteLyrics(songId) {
        const items = await this.getByIndex('lyrics', 'song_id', songId);
        for (const item of items) await this.delete('lyrics', item.id);
    }

    async searchLyricsOnline(artist, title, album, duration) {
        try {
            const params = new URLSearchParams({
                artist_name: artist || '',
                track_name: title || '',
                album_name: album || '',
                duration: Math.round(duration || 0)
            });
            const resp = await fetch(`https://lrclib.net/api/get?${params}`, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok) return null;
            return await resp.json();
        } catch (e) {
            console.warn('Lyrics fetch failed:', e);
            return null;
        }
    }

    async searchLyricsByQuery(query) {
        try {
            const resp = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok) return [];
            const data = await resp.json();
            return data;
        } catch (e) {
            console.warn('Lyrics search failed:', e);
            return [];
        }
    }
}

window.DB = new MusicDatabase();
