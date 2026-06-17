<p align="center">
  <img src="icons/logo-full.png" alt="Audivo" width="400">
</p>

<h3 align="center">FEEL EVERY SOUND</h3>

<p align="center">
  Offline-first PWA music player. Upload, play, download from YouTube, create playlists.<br>
  Fully client-side, no backend, no tracking.
</p>

<p align="center">
  <a href="https://github.com/bloggermohiuddin/music"><img src="https://img.shields.io/github/stars/bloggermohiuddin/music?style=social" alt="Stars"></a>
  <a href="https://github.com/bloggermohiuddin/music/network/members"><img src="https://img.shields.io/github/forks/bloggermohiuddin/music?style=social" alt="Forks"></a>
  <a href="https://github.com/bloggermohiuddin/music/issues"><img src="https://img.shields.io/github/issues/bloggermohiuddin/music" alt="Issues"></a>
  <a href="https://github.com/bloggermohiuddin/music/blob/main/LICENSE"><img src="https://img.shields.io/github/license/bloggermohiuddin/music" alt="License"></a>
</p>

---

## Features

### Core
- **SPA Architecture** — No page reloads. History API navigation with pushState. Browser refresh preserves current route.
- **Offline-First** — All songs stored as blobs in IndexedDB. Service Worker caches everything. Works in airplane mode.
- **Installable PWA** — Web App Manifest, Service Worker, standalone mode, lock screen controls.
- **PWA Auto-Update** — Versioned caches with skip-waiting. Check for Updates in settings compares versions and reloads automatically.
- **PWA Home Screen Widget** — Now Playing widget with artwork, playback controls, seek bar. BroadcastChannel communication with main app.
- **5 Themes** — Dark, Pure Black OLED, Light, Glassmorphism, Neon.

### Music Library
- Upload MP3, M4A, WAV, AAC, OGG, FLAC
- Automatic metadata extraction (title, artist, album, duration, embedded thumbnail)
- Drag-and-drop upload support
- Duplicate detection
- Grid / List / Artist view with sorting (date, title, artist, duration)
- **Now playing indicator** — animated bars on currently playing song
- **Edit song details** — rename title, artist, album, change thumbnail (upload from device or paste URL)
- **Single song delete** — right-click context menu or long-press
- **Batch select** — multi-select and delete multiple songs at once
- **Real-time updates** — library, home, favorites, history update immediately after edit/delete

### YouTube Download
- **Unified input** — paste a YouTube link OR type a search term in one field
- **YouTube search** — search songs, artists, albums directly from the app via PHP proxy (no CORS)
- **Grid results** — thumbnail with duration badge, title, one-tap download button
- **One-tap download** — tap any search result to download instantly
- Paste YouTube or YouTube Music links for direct download
- API integration → direct MP3 → blob → IndexedDB
- Thumbnail caching
- Persistent offline storage
- **Concurrent downloads** — multiple downloads run simultaneously
- **Download queue** — newest first, progress tracking, cancel individual downloads
- **Delete from queue** — X button on completed/failed items, "Clear done" bulk action
- **Download survives navigation** — leaving the downloads page does not cancel active downloads

### Audio Player
- Play / Pause / Stop / Seek / Volume / Mute
- Playback speed (0.5x – 2x)
- Repeat modes: none, all, one
- Shuffle
- **Shuffle All** — shuffle entire library into queue
- Queue system with autoplay
- **Queue drag reorder** — drag songs to rearrange queue
- **Sort queue A–Z** — sort queue alphabetically
- **Play Next** — insert song right after current track
- **Auto-update player page** — player UI updates when song changes via auto-next
- **Audio visualizer** — rounded bars with gradient, peak dots that slowly fall, 64 frequency bars
- Crossfade (0–12 seconds)
- Fade in / Fade out
- **Sleep timer in player** — presets (5/10/15/30/45/60 min) + custom input (1–480 min) with live countdown
- Media Session API (lock screen controls)

