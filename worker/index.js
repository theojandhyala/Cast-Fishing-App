/**
 * CAST AI Worker — secure proxy for the Anthropic API.
 *
 * The ANTHROPIC_API_KEY is stored as a Cloudflare secret and never reaches
 * the client. The web/mobile app calls this Worker; the Worker calls Anthropic.
 *
 * Endpoints (POST):
 *   /advisor   { messages: [{role, content}], system?: string }
 *   /identify  { image: "<base64 jpeg>" }
 */

const ALLOWED_ORIGINS = [
  'https://cast-fishing-app.pages.dev',
  'https://castfishingapp.com',
  'https://www.castfishingapp.com',
  'http://localhost:8081',
  'http://localhost:19006',
];

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin)
    || /^https:\/\/[a-z0-9-]+\.cast-fishing-app\.pages\.dev$/.test(origin);
}

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const VISION_MODEL = '@cf/google/gemma-4-26b-a4b-it';

function corsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

async function callAnthropic(apiKey, payload) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Anthropic request failed');
  const text = data?.content?.[0]?.type === 'text' ? data.content[0].text : '';
  return text;
}

async function identifyWithWorkersAI(ai, image, mediaType, prompt) {
  const response = await ai.run(VISION_MODEL, {
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${image}` } },
        { type: 'text', text: prompt },
      ],
    }],
    max_tokens: 1024,
    temperature: 0.1,
  });
  return typeof response === 'string'
    ? response
    : response?.response || response?.choices?.[0]?.message?.content || response?.result || JSON.stringify(response);
}

const ADVISOR_SYSTEM = `You are CAST's expert fishing advisor — a friendly, knowledgeable angling guide.
You give practical, specific advice on species, rigs, baits, knots, weather, tides, locations and techniques.
Keep answers concise and well structured. Use markdown with bold headers and bullet points.
Use emoji sparingly for species and key points. Assume a UK/global recreational angler unless told otherwise.
Always promote responsible, legal, catch-and-release-friendly fishing.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }
    const url = new URL(request.url);
    let payloadIn;
    try {
      payloadIn = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, origin);
    }

    try {
      if (url.pathname.endsWith('/identify')) {
        const image = payloadIn.image;
        if (!image) return json({ error: 'Missing image' }, 400, origin);
        if (typeof image !== 'string' || image.length > 9_000_000) {
          return json({ error: 'Image is too large. Use a photo under 7 MB.' }, 413, origin);
        }
        const allowedMediaTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
        const mediaType = allowedMediaTypes.has(payloadIn.mediaType) ? payloadIn.mediaType : 'image/jpeg';

        const identifyPrompt = `You are a cautious expert fish taxonomist. Inspect body shape, fin count and position, mouth, scales, lateral line, colour pattern and visible habitat. Return ONLY one compact valid JSON object with these exact keys: species, confidence (integer 0-100), commonName, latinName, estimatedWeight, estimatedLength, alternatives (maximum 3 species names). No markdown or extra keys.
Rules:
- If there is no clearly visible fish, set species and commonName to "No fish detected" and confidence to 0.
- Calibrate confidence. Never exceed 90 unless a clear side-on view shows diagnostic features. Similar species must reduce confidence and appear in alternatives.
- Do not invent measurements. Without a ruler or reliable scale reference, return "Not estimable from photo" for estimatedWeight and estimatedLength.
- Use a weight range in kg and a length range in cm only when a reliable scale reference is visible.
- Prefer the exact accepted common and Latin species name, not a broad family.`;
        const text = env.ANTHROPIC_API_KEY
          ? await callAnthropic(env.ANTHROPIC_API_KEY, {
              model: MODEL,
              max_tokens: 1024,
              messages: [{ role: 'user', content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
                { type: 'text', text: identifyPrompt },
              ] }],
            })
          : env.AI
            ? await identifyWithWorkersAI(env.AI, image, mediaType, identifyPrompt)
            : null;
        if (!text) return json({ error: 'Fish scanning is not configured' }, 500, origin);
        return new Response(text, {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      if (url.pathname.endsWith('/advisor')) {
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'Advisor is not configured' }, 500, origin);
        const messages = payloadIn.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return json({ error: 'Missing messages' }, 400, origin);
        }
        const text = await callAnthropic(env.ANTHROPIC_API_KEY, {
          model: MODEL,
          max_tokens: 1024,
          system: payloadIn.system || ADVISOR_SYSTEM,
          messages: messages.slice(-12),
        });
        return json({ reply: text }, 200, origin);
      }

      return json({ error: 'Unknown endpoint' }, 404, origin);
    } catch (e) {
      return json({ error: e.message || 'AI request failed' }, 502, origin);
    }
  },
};
