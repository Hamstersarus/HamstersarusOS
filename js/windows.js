// HamstersarusOS — window manager (Part 3)
// Reusable draggable / focusable / closable windows. Every app reuses this.

const desktopEl = document.getElementById("desktop");

let topZ = 10;            // highest z-index handed out so far
let cascade = 0;          // offset so new windows don't land exactly on top
const openWindows = {};   // appId -> window element (so we don't open duplicates)

// Bring a window to the front.
function focusWindow(win) {
  topZ += 1;
  win.style.zIndex = topZ;
}

// Build and show a window. Returns the window element.
// content can be an HTML string or a DOM node.
function createWindow({ id, title, content }) {
  // already open? just focus the existing one.
  if (id && openWindows[id]) {
    focusWindow(openWindows[id]);
    return openWindows[id];
  }

  const win = document.createElement("section");
  win.className = "window window--floating";

  const bar = document.createElement("div");
  bar.className = "title-bar";
  bar.innerHTML =
    '<span class="title-bar-dots"><i></i><i></i><i></i></span>' +
    '<span class="title-bar-text"></span>' +
    '<button class="title-bar-close" title="close">×</button>';
  bar.querySelector(".title-bar-text").textContent = title;

  const body = document.createElement("div");
  body.className = "window-body";
  if (typeof content === "string") body.innerHTML = content;
  else if (content) body.appendChild(content);

  win.append(bar, body);

  // cascade new windows so several are visible at once
  win.style.left = 120 + cascade + "px";
  win.style.top = 70 + cascade + "px";
  cascade = (cascade + 28) % 140;

  desktopEl.appendChild(win);
  focusWindow(win);
  if (id) openWindows[id] = win;

  // clicking anywhere on the window raises it
  win.addEventListener("pointerdown", () => focusWindow(win));

  // close button removes it
  bar.querySelector(".title-bar-close").addEventListener("click", () => {
    win.remove();
    if (id) delete openWindows[id];
  });

  makeDraggable(win, bar);
  return win;
}

// Drag `win` around by its title bar `handle`.
function makeDraggable(win, handle) {
  let startX, startY, originLeft, originTop;
  let dragging = false;

  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".title-bar-close")) return; // don't drag from the × button
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originLeft = win.offsetLeft;
    originTop = win.offsetTop;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let left = originLeft + (e.clientX - startX);
    let top = originTop + (e.clientY - startY);
    // keep the window on-screen and below the top bar
    left = Math.max(0, Math.min(left, window.innerWidth - 80));
    top = Math.max(34, Math.min(top, window.innerHeight - 40));
    win.style.left = left + "px";
    win.style.top = top + "px";
  });

  handle.addEventListener("pointerup", (e) => {
    dragging = false;
    handle.releasePointerCapture(e.pointerId);
  });
}

// ---- App registry -------------------------------------------------
// Simple placeholder apps so the windows have something to show.
// Parts 4 & 5 replace these with the real "first app" and "advanced app".
const APPS = {
  about: {
    title: "~/about-me",
    content:
      '<div class="app-about">' +
      '<div class="app-about-avatar">🐹</div>' +
      "<h2>hi, i'm Hamstersarus!</h2>" +
      "<p>welcome to my little operating system. poke around the icons to " +
      "get to know me. (placeholder — edit me in Part 4!)</p>" +
      "</div>",
  },
  notes: {
    title: "~/notes",
    content: '<textarea class="app-notes" placeholder="type something..."></textarea>',
  },
  music: {
    title: "~/music",
    content:
      '<div class="app-music">' +
      '<div class="app-music-art">💿</div>' +
      '<p class="app-music-track">nothing playing</p>' +
      '<div class="app-music-controls">⏮ ⏯ ⏭</div>' +
      "</div>",
  },
  gallery: {
    title: "~/gallery",
    content: '<div class="app-gallery">🌸 ⭐ 🐹 🌙 ✨ 🍓</div>',
  },
  trash: {
    title: "~/trash",
    content: '<p class="app-trash">🗑️ trash is empty. squeaky clean!</p>',
  },
};

// Open an app by its icon id (called from os.js on double-click).
function openApp(appId) {
  const app = APPS[appId];
  if (app) createWindow({ id: appId, title: app.title, content: app.content });
}