### Audio Effects
- **Reverb** — ConvolverNode with generated impulse response, adjustable wet/dry mix (0–100%)
- **Echo/Delay** — 300ms delay with feedback loop through lowpass filter, adjustable intensity (0–100%)
- **Bass Boost** — BiquadFilterNode lowshelf at 100Hz, adjustable gain (0–100%)
- Real-time Web Audio API processing, effects chain: source → EQ → bass boost → reverb/echo → gain
- Persistent settings, reset all effects in one click

### Equalizer
- 10-band graphic equalizer (60Hz – 16kHz)
- Bass boost / Treble boost presets
- Flat reset
- Real-time Web Audio API BiquadFilter processing

### Playlist System
- Create, rename, delete playlists
- **Add songs with search** — searchable list with thumbnails, click row to add instantly
- **Cards in playlist view** — songs shown as grid cards (same as library)
- **Mobile-friendly actions** — play and remove buttons visible on mobile, hover on desktop
- Play all
- Song count tracking (updates in real-time)

### Context Menu
- Right-click (desktop) or long-press (mobile 400ms) any song
- Play, Play Next, Add to Queue, Add to Playlist, Favorite, Share, Edit Details, Delete
- **Edit modal** — live thumbnail preview, upload image from device, clear thumbnail

### Search
- Real-time instant search by title, artist, album
- Debounced input

### Settings
- Volume control
- Crossfade duration
- Default playback speed
- Default repeat / shuffle
- **10-band Equalizer** with presets
- **Audio Effects** — reverb, echo, bass boost sliders with reset
- **Listening Stats** — total songs played, listen time, top 5 artists bar chart, last 7 days history chart
- Keyboard shortcuts reference
- **Check for Updates** — version comparison, auto-reload on new version
- Cache clear
- Export / Import full database as JSON backup
- Reset all settings

### Storage Management
- View total song count, size, thumbnails
- Delete all songs
- Cache clear
- Export / Import full database as JSON backup

### Error Handling
- Global error boundary catches uncaught exceptions
- Unhandled promise rejection tracking
- Route-level try-catch prevents full app crashes
- Blob integrity check — reconstructs corrupted blobs from IndexedDB

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

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| Tailwind CSS (CDN) | Styling |
| Vanilla JS (ES6+) | Logic |
| IndexedDB | Large blob storage |
| Service Worker | Offline caching + versioned updates |
| Cache API | Static asset caching |
| Web App Manifest | PWA installation |
| History API | SPA routing |
| Web Audio API | Audio playback + visualizer + equalizer + effects (reverb/echo/bass boost) |
| BroadcastChannel | PWA widget communication |
| Media Session API | Lock screen controls |
| Web Workers | Background tasks |

---

## Project Structure

```
├── index.html              # Entry point with Tailwind CSS
├── widget.html             # PWA now-playing widget page
├── manifest.json           # PWA manifest (shortcuts + widgets)
├── sw.js                   # Service Worker (versioned caches, v1.0.3)
├── serve.json              # Static server config
├── .gitignore              # Git ignore rules
├── .htaccess               # Apache SPA rewrite
├── php/
│   ├── api.php             # YouTube download API proxy
│   └── search.php          # YouTube search API proxy (CORS)
├── icons/
│   ├── icon.png            # App icon (PNG)
│   ├── icon.svg            # App icon (SVG)
│   └── logo-full.png       # Full logo
├── logo/
│   ├── logo-full.png       # Full logo (dark text)
│   ├── logo-full-light.png # Full logo (light text)
│   └── logo-short.png      # Short logo variant
└── js/
    ├── app.js              # Bootstrap, init, SW registration, keyboard shortcuts
    ├── router.js           # History API SPA router
    ├── store.js            # Observable state management
    ├── db.js               # IndexedDB wrapper (7 stores)
    ├── player.js           # Audio player + Web Audio API + equalizer + effects (reverb/echo/bass boost) + widget
    ├── theme.js            # Theme engine (5 themes)
    ├── utils.js            # Utility functions + modal dialogs
    ├── worker.js           # Web Worker
    └── components/
        ├── header.js       # Top navigation bar
        ├── sidebar.js      # Sidebar navigation
        ├── miniplayer.js   # Bottom mini player
        ├── home.js         # Dashboard page
        ├── library.js      # Music library (grid/list/artist, batch select)
        ├── search.js       # Search page
        ├── player.js       # Fullscreen player page + visualizer + sleep timer
        ├── downloads.js    # YouTube search/download + upload
        ├── playlists.js    # Playlist management + add songs with search
        ├── settings.js     # Settings + equalizer + effects + listening stats + update checker
        ├── history.js      # Recently played page
        ├── favorites.js    # Favorites page
        └── contextmenu.js  # Right-click/long-press context menu + edit modal
```

