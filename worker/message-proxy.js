// HamstersarusOS — Cloudflare Worker that proxies messages to Discord.
//
// WHY: a static site can't keep a secret (everything ships to the browser).
// This Worker runs on Cloudflare's servers, holds the real Discord webhook in a
// secret env var (DISCORD_WEBHOOK_URL), and rate-limits by IP so the public
// endpoint can't be spammed. The website's own rate limit is just for UX and is
// trivially bypassed — THIS is the real enforcement.
//
// SETUP (one time, in the Cloudflare dashboard):
//   1. Secret — Settings -> Variables and Secrets -> add a SECRET named
//        DISCORD_WEBHOOK_URL = your Discord webhook URL
//   2. Rate-limit store — create a KV namespace (Storage & Databases -> KV ->
//      Create), then bind it to this Worker (Settings -> Bindings -> add KV
//      namespace) with the variable name  RATE_LIMIT.
//   (If RATE_LIMIT isn't bound yet, the Worker still forwards — just without
//   rate limiting — so nothing breaks while you set it up.)

const MAX_PER_WINDOW = 5; // max messages from one IP...
const WINDOW_SEC = 60; // ...per this many seconds (KV TTL minimum is 60)
const MAX_VISITS_PER_MIN = 20; // cap visit pings so they can't be used to flood you

// POST /visit -> a quiet "someone opened the site" ping to Discord.
// Globally rate-limited (a flood can't dump unlimited pings into your channel).
async function handleVisit(request, env, cors) {
  if (request.method !== "POST") return new Response("ok", { status: 200, headers: cors });
  // Only log if a SEPARATE visitor webhook is configured, so visit logs land in
  // their own channel (not your messages channel). No @mentions, so it won't ping.
  if (!env.VISIT_WEBHOOK_URL) return new Response("ok", { status: 200, headers: cors });

  if (env.RATE_LIMIT) {
    const now = Date.now();
    let hits;
    try {
      hits = JSON.parse((await env.RATE_LIMIT.get("visit-global")) || "[]");
    } catch (e) {
      hits = [];
    }
    hits = hits.filter((t) => now - t < 60000);
    if (hits.length >= MAX_VISITS_PER_MIN) return new Response("ok", { status: 200, headers: cors });
    hits.push(now);
    await env.RATE_LIMIT.put("visit-global", JSON.stringify(hits), { expirationTtl: 60 });
  }

  const country = (request.cf && request.cf.country) || request.headers.get("cf-ipcountry") || "??";
  await fetch(env.VISIT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "visitor log",
      content: "🟢 someone joined (from " + country + ")",
    }),
  });
  return new Response("ok", { status: 200, headers: cors });
}

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // visit pings use a separate path
    if (new URL(request.url).pathname === "/visit") return handleVisit(request, env, cors);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405, headers: cors });
    }

    // --- per-IP rate limit (needs a KV binding named RATE_LIMIT) ---
    if (env.RATE_LIMIT) {
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      const key = "rl:" + ip;
      const now = Date.now();
      let hits;
      try {
        hits = JSON.parse((await env.RATE_LIMIT.get(key)) || "[]");
      } catch (e) {
        hits = [];
      }
      hits = hits.filter((t) => now - t < WINDOW_SEC * 1000); // drop old hits
      if (hits.length >= MAX_PER_WINDOW) {
        return new Response("too many messages — slow down", { status: 429, headers: cors });
      }
      hits.push(now);
      await env.RATE_LIMIT.put(key, JSON.stringify(hits), { expirationTtl: WINDOW_SEC });
    }

    // parse the incoming { name, message }
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response("bad request", { status: 400, headers: cors });
    }

    const name = String(data.name || "anonymous").slice(0, 80);
    const message = String(data.message || "").trim().slice(0, 1500);
    if (!message) {
      return new Response("empty message", { status: 400, headers: cors });
    }

    // forward to the real Discord webhook (kept secret in env)
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: name + " (via HamstersarusOS)",
        content: message,
      }),
    });

    return new Response(res.ok ? "ok" : "discord error", {
      status: res.ok ? 200 : 502,
      headers: cors,
    });
  },
};
