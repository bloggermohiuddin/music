var Store = (function() {
    var _state = {
        songs: [],
        playlists: [],
        currentPlaylist: null,
        currentSong: null,
        queue: [],
        queueIndex: -1,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        muted: false,
        repeat: 'none',
        shuffle: false,
        playbackSpeed: 1,
        searchQuery: '',
        searchResults: [],
        downloads: [],
        history: [],
        favorites: [],
        sidebarOpen: true,
        sidebarPinned: false,
        playerExpanded: false,
        showMiniPlayer: false,
        theme: 'dark',
        equalizer: { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 },
        effects: { reverb: 0, echo: 0, bassBoost: 0 },
        songOrder: null,
        sleepTimer: null,
        crossfade: 0,
        queuePanelOpen: true,
        carMode: false,
        lyrics: null,
        lyricsLoading: false,
        lyricsError: null,
        lyricsPanelOpen: false,
        storageInfo: { totalSize: 0, songCount: 0 },
        loading: false,
        notification: null,
        uploadProgress: 0
    };
    var _listeners = new Map();
    var _idCounter = 0;

    try { _state.volume = parseFloat(localStorage.getItem('player-volume')) || 0.8; } catch (e) {}

    function _notify(key, value, prev) {
        var subs = _listeners.get(key);
        if (subs) {
            subs.forEach(function(cb) {
                try { cb(value, prev); } catch (e) { console.error('Store listener error:', e); }
            });
        }
    }

    return {
        get state() { return _state; },

        setState: function(updates) {
            var prev = Object.assign({}, _state);
            Object.assign(_state, updates);
            var changedKeys = Object.keys(updates);
            changedKeys.forEach(function(key) {
                if (_state[key] !== prev[key]) {
                    _notify(key, _state[key], prev[key]);
                }
            });
            _notify('*', _state, prev);
        },

        get: function(key) { return _state[key]; },

        set: function(key, value) {
            var prev = _state[key];
            if (prev !== value) {
                _state[key] = value;
                _notify(key, value, prev);
                _notify('*', _state, Object.assign({}, prev, { [key]: prev }));
            }
        },

        subscribe: function(key, callback) {
            if (!_listeners.has(key)) {
                _listeners.set(key, new Map());
            }
            var id = ++_idCounter;
            _listeners.get(key).set(id, callback);
            return function() {
                var subs = _listeners.get(key);
                if (subs) subs.delete(id);
            };
        },

        loadSongs: async function() {
            this.set('loading', true);
            try {
                var songs = await DB.getAll('songs');
                this.set('songs', songs.filter(function(s) { return s.blob !== null; }));
                var info = await DB.getStorageInfo();
                this.set('storageInfo', info);
            } catch (e) {
                console.error('Failed to load songs:', e);
            }
            this.set('loading', false);
        },

        loadPlaylists: async function() {
            try {
                var playlists = await DB.getAll('playlists');
                this.set('playlists', playlists);
            } catch (e) {
                console.error('Failed to load playlists:', e);
            }
        },

        loadHistory: async function() {
            try {
                var history = await DB.getHistory();
                this.set('history', history);
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        },

        loadFavorites: async function() {
            try {
                var favorites = await DB.getFavorites();
                this.set('favorites', favorites);
            } catch (e) {
                console.error('Failed to load favorites:', e);
            }
        },

        loadDownloads: async function() {
            try {
                var downloads = await DB.getDownloadQueue();
                this.set('downloads', downloads);
            } catch (e) {
                console.error('Failed to load downloads:', e);
            }
        },

        addToQueue: function(song, position) {
            if (position === undefined) position = -1;
            var queue = _state.queue.slice();
            if (position === -1) {
                queue.push(song);
            } else {
                queue.splice(position, 0, song);
            }
            this.set('queue', queue);
        },

        removeFromQueue: function(index) {
            var queue = _state.queue.slice();
            var currentIdx = _state.queueIndex;
            queue.splice(index, 1);
            var newIndex = currentIdx;
            if (index <= currentIdx) newIndex = Math.max(0, currentIdx - 1);
            if (newIndex >= queue.length) newIndex = 0;
            this.set('queue', queue);
            this.set('queueIndex', newIndex);
        },

        clearQueue: function() {
            this.set('queue', []);
            this.set('queueIndex', -1);
        },

        setQueue: function(songs, startIndex) {
            if (startIndex === undefined) startIndex = 0;
            this.set('queue', songs);
            this.set('queueIndex', startIndex);
        },

        showNotification: function(message, type, duration) {
            if (type === undefined) type = 'info';
            if (duration === undefined) duration = 3000;
            this.set('notification', { message: message, type: type, duration: duration, id: Utils.generateId() });
        },

        addSong: async function(songData) {
            var id = await DB.addSong(songData);
            await this.loadSongs();
            return id;
        },

        deleteSong: async function(songId) {
            await DB.deleteSong(songId);
            if (_state.currentSong && _state.currentSong.id === songId) {
                Player.stop();
            }
            await this.loadSongs();
        },

        refreshAll: async function() {
            await Promise.all([
                this.loadSongs(),
                this.loadPlaylists(),
                this.loadHistory(),
                this.loadFavorites(),
                this.loadDownloads()
            ]);
        }
    };
})();

window.Store = Store;
