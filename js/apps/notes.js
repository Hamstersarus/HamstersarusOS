// HamstersarusOS — "message me" app.
// Sends whatever the visitor types straight to a Discord channel via a webhook.
//
// SETUP: create a Discord webhook (Server Settings -> Integrations -> Webhooks
// -> New Webhook -> Copy Webhook URL) and paste it below.
// NOTE: this URL is visible in the public page source. A webhook can only POST
// messages to its one channel; if it ever gets spammed, delete it and make a new one.

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1515168582210949172/qVfYnrP4EMd7jk_UR6oCjXLcYUGIXszaDhrfoQUezgp6gTpSy_nvTXUe8YPLnTAoUFNj";

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

  sendBtn.addEventListener("click", async () => {
    const message = textEl.value.trim();
    if (!message) {
      setStatus("write something first!", "err");
      return;
    }
    if (DISCORD_WEBHOOK_URL.startsWith("PASTE_")) {
      setStatus("not set up yet — add a Discord webhook URL in js/apps/notes.js", "err");
      return;
    }

    const from = fromEl.value.trim() || "anonymous";
    sendBtn.disabled = true;
    setStatus("sending...");
    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: from + " (via HamstersarusOS)",
          content: message,
        }),
      });
      if (res.ok) {
        fromEl.value = "";
        textEl.value = "";
        setStatus("sent! thanks 💜", "ok");
      } else {
        setStatus("hmm, that didn't go through (" + res.status + ")", "err");
      }
    } catch (e) {
      setStatus("couldn't send — check your connection", "err");
    } finally {
      sendBtn.disabled = false;
    }
  });

  return root;
}
