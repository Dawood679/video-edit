const WHISPER_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000';

/**
 * Send a video storageKey to the Whisper FastAPI service for transcription.
 * The Whisper service fetches the file directly from MinIO using its own env vars,
 * so we only pass the storage key (not the file bytes) — avoids double-buffering.
 *
 * @param {string} storageKey  - MinIO object key, e.g. "videos/abc123.mp4"
 * @param {string|null} language - Optional ISO language hint (e.g. "en", "ur")
 * @returns {Promise<{text: string, language: string, confidence: number|null, duration: number|null, segments: any[]}>}
 */
export async function transcribeVideo(storageKey, language = null) {
  const controller = new AbortController();
  // 30-minute timeout for long videos
  const timer = setTimeout(() => controller.abort(), 30 * 60 * 1000);

  try {
    const response = await fetch(`${WHISPER_URL}/transcribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ storage_key: storageKey, language }),
      signal:  controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Whisper service error ${response.status}: ${text}`);
    }

    return response.json();
    // Shape: { text, language, confidence, duration, segments }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check if the Whisper service is healthy and the model is loaded.
 * @returns {Promise<boolean>}
 */
export async function isWhisperReady() {
  try {
    const res = await fetch(`${WHISPER_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.model_loaded === true;
  } catch {
    return false;
  }
}
