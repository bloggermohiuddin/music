const DownloadsPage = {
    _unsubs: [],
    _isDownloading: false,
    _abortControllers: new Map(),
    _searchResults: [],
    _searchQuery: '',

    async render() {
        const downloads = Store.get('downloads') || [];
        const el = document.getElementById('main-content');
        if (!el) return;
        const disabled = this._isDownloading;

        el.innerHTML = `
            <div class="p-4 md:p-6 pb-28 md:pb-32">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold" style="color:var(--text);">Downloads</h1>
                        <p class="text-sm mt-1" style="color:var(--text-secondary);">Search YouTube or paste a link</p>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="p-4 md:p-6 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <div class="flex gap-2">
                            <input type="text" id="yt-input" placeholder="Paste YouTube link or search songs..."
                                ${disabled ? 'disabled' : ''}
                                class="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                                style="background:var(--input-bg); color:var(--text); border:1px solid var(--border); ${disabled ? 'opacity:0.5; cursor:not-allowed;' : ''}">
                            <button id="yt-action-btn" 
                                ${disabled ? 'disabled' : ''}
                                class="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2" 
                                style="background:${disabled ? 'var(--text-muted)' : 'var(--primary)'}; color:white; ${disabled ? 'opacity:0.7; cursor:not-allowed;' : 'hover:scale-105;'}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Go
                            </button>
                        </div>
                        <p class="text-xs mt-2" style="color:var(--text-muted);">Paste a YouTube/YouTube Music link to download, or type to search</p>
                    </div>
                </div>

                <div id="yt-search-results" class="mb-6">
                    ${this._searchResults.length > 0 ? this._renderSearchResults() : ''}
                </div>

                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold" style="color:var(--text);">Upload Music</h2>
                        <button id="upload-music-btn" ${disabled ? 'disabled' : ''} class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" style="background:var(--surface); color:var(--text); border:1px solid var(--border); ${disabled ? 'opacity:0.5; cursor:not-allowed;' : ''}">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                            Select Files
                        </button>
                        <input type="file" id="upload-files-input" accept="audio/*" multiple class="hidden">
                    </div>
                </div>

                ${downloads.length === 0 ? `
                <div class="text-center py-16">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:var(--surface);">
                        <svg class="w-10 h-10" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <h2 class="text-lg font-semibold mb-2" style="color:var(--text);">No downloads yet</h2>
                    <p class="text-sm" style="color:var(--text-secondary);">Search YouTube or paste a link to get started</p>
                </div>
                ` : `<div id="download-queue">${this._renderQueue(downloads)}</div>`}
            </div>
        `;
        this._bindEvents();
    },

    _renderSearchResults() {
        if (this._searchResults.length === 0) return '';
        return `
            <div>
                <h2 class="text-lg font-semibold mb-4" style="color:var(--text);">Search Results</h2>
                <div class="search-results-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:16px;">
                    ${this._searchResults.map(r => `
                        <div class="search-result-item rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                            style="background:var(--card-bg); border:1px solid var(--border); hover:transform:translateY(-2px); hover:box-shadow:0 4px 12px rgba(0,0,0,0.3);"
                            data-url="${r.url}" data-title="${Utils.htmlEncode(r.title)}" data-thumb="${r.imgSrc || ''}" data-duration="${r.duration || ''}">
                            <div class="relative" style="aspect-ratio:16/9; background:var(--surface);">
                                ${r.imgSrc 
                                    ? `<img src="${r.imgSrc}" alt="" class="w-full h-full object-cover" loading="lazy">`
                                    : `<div class="w-full h-full flex items-center justify-center"><svg class="w-10 h-10" style="color:var(--text-muted);" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
                                }
                                ${r.duration ? `<span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(0,0,0,0.8); color:white;">${r.duration}</span>` : ''}
                            </div>
                            <div class="p-3">
                                <p class="text-sm font-medium truncate mb-2" style="color:var(--text);">${Utils.htmlEncode(r.title)}</p>
                                <button class="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5" 
                                    style="background:var(--primary); color:white; hover:scale-105;"
                                    data-url="${r.url}" data-title="${Utils.htmlEncode(r.title)}" data-thumb="${r.imgSrc || ''}" data-duration="${r.duration || ''}">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _renderQueue(downloads) {
        if (!downloads || downloads.length === 0) return '';
        const sorted = [...downloads].reverse();
        return `
            <div class="space-y-2">
                <h2 class="text-lg font-semibold mb-3" style="color:var(--text);">Download Queue</h2>
                ${sorted.map(d => {
                    const statusColors = { completed: 'var(--primary)', downloading: 'var(--accent)', queued: 'var(--text-muted)', error: '#ef4444', processing: '#f59e0b' };
                    const statusColor = statusColors[d.status] || 'var(--text-muted)';
                    return `
                    <div class="p-4 rounded-xl" style="background:var(--card-bg); border:1px solid var(--border);">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate" style="color:var(--text);">${d.title || 'Unknown'}</p>
                                <p class="text-xs" style="color:var(--text-secondary);">
                                    ${d.status === 'downloading' ? 'Downloading' : d.status === 'completed' ? 'Completed' : d.status === 'error' ? 'Failed' : d.status}
                                    ${d.progress ? ` · ${d.progress}%` : ''}
                                </p>
                            </div>
                            <span class="text-xs font-medium px-2 py-0.5 rounded-full" style="background:${statusColor}20; color:${statusColor};">
                                ${d.status === 'downloading' 
                                    ? '<svg class="w-3 h-3 inline animate-spin mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>' 
                                    : ''}
                                ${d.status}
                            </span>
                        </div>
                        ${d.status === 'downloading' ? `
                        <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1 h-2 rounded-full overflow-hidden" style="background:var(--surface);">
                                <div class="h-full rounded-full transition-all duration-300 ease-out" style="background:linear-gradient(90deg, var(--primary), var(--primary-hover)); width:${d.progress || 0}%;"></div>
                            </div>
                            <button onclick="DownloadsPage._cancelDownload(${d.id})" class="p-1 rounded-lg flex-shrink-0 transition-all hover:scale-105" style="background:#ef4444; color:white;" title="Cancel">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>` : ''}
                        ${d.status === 'error' ? `<p class="text-xs mt-1" style="color:#ef4444;">Download failed. Please try again.</p>` : ''}
                        ${d.status === 'completed' ? `
                        <div class="flex items-center gap-1 mt-1">
                            <svg class="w-3.5 h-3.5" style="color:var(--primary);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span class="text-xs" style="color:var(--primary);">Ready to play</span>
                        </div>` : ''}
                    </div>`;
                }).join('')}
            </div>
        `;
    },

    _bindEvents() {
        document.getElementById('yt-action-btn')?.addEventListener('click', () => this._handleInput());
        document.getElementById('yt-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._handleInput();
        });

        document.addEventListener('click', (e) => {
            const downloadBtn = e.target.closest('button[data-url]');
            if (downloadBtn) {
                e.stopPropagation();
                this._downloadFromSearch(
                    downloadBtn.dataset.url,
                    downloadBtn.dataset.title,
                    downloadBtn.dataset.thumb,
                    downloadBtn.dataset.duration
                );
                return;
            }
        });

        const uploadBtn = document.getElementById('upload-music-btn');
        const uploadInput = document.getElementById('upload-files-input');
        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', async (e) => {
                await HomePage._handleUpload(e.target.files);
                uploadInput.value = '';
                await Store.loadSongs();
                Store.showNotification('Files uploaded successfully', 'success');
            });
        }
    },

    _isURL(str) {
        try {
            const u = new URL(str);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    },

    _handleInput() {
        const input = document.getElementById('yt-input');
        const value = input?.value.trim();
        if (!value) {
            Store.showNotification('Enter a search term or YouTube link', 'warning');
            return;
        }
        if (this._isURL(value)) {
            this._startYouTubeDownload(value);
        } else {
            this._searchYouTube(value);
        }
    },

    async _searchYouTube(query) {
        const btn = document.getElementById('yt-action-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        }

        try {
            const response = await fetch('https://bloggermahim.serv00.net/yt/search.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            if (!response.ok) throw new Error('Search failed');

            const result = await response.json();
            this._searchResults = result.data || [];
            this._searchQuery = query;

            const resultsEl = document.getElementById('yt-search-results');
            if (resultsEl) resultsEl.innerHTML = this._renderSearchResults();

            if (this._searchResults.length === 0) {
                Store.showNotification('No results found', 'info');
            }
        } catch (e) {
            Store.showNotification('Search failed: ' + e.message, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Go';
            }
        }
    },

    async _downloadFromSearch(url, title, thumbnail, duration) {
        try {
            Store.showNotification('Fetching audio info...', 'info');

            const response = await fetch('https://bloggermahim.serv00.net/yt/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (!data.status || !data.link) {
                throw new Error(data.message || 'Failed to get download link');
            }

            const downloadId = await DB.addDownload({
                url: data.link,
                title: data.title || title || 'YouTube Song',
                progress: 0,
                status: 'downloading'
            });

            const controller = new AbortController();
            this._abortControllers.set(downloadId, controller);

            Store.showNotification(`Downloading: ${data.title || title}`, 'info');
            await Store.loadDownloads();
            this._updateQueue();

            await this._downloadAndStore({
                ...data,
                title: data.title || title,
                thumbnail: data.thumbnail || thumbnail,
                duration: data.duration || 0
            }, downloadId, url, controller.signal);

        } catch (e) {
            Store.showNotification(`Download failed: ${e.message}`, 'error');
        }
    },

    async _startYouTubeDownload(url) {
        try {
            Store.showNotification('Fetching audio info...', 'info');

            const response = await fetch('https://bloggermahim.serv00.net/yt/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (!data.status || !data.link) {
                throw new Error(data.message || 'Failed to get download link');
            }

            const downloadId = await DB.addDownload({
                url: data.link,
                title: data.title || 'YouTube Song',
                progress: 0,
                status: 'downloading'
            });

            const controller = new AbortController();
            this._abortControllers.set(downloadId, controller);

            Store.showNotification(`Downloading: ${data.title}`, 'info');
            await Store.loadDownloads();
            this._updateQueue();

            await this._downloadAndStore(data, downloadId, url, controller.signal);

        } catch (e) {
            Store.showNotification(`Download failed: ${e.message}`, 'error');
        }
    },

    _updateButtonLoading(loading) {
        const input = document.getElementById('yt-input');
        const uploadBtn = document.getElementById('upload-music-btn');

        if (input) {
            input.disabled = loading;
            input.style.opacity = loading ? '0.5' : '1';
            input.style.cursor = loading ? 'not-allowed' : '';
        }
        if (uploadBtn) {
            uploadBtn.disabled = loading;
            uploadBtn.style.opacity = loading ? '0.5' : '1';
            uploadBtn.style.cursor = loading ? 'not-allowed' : '';
        }
    },

    _updateQueue() {
        const downloads = Store.get('downloads') || [];
        const queueEl = document.getElementById('download-queue');
        if (queueEl) {
            queueEl.innerHTML = this._renderQueue(downloads);
        } else if (downloads.length > 0) {
            const container = document.querySelector('.p-4.md\\:p-6');
            if (container) {
                const queueDiv = document.createElement('div');
                queueDiv.id = 'download-queue';
                queueDiv.innerHTML = this._renderQueue(downloads);
                container.appendChild(queueDiv);
            }
        }
    },

    _cancelDownload(downloadId) {
        const controller = this._abortControllers.get(downloadId);
        if (controller) {
            controller.abort();
        }
    },

    async _downloadAndStore(data, downloadId, originalUrl, signal) {
        try {
            const response = await fetch(data.link, { signal });
            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength) || 0;
            const reader = response.body.getReader();
            const chunks = [];
            let received = 0;
            let lastProgressUpdate = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                if (total) {
                    const progress = Math.round((received / total) * 100);
                    if (progress - lastProgressUpdate >= 1 || progress === 100) {
                        lastProgressUpdate = progress;
                        await DB.updateDownload(downloadId, { progress, status: 'downloading' });
                        const downloads = await DB.getDownloadQueue();
                        Store.set('downloads', downloads);
                        this._updateQueue();
                    }
                }
            }

            const blob = new Blob(chunks, { type: 'audio/mpeg' });
            const thumbnail = data.thumbnail || null;

            await DB.addSong({
                title: data.title || 'YouTube Song',
                artist: data.artist || 'YouTube',
                album: 'YouTube Downloads',
                duration: data.duration || 0,
                thumbnail: thumbnail,
                blob: blob,
                source_type: 'youtube',
                youtube_url: originalUrl,
                size: blob.size,
                created_at: Date.now()
            });

            await DB.updateDownload(downloadId, { progress: 100, status: 'completed' });
            const downloads = await DB.getDownloadQueue();
            Store.set('downloads', downloads);
            this._updateQueue();

            await Store.loadSongs();
            Store.showNotification(`"${data.title}" downloaded successfully!`, 'success');

        } catch (e) {
            this._abortControllers.delete(downloadId);
            if (e.name === 'AbortError') {
                await DB.delete('downloads', downloadId);
                const downloads = await DB.getDownloadQueue();
                Store.set('downloads', downloads);
                this._updateQueue();
                Store.showNotification('Download cancelled', 'info');
                return;
            }
            await DB.updateDownload(downloadId, { status: 'error' });
            const downloads = await DB.getDownloadQueue();
            Store.set('downloads', downloads);
            this._updateQueue();
            Store.showNotification('Download failed', 'error');
            throw e;
        }
    },

    cleanup() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }
};

window.DownloadsPage = DownloadsPage;
