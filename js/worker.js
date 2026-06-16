self.onmessage = async function(e) {
    const { type, payload } = e.data;
    switch (type) {
        case 'extractMetadata':
            await extractMetadata(payload);
            break;
        case 'processDownload':
            await processDownload(payload);
            break;
        case 'searchSongs':
            searchSongs(payload);
            break;
        case 'analyzeAudio':
            analyzeAudio(payload);
            break;
    }
};

async function extractMetadata({ fileId, arrayBuffer, fileName }) {
    try {
        const metadata = {
            title: fileName.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: 0,
            thumbnail: null
        };

        self.postMessage({ type: 'metadataProgress', payload: { fileId, step: 'decoding', progress: 30 } });

        try {
            const audioContext = new OfflineAudioContext(1, 44100, 44100);
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            metadata.duration = audioBuffer.duration;
            self.postMessage({ type: 'metadataProgress', payload: { fileId, step: 'duration', progress: 60 } });
        } catch (e) {
            self.postMessage({ type: 'metadataError', payload: { fileId, error: 'Could not decode audio' } });
        }

        self.postMessage({ type: 'metadataProgress', payload: { fileId, step: 'complete', progress: 100 } });
        self.postMessage({ type: 'metadataComplete', payload: { fileId, metadata } });
    } catch (e) {
        self.postMessage({ type: 'metadataError', payload: { fileId, error: e.message } });
    }
}

async function processDownload({ downloadId, url }) {
    try {
        self.postMessage({ type: 'downloadProgress', payload: { downloadId, progress: 0, status: 'downloading' } });

        const response = await fetch(url);
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength) || 0;
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (total) {
                const progress = Math.round((received / total) * 100);
                self.postMessage({
                    type: 'downloadProgress',
                    payload: { downloadId, progress, status: 'downloading', received, total }
                });
            }
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        self.postMessage({
            type: 'downloadComplete',
            payload: { downloadId, blob, size: blob.size }
        });
    } catch (e) {
        self.postMessage({
            type: 'downloadError',
            payload: { downloadId, error: e.message }
        });
    }
}

function searchSongs({ songs, query }) {
    const q = query.toLowerCase();
    const results = songs.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.artist && s.artist.toLowerCase().includes(q)) ||
        (s.album && s.album.toLowerCase().includes(q))
    );
    self.postMessage({ type: 'searchResults', payload: { query, results } });
}

function analyzeAudio({ audioData }) {
    try {
        const ctx = new OfflineAudioContext(1, audioData.length, 44100);
        const buffer = ctx.createBuffer(1, audioData.length, 44100);
        buffer.copyToChannel(audioData, 0);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const waveform = Array.from(dataArray);
        self.postMessage({ type: 'audioAnalysis', payload: { waveform } });
    } catch (e) {
        self.postMessage({ type: 'audioAnalysisError', payload: { error: e.message } });
    }
}
