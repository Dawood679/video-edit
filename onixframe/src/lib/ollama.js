const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

/**
 * Generate SEO-optimised title, description, tags and an SEO score from a transcript.
 * Uses a strict JSON-output prompt; the response is extracted with a regex to handle
 * any model preamble (Llama 3.2 sometimes adds text before the JSON block).
 *
 * @param {string} transcript
 * @param {number|null} videoDuration  - seconds, used for prompt context
 * @returns {Promise<{title: string, description: string, tags: string[], seoScore: number}>}
 */
export async function generateMetadata(transcript, videoDuration = null) {
  const durationHint = videoDuration
    ? `The video is ${Math.round(videoDuration / 60)} minutes long.`
    : '';

  const prompt = `You are an expert video SEO copywriter. ${durationHint}

Given this transcript, generate:
1. A compelling, click-worthy title (max 70 characters)
2. An engaging description (150-200 words) — informative, keyword-rich, conversational
3. 5-10 relevant SEO tags as short phrases
4. An SEO score from 0-100 based on content quality, keyword density, and searchability

Transcript:
"""
${transcript.slice(0, 4000)}
"""

Respond ONLY with valid JSON. No explanation, no markdown fences, just raw JSON:
{"title":"...","description":"...","tags":["tag1","tag2"],"seoScore":75}`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:  OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 600,
      },
    }),
    // 5-minute timeout — Llama 3.2:3b on CPU can be slow
    signal: AbortSignal.timeout(5 * 60 * 1000),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const raw  = data.response || '';

  // Extract the first JSON object from the response (handles preamble text)
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Ollama returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  const parsed = JSON.parse(match[0]);

  return {
    title:       String(parsed.title       || 'Untitled Video').slice(0, 100),
    description: String(parsed.description || '').slice(0, 2000),
    tags:        Array.isArray(parsed.tags) ? parsed.tags.slice(0, 15).map(String) : [],
    seoScore:    Math.min(100, Math.max(0, parseInt(parsed.seoScore) || 50)),
  };
}

/**
 * Check if Ollama is running and the model is available.
 * @returns {Promise<boolean>}
 */
export async function isOllamaReady() {
  try {
    const res  = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const data = await res.json();
    return (data.models || []).some((m) => m.name.startsWith('llama3.2'));
  } catch {
    return false;
  }
}
