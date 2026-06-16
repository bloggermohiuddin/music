let _htmlEncoder = document.createElement('div');

const Utils = {
    htmlEncode(str) {
        _htmlEncoder.textContent = str;
        return _htmlEncoder.innerHTML;
    },

    formatSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    },

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    },

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    throttle(fn, limit = 100) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    extractExtension(filename) {
        return filename.split('.').pop()?.toLowerCase() || '';
    },

    isAudioFile(filename) {
        const ext = this.extractExtension(filename);
        return ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].includes(ext);
    },

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async extractMetadata(file) {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const metadata = { title: file.name.replace(/\.[^/.]+$/, ''), artist: 'Unknown Artist', album: 'Unknown Album', duration: 0, thumbnail: null };

        try {
            if (typeof jsmediatags !== 'undefined') {
                const tags = await new Promise((resolve, reject) => {
                    jsmediatags.read(file, {
                        onSuccess: resolve,
                        onError: reject
                    });
                });
                const t = tags.tags;
                metadata.title = t.title || metadata.title;
                metadata.artist = t.artist || metadata.artist;
                metadata.album = t.album || metadata.album;
                if (t.picture) {
                    const { data, format } = t.picture;
                    const base64 = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                    metadata.thumbnail = `data:${format};base64,${btoa(base64)}`;
                }
            }
        } catch (e) {
            console.warn('Metadata extraction failed, using defaults', e);
        }

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            try {
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
                metadata.duration = audioBuffer.duration;
            } finally {
                audioContext.close();
            }
        } catch (e) {
            console.warn('Could not decode audio for duration', e);
            const audio = new Audio(URL.createObjectURL(new Blob([arrayBuffer])));
            metadata.duration = await new Promise(res => {
                const timer = setTimeout(() => { res(0); URL.revokeObjectURL(audio.src); }, 10000);
                audio.onloadedmetadata = () => { clearTimeout(timer); res(audio.duration); URL.revokeObjectURL(audio.src); };
                audio.onerror = () => { clearTimeout(timer); res(0); URL.revokeObjectURL(audio.src); };
            });
        }

        return metadata;
    },

    htmlEncode(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    fileToBlob(file) {
        return new Blob([file], { type: file.type });
    },

    blobToURL(blob) {
        return URL.createObjectURL(blob);
    },

    revokeURL(url) {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    createSvgIcon(svgContent) {
        return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    }
};

const Modal = {
    _container: null,

    _ensureContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'modal-root';
            document.body.appendChild(this._container);
        }
        return this._container;
    },

    prompt(title, defaultValue) {
        return new Promise((resolve) => {
            const root = this._ensureContainer();
            root.innerHTML = `
                <div class="modal-overlay" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity 0.2s ease;">
                    <div class="modal-box" style="width:100%;max-width:400px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:16px;padding:24px;transform:scale(0.95);transition:transform 0.2s ease;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                        <h3 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:16px;">${Utils.htmlEncode(title)}</h3>
                        <input type="text" id="modal-input" value="${(defaultValue || '').replace(/"/g, '&quot;')}" 
                            style="width:100%;padding:12px 16px;border-radius:12px;font-size:14px;outline:none;background:var(--input-bg);color:var(--text);border:1px solid var(--border);box-sizing:border-box;"
                            placeholder="Type here...">
                        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;">
                            <button id="modal-cancel" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;background:var(--surface);color:var(--text-secondary);border:1px solid var(--border);cursor:pointer;transition:all 0.15s;">Cancel</button>
                            <button id="modal-ok" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;transition:all 0.15s;">OK</button>
                        </div>
                    </div>
                </div>
            `;
            const overlay = root.querySelector('.modal-overlay');
            const box = root.querySelector('.modal-box');
            const input = document.getElementById('modal-input');
            const okBtn = document.getElementById('modal-ok');
            const cancelBtn = document.getElementById('modal-cancel');

            requestAnimationFrame(() => { overlay.style.opacity = '1'; box.style.transform = 'scale(1)'; });
            setTimeout(() => input.focus(), 100);

            function close(value) {
                overlay.style.opacity = '0';
                box.style.transform = 'scale(0.95)';
                setTimeout(() => { root.innerHTML = ''; resolve(value); }, 200);
            }

            function onKeydown(e) {
                if (e.key === 'Enter') { document.removeEventListener('keydown', onKeydown); close(input.value); }
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKeydown); close(null); }
            }
            document.addEventListener('keydown', onKeydown);
            okBtn.addEventListener('click', () => { document.removeEventListener('keydown', onKeydown); close(input.value); });
            cancelBtn.addEventListener('click', () => { document.removeEventListener('keydown', onKeydown); close(null); });
            overlay.addEventListener('click', (e) => { if (e.target === overlay) { document.removeEventListener('keydown', onKeydown); close(null); } });
        });
    },

    confirm(title, message) {
        return new Promise((resolve) => {
            const root = this._ensureContainer();
            root.innerHTML = `
                <div class="modal-overlay" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity 0.2s ease;">
                    <div class="modal-box" style="width:100%;max-width:400px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:16px;padding:24px;transform:scale(0.95);transition:transform 0.2s ease;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                        <h3 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;">${Utils.htmlEncode(title)}</h3>
                        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;">${Utils.htmlEncode(message)}</p>
                        <div style="display:flex;gap:8px;justify-content:flex-end;">
                            <button id="modal-cancel" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;background:var(--surface);color:var(--text-secondary);border:1px solid var(--border);cursor:pointer;transition:all 0.15s;">Cancel</button>
                            <button id="modal-ok" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;background:#ef4444;color:white;border:none;cursor:pointer;transition:all 0.15s;">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            const overlay = root.querySelector('.modal-overlay');
            const box = root.querySelector('.modal-box');
            const okBtn = document.getElementById('modal-ok');
            const cancelBtn = document.getElementById('modal-cancel');

            requestAnimationFrame(() => { overlay.style.opacity = '1'; box.style.transform = 'scale(1)'; });

            function close(value) {
                overlay.style.opacity = '0';
                box.style.transform = 'scale(0.95)';
                setTimeout(() => { root.innerHTML = ''; resolve(value); }, 200);
            }

            function onKeydown(e) {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKeydown); close(false); }
                if (e.key === 'Enter') { document.removeEventListener('keydown', onKeydown); close(true); }
            }
            document.addEventListener('keydown', onKeydown);
            okBtn.addEventListener('click', () => { document.removeEventListener('keydown', onKeydown); close(true); });
            cancelBtn.addEventListener('click', () => { document.removeEventListener('keydown', onKeydown); close(false); });
            overlay.addEventListener('click', (e) => { if (e.target === overlay) { document.removeEventListener('keydown', onKeydown); close(false); } });
        });
    },

    alert(title, message) {
        return this.confirm(title, message);
    }
};

window.Utils = Utils;
window.Modal = Modal;
