# Audivo — Offline-First PWA

A production-grade, single-page music web application (PWA) that works like YouTube Music / Spotify, built entirely with frontend technologies. Fully client-side, offline-first, and installable.

## Features

### Core
- **SPA Architecture** — No page reloads. History API navigation with pushState. Browser refresh preserves current route.
- **Offline-First** — All songs stored as blobs in IndexedDB. Service Worker caches everything. Works in airplane mode.
- **Installable PWA** — Web App Manifest, Service Worker, standalone mode, lock screen controls.
- **Dark Mode + Themes** — 5 themes: Dark, Pure Black OLED, Light, Glassmorphism, Neon.

### Music Library
- Upload MP3, M4A, WAV, AAC, OGG, FLAC
- Automatic metadata extraction (title, artist, album, duration, embedded thumbnail)
- Drag-and-drop upload support
- Duplicate detection
- Grid/List view with sorting (date, title, artist, duration)

### YouTube Download
- Paste YouTube or YouTube Music links
- API integration → direct MP3 → blob → IndexedDB
- Thumbnail caching
- Persistent offline storage

### Audio Player
- Play / Pause / Stop / Seek / Volume / Mute
- Playback speed (0.5x – 2x)
- Repeat modes: none, all, one
- Shuffle
- Queue system with autoplay
- Waveform visualizer (Web Audio API)
- Crossfade (0–12 seconds)
- Fade in / Fade out
- Sleep timer (15/30/45/60 min)
- Media Session API (lock screen controls)

### Playlist System
- Create, rename, delete playlists
- Add/remove songs
- Play all
- Song count tracking

### Search
- Real-time instant search by title, artist, album
- Debounced input

### Download Manager
- Download queue with progress bars
- Status tracking (queued, downloading, completed, error)

### Storage Management
- View total song count, size, thumbnails
- Delete all songs
- Export / Import full database as JSON backup

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `ArrowLeft` | Seek -5s |
| `ArrowRight` | Seek +5s |
| `ArrowUp` | Volume + |
| `ArrowDown` | Volume - |
| `N` | Next track |
| `P` | Previous track |
| `M` | Mute toggle |
| `F` | Fullscreen toggle |

### Performance
- Virtual scrolling-ready architecture
- Lazy-loaded components
- Efficient IndexedDB queries
- Web Worker for background processing
- No UI lag with 5000+ songs

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| Tailwind CSS (CDN) | Styling |
| Vanilla JS (ES6+) | Logic |
| IndexedDB | Large blob storage |
| Service Worker | Offline caching |
| Cache API | Static asset caching |
| Web App Manifest | PWA installation |
| History API | SPA routing |
| Web Audio API | Audio playback + visualization |
| Media Session API | Lock screen controls |
| Web Workers | Background tasks |
| LocalStorage | Settings persistence |

## Project Structure

```
├── index.html              # Entry point with Tailwind CSS
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── icons/
│   └── icon.svg            # App icon
└── js/
    ├── app.js              # Bootstrap, init, keyboard shortcuts
    ├── router.js           # History API SPA router
    ├── store.js            # Observable state management
    ├── db.js               # IndexedDB wrapper (7 stores)
    ├── player.js           # Audio player + Web Audio API
    ├── theme.js            # Theme engine (5 themes)
    ├── utils.js            # Utility functions
    ├── worker.js           # Web Worker
    └── components/
        ├── header.js       # Top navigation bar
        ├── sidebar.js      # Sidebar navigation
        ├── miniplayer.js   # Bottom mini player
        ├── home.js         # Dashboard page
        ├── library.js      # Music library page
        ├── search.js       # Search page
        ├── player.js       # Fullscreen player page
        ├── downloads.js    # YouTube download + upload
        ├── playlists.js    # Playlist management
        ├── settings.js     # Settings page
        ├── history.js      # Recently played page
        └── favorites.js    # Favorites page
```

## Getting Started

### Prerequisites
- A modern browser (Chrome, Firefox, Edge, Safari)
- A static HTTP server (for Service Worker registration)

### Quick Start
```bash
# Using npx
npx serve .

# Using Python
python -m http.server 8080

# Using VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Open `http://localhost:8080` in your browser.

### Install as PWA
1. Click the install icon in the browser's address bar (or Chrome menu → Install Audivo)
2. Launch from your desktop / start menu like a native app

## How It Works

### Audio Upload Flow
```
User selects file → FileReader → extractMetadata() → Blob → IndexedDB (songs store)
```

### YouTube Download Flow
```
User pastes URL → POST to API → get MP3 link → fetch() → Blob → IndexedDB (permanent)
```

### Offline Playback
```
Song blob in IndexedDB → URL.createObjectURL() → HTML5 Audio element → plays offline
```

### Data Persistence
All data survives browser refresh, tab closure, and offline mode. Everything is stored locally in IndexedDB and cache storage. No server, no backend, no tracking.

## API Reference

### YouTube Download Endpoint
```
POST https://bloggermahim.serv00.net/yt/api.php
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=..."
}
```

Response:
```json
{
  "status": true,
  "message": "Download successful!",
  "link": "DIRECT_MP3_URL",
  "title": "Song Title",
  "filesize": 4134657,
  "progress": 100,
  "duration": 284.862,
  "thumbnail": "https://img.youtube.com/vi/videoId/hqdefault.jpg"
}
```

## Themes

| Theme | Description |
|-------|-------------|
| Dark | Default dark theme with green accents |
| Pure Black OLED | True black background for OLED screens |
| Light | Clean light theme |
| Glassmorphism | Frosted glass effect with purple accents |
| Neon | Dark theme with cyan/magenta neon glow |

## License

MIT
