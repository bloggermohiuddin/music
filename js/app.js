(async function() {
    'use strict';

    window.addEventListener('error', (e) => {
        console.error('Uncaught error:', e.error);
        Store.showNotification?.('Something went wrong. Check console.', 'error');
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled rejection:', e.reason);
    });

    try {
        await DB.open();
        console.log('Database opened successfully');
    } catch (e) {
        console.error('Failed to open database:', e);
        document.getElementById('app').innerHTML = `
            <div class="flex items-center justify-center h-screen" style="background:var(--bg);">
                <div class="text-center p-8">
                    <h1 class="text-2xl font-bold mb-4" style="color:var(--text);">Database Error</h1>
                    <p style="color:var(--text-secondary);">Failed to initialize IndexedDB. Please ensure your browser supports IndexedDB and try again.</p>
                </div>
            </div>
        `;
        return;
    }

    await Theme.init();
    console.log('Theme initialized');

    await Store.refreshAll();
    console.log('Store refreshed');

    const root = document.getElementById('app');
    root.innerHTML = `
        <div id="header" class="fixed top-0 left-0 right-0 z-50"></div>
        <div id="sidebar-backdrop" onclick="Store.set('sidebarOpen', false)"></div>
        <div id="sidebar"></div>
        <main id="main-content" class="transition-all duration-300 ease-in-out pt-[60px]" style="margin-left:var(--sidebar-width, 240px);">
        </main>
        <div id="mini-player"></div>
        <div id="notification-container" class="fixed top-20 right-4 z-[100] space-y-2"></div>
        <div id="context-menu" class="hidden fixed z-[200] rounded-xl shadow-2xl transition-all duration-150" style="background:var(--glass-bg); border:1px solid var(--glass-border); backdrop-filter:blur(20px); min-width:200px; opacity:0; transform:scale(0.95);"></div>
    `;

    Router.use(async (path) => {
        document.getElementById('sidebar')?.style.setProperty('display', 'block');
    });

    ContextMenu.init();

    Router.after(async (path) => {
        try {
            await HeaderComponent.render();
            await SidebarComponent.render();
            await MiniPlayerComponent.render();
            updateActiveNav();
            if (window.innerWidth <= 1024) {
                Store.set('sidebarOpen', false);
            }
        } catch (e) {
            console.error('Error rendering layout:', e);
        }
    });

    Router.addRoute('/', async () => {
        try {
            document.title = 'Audivo - Home';
            await HomePage.render();
        } catch (e) { console.error('HomePage error:', e); }
    });

    Router.addRoute('/library', async () => {
        try {
            document.title = 'Audivo - Library';
            await LibraryPage.render();
        } catch (e) { console.error('LibraryPage error:', e); }
    });

    Router.addRoute('/player', async () => {
        try {
            document.title = 'Audivo - Now Playing';
            await PlayerPage.render();
        } catch (e) { console.error('PlayerPage error:', e); }
    });

    Router.addRoute('/search', async () => {
        try {
            document.title = 'Audivo - Search';
            await SearchPage.render();
        } catch (e) { console.error('SearchPage error:', e); }
    });

    Router.addRoute('/downloads', async () => {
        try {
            document.title = 'Audivo - Downloads';
            await DownloadsPage.render();
        } catch (e) { console.error('DownloadsPage error:', e); }
    });

    Router.addRoute('/playlists', async () => {
        try {
            document.title = 'Audivo - Playlists';
            await PlaylistsPage.render();
        } catch (e) { console.error('PlaylistsPage error:', e); }
    });

    Router.addRoute('/playlist/:id', async (params) => {
        try {
            document.title = 'Audivo - Playlist';
            await PlaylistDetailPage.render(params);
        } catch (e) { console.error('PlaylistDetailPage error:', e); }
    });

    Router.addRoute('/settings', async () => {
        try {
            document.title = 'Audivo - Settings';
            await SettingsPage.render();
        } catch (e) { console.error('SettingsPage error:', e); }
    });

    Router.addRoute('/history', async () => {
        try {
            document.title = 'Audivo - History';
            await HistoryPage.render();
        } catch (e) { console.error('HistoryPage error:', e); }
    });

    Router.addRoute('/favorites', async () => {
        try {
            document.title = 'Audivo - Favorites';
            await FavoritesPage.render();
        } catch (e) { console.error('FavoritesPage error:', e); }
    });

    // Store subscriptions for reactive updates
    Store.subscribe('currentSong', () => MiniPlayerComponent.render());
    Store.subscribe('isPlaying', () => {
        MiniPlayerComponent.updatePlayButton();
        if (Router.getCurrentPath() === '/player') {
            PlayerPage.updatePlayButton();
        }
    });
    Store.subscribe('currentTime', () => {
        MiniPlayerComponent.updateProgress();
        if (Router.getCurrentPath() === '/player') {
            PlayerPage.updateProgress();
        }
    });
    Store.subscribe('duration', () => {
        MiniPlayerComponent.updateProgress();
        if (Router.getCurrentPath() === '/player') {
            PlayerPage.updateProgress();
        }
    });

    Store.subscribe('notification', (notification) => {
        if (notification) {
            showNotification(notification.message, notification.type, notification.duration);
        }
    });

    function isMobile() { return window.innerWidth <= 1024; }

    window._toggleSidebar = function() {
        var isOpen = Store.get('sidebarOpen');
        Store.set('sidebarOpen', !isOpen);
    };

    function _applySidebarState(open) {
        var sidebar = document.getElementById('sidebar-inner');
        var backdrop = document.getElementById('sidebar-backdrop');
        var main = document.getElementById('main-content');
        if (!sidebar) return;

        if (isMobile()) {
            sidebar.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
            sidebar.style.width = '280px';
            if (backdrop) {
                backdrop.style.opacity = open ? '1' : '0';
                backdrop.style.pointerEvents = open ? 'all' : 'none';
            }
            document.body.style.overflow = open ? 'hidden' : '';
        } else {
            sidebar.style.transform = 'none';
            sidebar.style.width = open ? '240px' : '0px';
            sidebar.style.overflow = 'hidden';
            if (main) main.style.marginLeft = open ? '240px' : '0px';
            document.documentElement.style.setProperty('--sidebar-width', open ? '240px' : '0px');
        }
    }

    Store.subscribe('sidebarOpen', _applySidebarState);

    if (window.innerWidth <= 1024) Store.set('sidebarOpen', false);

    Router.init('/');
    console.log('Router initialized');

    // Register keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                Player.togglePlay();
                break;
            case 'ArrowLeft':
                Player.seekRelative(-5);
                break;
            case 'ArrowRight':
                Player.seekRelative(5);
                break;
            case 'ArrowUp':
                Player.setVolume(Math.min(1, Store.get('volume') + 0.1));
                break;
            case 'ArrowDown':
                Player.setVolume(Math.max(0, Store.get('volume') - 0.1));
                break;
            case 'KeyN':
                Player.next();
                break;
            case 'KeyP':
                Player.previous();
                break;
            case 'KeyM':
                Player.toggleMute();
                break;
            case 'KeyF':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
                break;
        }
    });

    var lastWasMobile = window.innerWidth <= 1024;
    window.addEventListener('resize', function() {
        var nowMobile = window.innerWidth <= 1024;
        if (nowMobile !== lastWasMobile) {
            lastWasMobile = nowMobile;
            Store.set('sidebarOpen', !nowMobile);
            SidebarComponent.render().then(function() {
                _applySidebarState(Store.get('sidebarOpen'));
            });
        }
    });

    function updateActiveNav() {
        document.querySelectorAll('.active-nav').forEach(el => el.classList.remove('active-nav'));
    }

    function showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const colors = {
            success: 'var(--primary)',
            error: '#ef4444',
            warning: '#f59e0b',
            info: 'var(--accent)'
        };

        const id = 'notif-' + Date.now();
        const el = document.createElement('div');
        el.id = id;
        el.className = 'notification-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 translate-x-full';
        el.style.cssText = `
            background:var(--glass-bg);
            border:1px solid var(--glass-border);
            backdrop-filter:blur(20px);
            color:var(--text);
            transform:translateX(120%);
            opacity:0;
        `;

        el.innerHTML = `
            <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${colors[type] || colors.info};"></div>
            <p class="text-sm">${message}</p>
            <button onclick="this.parentElement.remove()" class="ml-auto p-1 rounded hover:bg-surface" style="color:var(--text-muted);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        `;

        container.appendChild(el);

        requestAnimationFrame(() => {
            el.style.transform = 'translateX(0)';
            el.style.opacity = '1';
        });

        setTimeout(() => {
            el.style.transform = 'translateX(120%)';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        }, duration);
    }

    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            console.log('ServiceWorker registered:', registration.scope);

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showNotification('App updated! Refresh for new version.', 'info', 10000);
                    }
                });
            });
        } catch (e) {
            console.warn('ServiceWorker registration failed:', e);
        }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
        showNotification('Back online', 'success');
    });

    window.addEventListener('offline', () => {
        showNotification('You are offline - playing from cache', 'warning', 5000);
    });

    // Drag and drop support for upload
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        document.getElementById('app')?.style.setProperty('opacity', '0.7');
    });

    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        document.getElementById('app')?.style.setProperty('opacity', '1');
    });

    document.addEventListener('drop', async (e) => {
        e.preventDefault();
        document.getElementById('app')?.style.setProperty('opacity', '1');
        const files = Array.from(e.dataTransfer.files).filter(f => Utils.isAudioFile(f.name));
        if (files.length > 0) {
            await HomePage._handleUpload(files);
            Store.showNotification(`${files.length} file(s) uploaded`, 'success');
        }
    });

    // Visibility change for background playback
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && Player.isPlaying()) {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        }
    });

})();