---

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

# Using PHP
php -S localhost:8080

# Using XAMPP / WAMP
# Place project in htdocs or www folder
```

Open `http://localhost:8080` in your browser.

### Install as PWA
1. Click the install icon in the browser's address bar (or Chrome menu → Install Audivo)
2. Launch from your desktop / start menu like a native app

---

## How It Works

### Audio Upload Flow
```
User selects file → FileReader → extractMetadata() → Blob → IndexedDB (songs store)
```

### YouTube Download Flow
```
User pastes URL or types search → POST to PHP proxy → get MP3 link → fetch() → Blob → IndexedDB (permanent)
```

### YouTube Search Flow
```
User types search term → POST to search.php → embed.dlsrv.online/api/search → grid results with thumbnails
```

### Offline Playback
```
Song blob in IndexedDB → URL.createObjectURL() → HTML5 Audio element → plays offline
```

### PWA Update Flow
```
Settings → Check for Updates → fetch sw.js with cache-bust → compare APP_VERSION → if different → skipWaiting + reload
```

### PWA Widget Communication
```
widget.html ↔ BroadcastChannel('audivo-widget') ↔ player.js
Widget sends: play/pause/prev/next/seek commands
Player sends: title, artist, artwork, playing state, currentTime, duration (1s throttle)
```

### Audio Effects Chain
```
source → analyser → [EQ BiquadFilters] → [Bass Boost] → [Reverb/Echo split] → gainNode → destination
Reverb: ConvolverNode with generated impulse response, dry/wet mix
Echo: DelayNode (300ms) → feedback → lowpass filter → loop
Bass Boost: BiquadFilterNode lowshelf at 100Hz
```

### Data Persistence
All data survives browser refresh, tab closure, and offline mode. Everything is stored locally in IndexedDB and cache storage. No server, no backend, no tracking.

---

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

### YouTube Search Endpoint
```
POST https://bloggermahim.serv00.net/yt/search.php
Content-Type: application/json

{
  "query": "search term"
}
```

Response:
```json
{
  "data": [
    {
      "title": "Song Title",
      "url": "https://youtube.com/watch?v=...",
      "imgSrc": "https://...",
      "duration": "3:45"
    }
  ]
}
```

---

## Themes

| Theme | Description |
|-------|-------------|
| Dark | Default dark theme with green accents |
| Pure Black OLED | True black background for OLED screens |
| Light | Clean light theme |
| Glassmorphism | Frosted glass effect with purple accents |
| Neon | Dark theme with cyan/magenta neon glow |

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions
- Lyrics display (synced LRC files)
- Audio normalization (auto-level volume across songs)
- Gapless playback (no silence between tracks)
- Import playlists from CSV/JSON
- PWA offline indicator banner
- AirPlay / Chromecast support
- Keyboard shortcut customization
- Unit tests

### Report Bugs
Found a bug? Please [open an issue](https://github.com/bloggermohiuddin/music/issues) with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## Author

**Mohiuddin** — [GitHub](https://github.com/bloggermohiuddin)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with care for music lovers everywhere.
</p>
