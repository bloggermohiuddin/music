class ThemeEngine {
    constructor() {
        this.themes = {
            dark: {
                name: 'Dark',
                icon: '🌙',
                colors: {
                    bg: '#0a0a0f',
                    surface: 'rgba(255,255,255,0.05)',
                    surfaceHover: 'rgba(255,255,255,0.1)',
                    surfaceActive: 'rgba(255,255,255,0.15)',
                    text: '#e8e8e8',
                    textSecondary: '#a0a0a0',
                    textMuted: '#666',
                    primary: '#1db954',
                    primaryHover: '#1ed760',
                    accent: '#e91e63',
                    border: 'rgba(255,255,255,0.08)',
                    shadow: 'rgba(0,0,0,0.5)',
                    glassBg: 'rgba(10,10,15,0.85)',
                    glassBorder: 'rgba(255,255,255,0.08)',
                    navbarBg: 'rgba(10,10,15,0.95)',
                    playerBg: 'rgba(10,10,15,0.98)',
                    cardBg: 'rgba(255,255,255,0.04)',
                    inputBg: 'rgba(255,255,255,0.06)',
                    scrollbar: 'rgba(255,255,255,0.15)',
                    scrollbarHover: 'rgba(255,255,255,0.25)'
                }
            },
            oled: {
                name: 'Pure Black OLED',
                icon: '⬛',
                colors: {
                    bg: '#000000',
                    surface: 'rgba(255,255,255,0.03)',
                    surfaceHover: 'rgba(255,255,255,0.06)',
                    surfaceActive: 'rgba(255,255,255,0.1)',
                    text: '#ffffff',
                    textSecondary: '#aaa',
                    textMuted: '#555',
                    primary: '#1db954',
                    primaryHover: '#1ed760',
                    accent: '#e91e63',
                    border: 'rgba(255,255,255,0.05)',
                    shadow: 'rgba(0,0,0,0.8)',
                    glassBg: 'rgba(0,0,0,0.9)',
                    glassBorder: 'rgba(255,255,255,0.06)',
                    navbarBg: '#000000',
                    playerBg: '#000000',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(255,255,255,0.1)',
                    scrollbarHover: 'rgba(255,255,255,0.2)'
                }
            },
            light: {
                name: 'Light',
                icon: '☀️',
                colors: {
                    bg: '#f5f5f5',
                    surface: 'rgba(0,0,0,0.03)',
                    surfaceHover: 'rgba(0,0,0,0.06)',
                    surfaceActive: 'rgba(0,0,0,0.1)',
                    text: '#1a1a1a',
                    textSecondary: '#555',
                    textMuted: '#999',
                    primary: '#1db954',
                    primaryHover: '#1aa34a',
                    accent: '#e91e63',
                    border: 'rgba(0,0,0,0.08)',
                    shadow: 'rgba(0,0,0,0.1)',
                    glassBg: 'rgba(255,255,255,0.85)',
                    glassBorder: 'rgba(0,0,0,0.08)',
                    navbarBg: 'rgba(255,255,255,0.95)',
                    playerBg: 'rgba(255,255,255,0.98)',
                    cardBg: 'rgba(255,255,255,0.8)',
                    inputBg: 'rgba(0,0,0,0.04)',
                    scrollbar: 'rgba(0,0,0,0.15)',
                    scrollbarHover: 'rgba(0,0,0,0.25)'
                }
            },
            glass: {
                name: 'Glassmorphism',
                icon: '🪟',
                colors: {
                    bg: '#0a0a1a',
                    surface: 'rgba(255,255,255,0.06)',
                    surfaceHover: 'rgba(255,255,255,0.1)',
                    surfaceActive: 'rgba(255,255,255,0.15)',
                    text: '#ffffff',
                    textSecondary: '#b0b0b0',
                    textMuted: '#707070',
                    primary: '#7c3aed',
                    primaryHover: '#8b5cf6',
                    accent: '#f472b6',
                    border: 'rgba(255,255,255,0.12)',
                    shadow: 'rgba(0,0,0,0.3)',
                    glassBg: 'rgba(255,255,255,0.08)',
                    glassBorder: 'rgba(255,255,255,0.15)',
                    navbarBg: 'rgba(10,10,26,0.8)',
                    playerBg: 'rgba(10,10,26,0.9)',
                    cardBg: 'rgba(255,255,255,0.04)',
                    inputBg: 'rgba(255,255,255,0.06)',
                    scrollbar: 'rgba(255,255,255,0.15)',
                    scrollbarHover: 'rgba(255,255,255,0.25)'
                }
            },
            neon: {
                name: 'Neon',
                icon: '💜',
                colors: {
                    bg: '#0d0d1a',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.08)',
                    surfaceActive: 'rgba(255,255,255,0.12)',
                    text: '#e0e0ff',
                    textSecondary: '#9999cc',
                    textMuted: '#555577',
                    primary: '#00ff88',
                    primaryHover: '#00ff99',
                    accent: '#ff00ff',
                    border: 'rgba(0,255,136,0.15)',
                    shadow: 'rgba(0,255,136,0.2)',
                    glassBg: 'rgba(13,13,26,0.85)',
                    glassBorder: 'rgba(0,255,136,0.15)',
                    navbarBg: 'rgba(13,13,26,0.95)',
                    playerBg: 'rgba(13,13,26,0.98)',
                    cardBg: 'rgba(0,255,136,0.03)',
                    inputBg: 'rgba(0,255,136,0.05)',
                    scrollbar: 'rgba(0,255,136,0.2)',
                    scrollbarHover: 'rgba(0,255,136,0.3)'
                }
            },
            forest: {
                name: 'Forest',
                icon: '🌲',
                colors: {
                    bg: '#0f1a12',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#d4e8d4',
                    textSecondary: '#8aaa8a',
                    textMuted: '#4a6a4a',
                    primary: '#4caf50',
                    primaryHover: '#66bb6a',
                    accent: '#a5d6a7',
                    border: 'rgba(76,175,80,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(15,26,18,0.85)',
                    glassBorder: 'rgba(76,175,80,0.12)',
                    navbarBg: 'rgba(15,26,18,0.95)',
                    playerBg: 'rgba(15,26,18,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(76,175,80,0.2)',
                    scrollbarHover: 'rgba(76,175,80,0.3)'
                }
            },
            ocean: {
                name: 'Ocean',
                icon: '🌊',
                colors: {
                    bg: '#0a1628',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#d0e4f0',
                    textSecondary: '#7aa8c8',
                    textMuted: '#3a6888',
                    primary: '#2196f3',
                    primaryHover: '#42a5f5',
                    accent: '#00bcd4',
                    border: 'rgba(33,150,243,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(10,22,40,0.85)',
                    glassBorder: 'rgba(33,150,243,0.12)',
                    navbarBg: 'rgba(10,22,40,0.95)',
                    playerBg: 'rgba(10,22,40,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(33,150,243,0.2)',
                    scrollbarHover: 'rgba(33,150,243,0.3)'
                }
            },
            sunset: {
                name: 'Sunset',
                icon: '🌅',
                colors: {
                    bg: '#1a0f0a',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#f0e0d0',
                    textSecondary: '#c89878',
                    textMuted: '#785838',
                    primary: '#ff7043',
                    primaryHover: '#ff8a65',
                    accent: '#ffab91',
                    border: 'rgba(255,112,67,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(26,15,10,0.85)',
                    glassBorder: 'rgba(255,112,67,0.12)',
                    navbarBg: 'rgba(26,15,10,0.95)',
                    playerBg: 'rgba(26,15,10,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(255,112,67,0.2)',
                    scrollbarHover: 'rgba(255,112,67,0.3)'
                }
            },
            midnight: {
                name: 'Midnight',
                icon: '🌙',
                colors: {
                    bg: '#0a0a1e',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#d0d0f0',
                    textSecondary: '#8080b0',
                    textMuted: '#404070',
                    primary: '#7c4dff',
                    primaryHover: '#9575ff',
                    accent: '#ea80fc',
                    border: 'rgba(124,77,255,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(10,10,30,0.85)',
                    glassBorder: 'rgba(124,77,255,0.12)',
                    navbarBg: 'rgba(10,10,30,0.95)',
                    playerBg: 'rgba(10,10,30,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(124,77,255,0.2)',
                    scrollbarHover: 'rgba(124,77,255,0.3)'
                }
            },
            dracula: {
                name: 'Dracula',
                icon: '🧛',
                colors: {
                    bg: '#1e1330',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#e8d8f8',
                    textSecondary: '#a898c0',
                    textMuted: '#584870',
                    primary: '#bd93f9',
                    primaryHover: '#cfaaff',
                    accent: '#ff79c6',
                    border: 'rgba(189,147,249,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(30,19,48,0.85)',
                    glassBorder: 'rgba(189,147,249,0.12)',
                    navbarBg: 'rgba(30,19,48,0.95)',
                    playerBg: 'rgba(30,19,48,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(189,147,249,0.2)',
                    scrollbarHover: 'rgba(189,147,249,0.3)'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                icon: '🔮',
                colors: {
                    bg: '#0a0a14',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#f0e0ff',
                    textSecondary: '#a080d0',
                    textMuted: '#504070',
                    primary: '#ff2d95',
                    primaryHover: '#ff55aa',
                    accent: '#00e5ff',
                    border: 'rgba(255,45,149,0.2)',
                    shadow: 'rgba(255,45,149,0.15)',
                    glassBg: 'rgba(10,10,20,0.85)',
                    glassBorder: 'rgba(255,45,149,0.15)',
                    navbarBg: 'rgba(10,10,20,0.95)',
                    playerBg: 'rgba(10,10,20,0.98)',
                    cardBg: 'rgba(255,45,149,0.03)',
                    inputBg: 'rgba(255,45,149,0.06)',
                    scrollbar: 'rgba(255,45,149,0.25)',
                    scrollbarHover: 'rgba(255,45,149,0.35)'
                }
            },
            sepia: {
                name: 'Sepia',
                icon: '📜',
                colors: {
                    bg: '#1a1410',
                    surface: 'rgba(255,255,255,0.04)',
                    surfaceHover: 'rgba(255,255,255,0.07)',
                    surfaceActive: 'rgba(255,255,255,0.11)',
                    text: '#e0d0b8',
                    textSecondary: '#a89078',
                    textMuted: '#685040',
                    primary: '#d4a373',
                    primaryHover: '#e0b88a',
                    accent: '#f0d0a0',
                    border: 'rgba(212,163,115,0.15)',
                    shadow: 'rgba(0,0,0,0.4)',
                    glassBg: 'rgba(26,20,16,0.85)',
                    glassBorder: 'rgba(212,163,115,0.12)',
                    navbarBg: 'rgba(26,20,16,0.95)',
                    playerBg: 'rgba(26,20,16,0.98)',
                    cardBg: 'rgba(255,255,255,0.03)',
                    inputBg: 'rgba(255,255,255,0.05)',
                    scrollbar: 'rgba(212,163,115,0.2)',
                    scrollbarHover: 'rgba(212,163,115,0.3)'
                }
            }
        };
        this.currentTheme = 'dark';
    }

    async init() {
        const saved = await DB.getSetting('theme');
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        }
        this.apply(this.currentTheme);
    }

    apply(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        this.currentTheme = themeName;
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        });
        localStorage.setItem('player-theme', themeName);
        DB.setSetting('theme', themeName);
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = theme.colors.bg;
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName, colors: theme.colors } }));
    }

    getTheme(name) {
        return this.themes[name] || this.themes[this.currentTheme];
    }

    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    getAllThemes() {
        return Object.entries(this.themes).map(([key, val]) => ({ key, ...val }));
    }

    setTheme(name) {
        if (this.themes[name]) {
            this.apply(name);
        }
    }
}

window.Theme = new ThemeEngine();
