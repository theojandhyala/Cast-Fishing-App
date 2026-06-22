/**
 * CAST AI Worker — secure proxy for the Anthropic API and Stripe payments.
 *
 * The ANTHROPIC_API_KEY is stored as a Cloudflare secret and never reaches
 * the client. The web/mobile app calls this Worker; the Worker calls Anthropic.
 *
 * Endpoints (POST):
 *   /advisor             { messages: [{role, content}], system?: string }
 *   /identify            { image: "<base64 jpeg>" }
 *   /billing/*           Authenticated Stripe subscription lifecycle
 *   /stripe/webhook      Signed Stripe event receiver
 *
 * Secrets (set via Cloudflare dashboard or wrangler secret put):
 *   ANTHROPIC_API_KEY — Anthropic API for fish ID and advisor
 *   STRIPE_SECRET_KEY — Stripe secret key for subscription payments
 *   STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

const encoder = new TextEncoder();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_DAYS = 30;

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function digest(value) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToBase64(new Uint8Array(hash));
}

async function passwordHash(password, salt) {
  let value = password;
  for (let round = 0; round < 3; round += 1) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(value), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(`${salt}:${round}`), iterations: 100_000, hash: 'SHA-256' }, material, 256);
    value = bytesToBase64(new Uint8Array(bits));
  }
  return value;
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function safeUser(row) {
  return {
    id: row.id,
    name: row.username,
    email: row.email,
    avatarColor: row.avatar_color,
    favouriteSpecies: JSON.parse(row.favourite_species || '[]'),
    regionId: row.region_id || '',
    hasCompletedOnboarding: Boolean(row.onboarding_complete),
    isPro: Boolean(row.is_pro),
    proStatus: row.subscription_status || (row.is_pro ? 'active' : 'free'),
    proPlan: row.subscription_plan || null,
    proCurrentPeriodEnd: row.subscription_current_period_end || null,
    proCancelAtPeriodEnd: Boolean(row.subscription_cancel_at_period_end),
    xp: Number(row.xp || 0),
    level: Number(row.level || 1),
    streak: Number(row.streak || 0),
    catchCount: Number(row.catch_count || 0),
    topSpecies: row.top_species || 'Not set',
    joinedAt: row.created_at,
  };
}

async function createSession(db, userId) {
  const token = randomToken();
  const tokenHash = await digest(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString();
  await db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(tokenHash, userId, expires, now.toISOString()).run();
  return token;
}

async function authenticatedUser(request, db) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const tokenHash = await digest(auth.slice(7));
  return db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).bind(tokenHash, new Date().toISOString()).first();
}

function friendShape(row) {
  return {
    id: row.id,
    name: row.username,
    handle: `@${row.username}`,
    level: Number(row.level || 1),
    catchCount: Number(row.catch_count || 0),
    topSpecies: row.top_species || 'Not set',
    streak: Number(row.streak || 0),
    avatarColor: row.avatar_color || '#15565D',
    isOnline: false,
    lastActive: 'CAST angler',
    mutualFriends: 0,
  };
}

const STRIPE_API = 'https://api.stripe.com/v1';
const PRO_PLANS = {
  monthly: { amount: 499, interval: 'month', label: 'CAST Pro Monthly' },
  annual: { amount: 2999, interval: 'year', label: 'CAST Pro Annual' },
};

async function stripeRequest(env, path, method = 'GET', params) {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe billing is not configured yet.');
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params ? params.toString() : undefined,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || 'Stripe could not complete that request.');
  return body;
}

function stripeId(value) {
  return typeof value === 'string' ? value : value?.id || null;
}

function stripeDate(seconds) {
  return Number(seconds) > 0 ? new Date(Number(seconds) * 1000).toISOString() : null;
}

async function updateSubscription(db, userId, values) {
  const status = String(values.status || 'free');
  const isPro = status === 'active' || status === 'trialing';
  await db.prepare(`UPDATE users SET is_pro=?, stripe_customer_id=COALESCE(?, stripe_customer_id),
    stripe_subscription_id=COALESCE(?, stripe_subscription_id), subscription_status=?,
    subscription_plan=COALESCE(?, subscription_plan), subscription_current_period_end=?,
    subscription_cancel_at_period_end=?, updated_at=? WHERE id=?`)
    .bind(isPro ? 1 : 0, values.customerId || null, values.subscriptionId || null, status,
      values.plan || null, values.currentPeriodEnd || null, values.cancelAtPeriodEnd ? 1 : 0,
      new Date().toISOString(), userId).run();
}

function hex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').map((part) => part.trim().split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digestBytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`)));
  const expected = hex(digestBytes);
  return signatures.some((signature) => signature.length === expected.length
    && signature.split('').reduce((difference, char, index) => difference | (char.charCodeAt(0) ^ expected.charCodeAt(index)), 0) === 0);
}

async function handleStripeWebhook(request, env, origin) {
  if (!env.DB || !env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Stripe webhook is not configured.' }, 503, origin);
  const rawBody = await request.text();
  const valid = await verifyStripeSignature(rawBody, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: 'Invalid Stripe signature.' }, 400, origin);
  const event = JSON.parse(rawBody);
  const alreadyProcessed = await env.DB.prepare('SELECT 1 AS yes FROM stripe_events WHERE event_id=?').bind(event.id).first();
  if (alreadyProcessed) return json({ received: true }, 200, origin);

  const object = event.data?.object || {};
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const userId = object.client_reference_id || object.metadata?.user_id;
    if (userId) await updateSubscription(env.DB, userId, {
      status: 'trialing', customerId: stripeId(object.customer), subscriptionId: stripeId(object.subscription),
      plan: object.metadata?.plan || null,
    });
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const userId = object.metadata?.user_id
      || (await env.DB.prepare('SELECT id FROM users WHERE stripe_subscription_id=? OR stripe_customer_id=? LIMIT 1')
        .bind(object.id, stripeId(object.customer)).first())?.id;
    if (userId) await updateSubscription(env.DB, userId, {
      status: event.type === 'customer.subscription.deleted' ? 'canceled' : object.status,
      customerId: stripeId(object.customer), subscriptionId: object.id, plan: object.metadata?.plan || null,
      currentPeriodEnd: stripeDate(object.current_period_end), cancelAtPeriodEnd: object.cancel_at_period_end,
    });
  }

  await env.DB.prepare('INSERT INTO stripe_events (event_id,event_type,processed_at) VALUES (?,?,?)')
    .bind(event.id, event.type, new Date().toISOString()).run();
  return json({ received: true }, 200, origin);
}

async function handleApi(request, env, url, origin, payload) {
  if (!env.DB) return json({ error: 'Account service is temporarily unavailable.' }, 503, origin);
  const db = env.DB;

  if (url.pathname === '/auth/register' && request.method === 'POST') {
    const email = String(payload?.email || '').trim().toLowerCase();
    const username = String(payload?.name || '').trim();
    const password = String(payload?.password || '');
    if (!EMAIL_PATTERN.test(email)) return json({ error: 'Enter a valid email address.' }, 400, origin);
    if (username.length < 2 || username.length > 24) return json({ error: 'Username must be 2–24 characters.' }, 400, origin);
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400, origin);
    const id = crypto.randomUUID();
    const salt = randomToken(18);
    const hash = await passwordHash(password, salt);
    const now = new Date().toISOString();
    try {
      await db.prepare(`INSERT INTO users
        (id,email,username,password_hash,password_salt,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?)`).bind(id, email, username, hash, salt, now, now).run();
    } catch (error) {
      const message = String(error?.message || '');
      if (message.includes('users.email')) return json({ error: 'An account already uses that email.' }, 409, origin);
      if (message.includes('users.username')) return json({ error: 'That username is already taken.' }, 409, origin);
      throw error;
    }
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    const token = await createSession(db, id);
    return json({ token, user: safeUser(user) }, 201, origin);
  }

  if (url.pathname === '/auth/login' && request.method === 'POST') {
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || await passwordHash(password, user.password_salt) !== user.password_hash) {
      return json({ error: 'Email or password is incorrect.' }, 401, origin);
    }
    const token = await createSession(db, user.id);
    return json({ token, user: safeUser(user) }, 200, origin);
  }

  const user = await authenticatedUser(request, db);
  if (!user) return json({ error: 'Please sign in again.' }, 401, origin);

  if (url.pathname === '/auth/me' && request.method === 'GET') return json({ user: safeUser(user) }, 200, origin);

  if (url.pathname === '/auth/logout' && request.method === 'POST') {
    const tokenHash = await digest((request.headers.get('Authorization') || '').slice(7));
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return json({ ok: true }, 200, origin);
  }

  if (url.pathname === '/profile' && request.method === 'PATCH') {
    const name = String(payload?.name || user.username).trim();
    const species = Array.isArray(payload?.favouriteSpecies) ? payload.favouriteSpecies.map(String).slice(0, 30) : JSON.parse(user.favourite_species || '[]');
    const regionId = String(payload?.regionId ?? user.region_id ?? '').slice(0, 64);
    const onboarding = payload?.hasCompletedOnboarding === undefined ? user.onboarding_complete : payload.hasCompletedOnboarding ? 1 : 0;
    if (name.length < 2 || name.length > 24) return json({ error: 'Username must be 2–24 characters.' }, 400, origin);
    try {
      await db.prepare(`UPDATE users SET username=?, favourite_species=?, region_id=?, onboarding_complete=?, updated_at=? WHERE id=?`)
        .bind(name, JSON.stringify(species), regionId, onboarding, new Date().toISOString(), user.id).run();
    } catch (error) {
      if (String(error?.message || '').includes('users.username')) return json({ error: 'That username is already taken.' }, 409, origin);
      throw error;
    }
    const updated = await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
    return json({ user: safeUser(updated) }, 200, origin);
  }

  if (url.pathname === '/billing/status' && request.method === 'GET') {
    return json({
      stripeConfigured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
      isPro: Boolean(user.is_pro),
      status: user.subscription_status || (user.is_pro ? 'active' : 'free'),
      plan: user.subscription_plan || null,
      currentPeriodEnd: user.subscription_current_period_end || null,
      cancelAtPeriodEnd: Boolean(user.subscription_cancel_at_period_end),
      canManage: Boolean(user.stripe_customer_id),
    }, 200, origin);
  }

  if (url.pathname === '/billing/checkout' && request.method === 'POST') {
    if (!env.STRIPE_SECRET_KEY) return json({ error: 'Secure Stripe checkout is not connected yet.' }, 503, origin);
    if (user.is_pro) return json({ error: 'CAST Pro is already active on this account.' }, 409, origin);
    const planId = payload?.plan === 'monthly' ? 'monthly' : 'annual';
    const plan = PRO_PLANS[planId];
    const appUrl = String(env.PUBLIC_APP_URL || 'https://castfishingapp.com').replace(/\/$/, '');
    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('success_url', `${appUrl}/pro?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${appUrl}/pro?checkout=cancelled`);
    params.set('client_reference_id', user.id);
    params.set('allow_promotion_codes', 'true');
    params.set('billing_address_collection', 'auto');
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'gbp');
    params.set('line_items[0][price_data][unit_amount]', String(plan.amount));
    params.set('line_items[0][price_data][recurring][interval]', plan.interval);
    params.set('line_items[0][price_data][product_data][name]', plan.label);
    params.set('line_items[0][price_data][product_data][description]', 'Advanced conditions, unlimited CAST Lens, analytics, alerts and cloud backup.');
    params.set('metadata[user_id]', user.id);
    params.set('metadata[plan]', planId);
    params.set('subscription_data[metadata][user_id]', user.id);
    params.set('subscription_data[metadata][plan]', planId);
    params.set('subscription_data[trial_period_days]', '7');
    if (user.stripe_customer_id) params.set('customer', user.stripe_customer_id);
    else params.set('customer_email', user.email);
    const session = await stripeRequest(env, '/checkout/sessions', 'POST', params);
    return json({ checkoutUrl: session.url }, 201, origin);
  }

  if (url.pathname === '/billing/confirm' && request.method === 'POST') {
    const sessionId = String(payload?.sessionId || '');
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return json({ error: 'Invalid checkout session.' }, 400, origin);
    const session = await stripeRequest(env, `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`);
    if (session.client_reference_id !== user.id || session.status !== 'complete') {
      return json({ error: 'Checkout has not completed for this account.' }, 409, origin);
    }
    const subscription = typeof session.subscription === 'object' ? session.subscription : null;
    await updateSubscription(db, user.id, {
      status: subscription?.status || 'trialing', customerId: stripeId(session.customer),
      subscriptionId: stripeId(session.subscription), plan: session.metadata?.plan || null,
      currentPeriodEnd: stripeDate(subscription?.current_period_end), cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    });
    const updated = await db.prepare('SELECT * FROM users WHERE id=?').bind(user.id).first();
    return json({ user: safeUser(updated) }, 200, origin);
  }

  if (url.pathname === '/billing/portal' && request.method === 'POST') {
    if (!user.stripe_customer_id) return json({ error: 'No Stripe billing profile exists for this account.' }, 404, origin);
    const appUrl = String(env.PUBLIC_APP_URL || 'https://castfishingapp.com').replace(/\/$/, '');
    const params = new URLSearchParams();
    params.set('customer', user.stripe_customer_id);
    params.set('return_url', `${appUrl}/pro`);
    const portal = await stripeRequest(env, '/billing_portal/sessions', 'POST', params);
    return json({ portalUrl: portal.url }, 201, origin);
  }

  if (url.pathname === '/friends' && request.method === 'GET') {
    const result = await db.prepare(`SELECT u.* FROM friendships f JOIN users u
      ON u.id = CASE WHEN f.user_low = ? THEN f.user_high ELSE f.user_low END
      WHERE f.user_low = ? OR f.user_high = ? ORDER BY u.username COLLATE NOCASE`).bind(user.id, user.id, user.id).all();
    return json({ friends: result.results.map(friendShape) }, 200, origin);
  }

  if (url.pathname === '/friends/search' && request.method === 'GET') {
    const query = String(url.searchParams.get('q') || '').trim();
    if (query.length < 2) return json({ users: [] }, 200, origin);
    const result = await db.prepare(`SELECT u.* FROM users u WHERE u.id != ? AND u.username LIKE ? ESCAPE '\\'
      AND NOT EXISTS (SELECT 1 FROM friendships f WHERE (f.user_low = ? AND f.user_high = u.id) OR (f.user_high = ? AND f.user_low = u.id))
      ORDER BY u.username COLLATE NOCASE LIMIT 20`).bind(user.id, `%${query.replace(/[\\%_]/g, '\\$&')}%`, user.id, user.id).all();
    return json({ users: result.results.map(friendShape) }, 200, origin);
  }

  if (url.pathname === '/friends/requests' && request.method === 'GET') {
    const result = await db.prepare(`SELECT r.*, u.username, u.level, u.catch_count, u.avatar_color FROM friend_requests r
      JOIN users u ON u.id = CASE WHEN r.sender_id = ? THEN r.receiver_id ELSE r.sender_id END
      WHERE (r.sender_id = ? OR r.receiver_id = ?) AND r.status = 'pending' ORDER BY r.created_at DESC`).bind(user.id, user.id, user.id).all();
    const requests = result.results.map((row) => ({
      id: row.id, fromId: row.sender_id === user.id ? row.receiver_id : row.sender_id,
      fromName: row.username, fromLevel: Number(row.level || 1), fromCatchCount: Number(row.catch_count || 0),
      avatarColor: row.avatar_color || '#15565D', sentAt: row.created_at,
      type: row.sender_id === user.id ? 'outgoing' : 'incoming',
    }));
    return json({ requests }, 200, origin);
  }

  if (url.pathname === '/friends/request' && request.method === 'POST') {
    const username = String(payload?.username || '').trim();
    const target = await db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').bind(username).first();
    if (!target) return json({ error: 'No CAST angler has that username.' }, 404, origin);
    if (target.id === user.id) return json({ error: 'That is your own account.' }, 400, origin);
    const low = user.id < target.id ? user.id : target.id;
    const high = user.id < target.id ? target.id : user.id;
    const existingFriend = await db.prepare('SELECT 1 AS yes FROM friendships WHERE user_low=? AND user_high=?').bind(low, high).first();
    if (existingFriend) return json({ error: 'You are already friends.' }, 409, origin);
    const reverse = await db.prepare(`SELECT id FROM friend_requests WHERE sender_id=? AND receiver_id=? AND status='pending'`).bind(target.id, user.id).first();
    if (reverse) return json({ error: 'They already sent you a request. Open Requests to accept it.' }, 409, origin);
    try {
      const now = new Date().toISOString();
      await db.prepare(`INSERT INTO friend_requests (id,sender_id,receiver_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?)`)
        .bind(crypto.randomUUID(), user.id, target.id, 'pending', now, now).run();
    } catch (error) {
      if (String(error?.message || '').includes('UNIQUE')) return json({ error: 'Friend request already sent.' }, 409, origin);
      throw error;
    }
    return json({ ok: true }, 201, origin);
  }

  const requestMatch = url.pathname.match(/^\/friends\/requests\/([^/]+)\/(accept|decline)$/);
  if (requestMatch && request.method === 'POST') {
    const row = await db.prepare(`SELECT * FROM friend_requests WHERE id=? AND receiver_id=? AND status='pending'`).bind(requestMatch[1], user.id).first();
    if (!row) return json({ error: 'Friend request not found.' }, 404, origin);
    const now = new Date().toISOString();
    if (requestMatch[2] === 'accept') {
      const low = row.sender_id < row.receiver_id ? row.sender_id : row.receiver_id;
      const high = row.sender_id < row.receiver_id ? row.receiver_id : row.sender_id;
      await db.batch([
        db.prepare(`UPDATE friend_requests SET status='accepted', updated_at=? WHERE id=?`).bind(now, row.id),
        db.prepare('INSERT OR IGNORE INTO friendships (user_low,user_high,created_at) VALUES (?,?,?)').bind(low, high, now),
      ]);
    } else {
      await db.prepare(`UPDATE friend_requests SET status='declined', updated_at=? WHERE id=?`).bind(now, row.id).run();
    }
    return json({ ok: true }, 200, origin);
  }

  const friendMatch = url.pathname.match(/^\/friends\/([^/]+)$/);
  if (friendMatch && request.method === 'DELETE') {
    const low = user.id < friendMatch[1] ? user.id : friendMatch[1];
    const high = user.id < friendMatch[1] ? friendMatch[1] : user.id;
    await db.prepare('DELETE FROM friendships WHERE user_low=? AND user_high=?').bind(low, high).run();
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Unknown API endpoint' }, 404, origin);
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
    const url = new URL(request.url);
    if (url.pathname === '/stripe/webhook' && request.method === 'POST') {
      try { return await handleStripeWebhook(request, env, origin); }
      catch (error) { return json({ error: error?.message || 'Stripe webhook failed.' }, 500, origin); }
    }
    let payloadIn;
    if (request.method === 'POST' || request.method === 'PATCH') {
      try {
        payloadIn = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, origin);
      }
    }

    try {
      if (url.pathname.startsWith('/auth/') || url.pathname === '/profile'
        || url.pathname.startsWith('/friends') || url.pathname.startsWith('/billing/')) {
        return await handleApi(request, env, url, origin, payloadIn);
      }
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
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
