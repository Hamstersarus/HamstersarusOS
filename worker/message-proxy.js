// HamstersarusOS — Cloudflare Worker that proxies messages to Discord.
//
// WHY: a static site can't hold a secret (everything ships to the browser).
// This Worker runs on Cloudflare's servers and keeps the real Discord webhook
// in a secret env var (DISCORD_WEBHOOK_URL), so it's never exposed publicly.
// The website posts { name, message } here; this forwards it to Discord.
//
// DEPLOY (one time):
//   1. dash.cloudflare.com -> Workers & Pages -> Create -> Create Worker
//   2. name it (e.g. hamstersarus-message) -> Deploy
//   3. Edit code -> paste this whole file -> Deploy
//   4. Settings -> Variables and Secrets -> add a SECRET named
//      DISCORD_WEBHOOK_URL  =  your (regenerated) Discord webhook URL -> Deploy
//   5. copy the Worker URL (https://<name>.<subdomain>.workers.dev) and send it
//      to me so I can point the website at it.

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*", // any site may POST a message
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405, headers: cors });
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
