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
  'http://localhost:8081',
  'http://localhost:19006',
];

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server not configured' }, 500, origin);
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

        const text = await callAnthropic(env.ANTHROPIC_API_KEY, {
          model: MODEL,
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
              { type: 'text', text: `Identify the fish species in this image. Respond with ONLY a JSON object:
{
  "species": "Common name",
  "confidence": 85,
  "commonName": "Full common name",
  "latinName": "Scientific name",
  "legalSize": 30,
  "estimatedWeight": "2-4kg",
  "estimatedLength": "40-55cm",
  "isLegal": true,
  "notes": "Identifying features visible",
  "tips": "One fishing tip for this species",
  "alternatives": ["Alt 1", "Alt 2"]
}
legalSize is the UK minimum size in cm. If no fish, set species to "No fish detected". Return only JSON.` },
            ],
          }],
        });
        return new Response(text, {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      if (url.pathname.endsWith('/advisor')) {
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
