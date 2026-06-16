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
