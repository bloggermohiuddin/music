const SidebarComponent = {
    _unsubs: [],

    async render() {
        const container = document.getElementById('sidebar');
        if (!container) return;
        const open = Store.get('sidebarOpen');
        const playlists = Store.get('playlists');
        const mobile = window.innerWidth <= 1024;
        const sidebarWidth = mobile ? 280 : 240;

        container.innerHTML = `
            <aside id="sidebar-inner" class="fixed left-0 top-[60px] bottom-[80px] z-40"
                style="width:${sidebarWidth}px; background:var(--navbar-bg); border-right:1px solid var(--border); backdrop-filter:blur(20px); overflow:hidden; transform:${mobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none'}; transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); ${!mobile ? 'width:' + (open ? '240' : '0') + 'px' : ''};">
                <div class="p-4" style="min-width:${sidebarWidth}px; width:${sidebarWidth}px; overflow-y:auto; height:100%;">
                    <div class="flex items-center justify-end mb-2">
                        <button id="sidebar-pin-btn" class="p-1 rounded transition-all" style="color:${Store.get('sidebarPinned') ? 'var(--primary)' : 'var(--text-muted)'}; hover:color:var(--text);" title="${Store.get('sidebarPinned') ? 'Unpin sidebar' : 'Pin sidebar'}">
                            <svg class="w-4 h-4" fill="${Store.get('sidebarPinned') ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a4 4 0 11-8 0 4 4 0 018 0zm-8 0V7a4 4 0 118 0v4M7 17h10v2H7v-2z"/></svg>
                        </button>
                    </div>
                    <div class="space-y-1 mb-6">
                        ${[
                            { label: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                            { label: 'Library', path: '/library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                            { label: 'Search', path: '/search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                            { label: 'Playlists', path: '/playlists', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
                        ].map(item => {
                            const active = Router.getCurrentPath() === item.path;
                            return `<a href="javascript:Router.navigate('${item.path}')"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'active-nav' : ''}"
                                style="${active ? `background:var(--surface-active); color:var(--text);` : `color:var(--text-secondary);`}"
                                onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${active ? 'var(--surface-active)' : 'transparent'}'">
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
                                ${item.label}
                            </a>`;
                        }).join('')}
                    </div>
                    <div class="mb-4">
                        <div class="flex items-center justify-between px-3 mb-2">
                            <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Library</span>
                            <span class="text-xs" style="color:var(--text-muted);">${Store.get('songs').length} songs</span>
                        </div>
                        ${[
                            { label: 'History', path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { label: 'Favorites', path: '/favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                            { label: 'Downloads', path: '/downloads', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        ].map(item => {
                            const active = Router.getCurrentPath() === item.path;
                            return `<a href="javascript:Router.navigate('${item.path}')"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active ? 'active-nav' : ''}"
                                style="${active ? `background:var(--surface-active); color:var(--text);` : `color:var(--text-secondary);`}"
                                onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${active ? 'var(--surface-active)' : 'transparent'}'">
                                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
                                ${item.label}
                            </a>`;
                        }).join('')}
                    </div>
                    <div>
                        <div class="flex items-center justify-between px-3 mb-2">
                            <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Playlists</span>
                            <button id="create-playlist-btn" class="text-xs p-1 rounded hover:bg-surface-hover transition" style="color:var(--primary);">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            </button>
                        </div>
                        <div id="playlist-list" class="space-y-0.5">
                            ${playlists.length === 0 ? '<p class="px-3 text-xs" style="color:var(--text-muted);">No playlists yet</p>' :
                                playlists.map(p => {
                                    const active = Router.getCurrentPath() === `/playlist/${p.id}`;
                                    return `<a href="javascript:Router.navigate('/playlist/${p.id}')"
                                        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active ? 'active-nav' : ''}"
                                        style="${active ? `background:var(--surface-active); color:var(--text);` : `color:var(--text-secondary);`}"
                                        onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${active ? 'var(--surface-active)' : 'transparent'}'">
                                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                                        <span class="truncate">${p.name}</span>
                                    </a>`;
                                }).join('')
                            }
                        </div>
                    </div>
                </div>
            </aside>
        `;
        this._bindEvents();
    },

    _bindEvents() {
        document.getElementById('sidebar-pin-btn')?.addEventListener('click', () => {
            const pinned = !Store.get('sidebarPinned');
            Store.set('sidebarPinned', pinned);
            this.render();
        });
        document.getElementById('create-playlist-btn')?.addEventListener('click', () => {
            Router.navigate('/playlists');
            setTimeout(() => {
                document.getElementById('new-playlist-btn')?.click();
            }, 300);
        });
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};
