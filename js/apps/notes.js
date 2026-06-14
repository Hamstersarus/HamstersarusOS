// HamstersarusOS — "message me" app.
// Sends the visitor's message to a Cloudflare Worker, which forwards it to
// Discord. The real Discord webhook lives as a hidden secret inside the Worker
// (see worker/message-proxy.js), so it's never exposed in this public code.

const MESSAGE_ENDPOINT = "https://hamstersarus-message.ayla-vaynerman.workers.dev/";

// Frontend rate limit (stops casual/accidental spam; not real security —
// a determined person can bypass client-side JS).
const RATE = {
  cooldownMs: 15000, // minimum gap between messages
  maxPerWindow: 6, // most messages allowed...
  windowMs: 15 * 60 * 1000, // ...per 15 minutes
  storeKey: "hamstersarus_msg_sends", // localStorage key (survives reloads)
};

function getSendTimes() {
  try {
    const now = Date.now();
    const all = JSON.parse(localStorage.getItem(RATE.storeKey)) || [];
    return all.filter((t) => now - t < RATE.windowMs); // drop old ones
  } catch (e) {
    return [];
  }
}

function recordSend() {
  try {
    const times = getSendTimes();
    times.push(Date.now());
    localStorage.setItem(RATE.storeKey, JSON.stringify(times));
  } catch (e) {
    /* localStorage unavailable (e.g. private mode) — rate limit just won't persist */
  }
}

function buildNotes() {
  const root = document.createElement("div");
  root.className = "app-message";
  root.innerHTML =
    '<p class="app-message-intro">leave me a message 💬</p>' +
    '<input class="app-message-from" type="text" maxlength="80" placeholder="your name (optional)" />' +
    '<textarea class="app-message-text" maxlength="1500" placeholder="your message..."></textarea>' +
    '<button class="app-message-send">send ▸</button>' +
    '<p class="app-message-status"></p>';

  const fromEl = root.querySelector(".app-message-from");
  const textEl = root.querySelector(".app-message-text");
  const sendBtn = root.querySelector(".app-message-send");
  const statusEl = root.querySelector(".app-message-status");

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "app-message-status" + (kind ? " " + kind : "");
  }

  // Disable the button and count down until `untilMs`, then re-enable.
  let cooldownTimer = null;
  function startCooldown(untilMs) {
    clearInterval(cooldownTimer);
    function tick() {
      const left = Math.ceil((untilMs - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(cooldownTimer);
        sendBtn.disabled = false;
        sendBtn.textContent = "send ▸";
      } else {
        sendBtn.disabled = true;
        sendBtn.textContent = "wait " + left + "s";
      }
    }
    tick();
    cooldownTimer = setInterval(tick, 250);
  }

  // If the app is reopened mid-cooldown, reflect that straight away.
  const recent = getSendTimes();
  if (recent.length) {
    const until = Math.max(...recent) + RATE.cooldownMs;
    if (until > Date.now()) startCooldown(until);
  }

  sendBtn.addEventListener("click", async () => {
    const message = textEl.value.trim();
    if (!message) {
      setStatus("write something first!", "err");
      return;
    }
    if (MESSAGE_ENDPOINT.startsWith("PASTE_")) {
      setStatus("not set up yet — add your Worker URL in js/apps/notes.js", "err");
      return;
    }

    // --- rate limit checks ---
    const now = Date.now();
    const sends = getSendTimes();
    if (sends.length >= RATE.maxPerWindow) {
      setStatus("you've sent a few messages already — try again in a bit", "err");
      return;
    }
    const last = sends.length ? Math.max(...sends) : 0;
    if (last && now - last < RATE.cooldownMs) {
      const wait = Math.ceil((RATE.cooldownMs - (now - last)) / 1000);
      setStatus("please wait " + wait + "s before sending again", "err");
      return;
    }

    const from = fromEl.value.trim() || "anonymous";
    sendBtn.disabled = true;
    setStatus("sending...");
    try {
      const res = await fetch(MESSAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: from, message: message }),
      });
      if (res.ok) {
        fromEl.value = "";
        textEl.value = "";
        setStatus("sent! thanks 💜", "ok");
        recordSend();
        startCooldown(Date.now() + RATE.cooldownMs);
      } else {
        setStatus("hmm, that didn't go through (" + res.status + ")", "err");
        sendBtn.disabled = false;
      }
    } catch (e) {
      setStatus("couldn't send — check your connection", "err");
      sendBtn.disabled = false;
    }
  });

  return root;
}
