const HeaderComponent = {
    _unsubs: [],

    async render() {
        const container = document.getElementById('header');
        if (!container) return;
        container.innerHTML = `
            <header class="fixed top-0 left-0 right-0 z-50" style="background:var(--navbar-bg); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid var(--border); height:60px;">
                <div class="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
                    <div class="flex items-center gap-4">
                        <button onclick="window._toggleSidebar()" class="p-2 rounded-lg" style="color:var(--text-secondary);">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                        <a href="javascript:Router.navigate('/')" class="flex items-center gap-2">
                            <img src="/icons/icon.png" alt="Audivo" class="w-8 h-8 rounded-lg object-cover">
                            <span class="text-lg font-bold hidden sm:block" style="color:var(--text);">Audivo</span>
                        </a>
                    </div>
                    <nav class="hidden md:flex items-center gap-1">
                        ${['Home', 'Library', 'Search', 'Playlists'].map(label => {
                            const path = '/' + label.toLowerCase();
                            const active = Router.getCurrentPath() === path;
                            return `<a href="javascript:Router.navigate('${path}')" 
                                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'active-nav' : ''}"
                                style="${active ? `background:var(--surface-active); color:var(--text);` : `color:var(--text-secondary); hover:background:var(--surface-hover);`}"
                                onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${active ? 'var(--surface-active)' : 'transparent'}'">
                                ${label}
                            </a>`;
                        }).join('')}
                    </nav>
                    <div class="flex items-center gap-2">
                        <button onclick="Router.navigate('/search')" class="p-2 rounded-lg" style="color:var(--text-secondary);" title="Search">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </button>
                        <button onclick="Router.navigate('/downloads')" class="p-2 rounded-lg" style="color:var(--text-secondary);" title="Downloads">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </button>
                        <button onclick="Router.navigate('/settings')" class="p-2 rounded-lg" style="color:var(--text-secondary);" title="Settings">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </button>
                    </div>
                </div>
            </header>
        `;
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};
