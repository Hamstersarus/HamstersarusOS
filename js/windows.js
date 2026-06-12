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

// Nudge a window so it sits fully on-screen (below the top bar).
const TOP_BAR = 34;
function clampIntoView(win) {
  const margin = 8;
  const maxLeft = Math.max(margin, window.innerWidth - win.offsetWidth - margin);
  const maxTop = Math.max(TOP_BAR + margin, window.innerHeight - win.offsetHeight - margin);
  const left = Math.min(parseInt(win.style.left, 10) || 0, maxLeft);
  const top = Math.min(Math.max(parseInt(win.style.top, 10) || 0, TOP_BAR + margin), maxTop);
  win.style.left = left + "px";
  win.style.top = top + "px";
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
  clampIntoView(win); // pull it fully on-screen now that we know its size
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
  // Part 4 — first real app. Personalize the text below with your own info.
  about: {
    title: "~/about-me",
    content:
      '<div class="app-about">' +
        '<div class="app-about-head">' +
          '<div class="app-about-avatar">🐹</div>' +
          "<div>" +
            "<h2>Hamstersarus</h2>" +
            '<p class="app-about-tag">she/her · webOS enjoyer</p>' +
          "</div>" +
        "</div>" +
        '<p class="app-about-bio">hi! i\'m a Hack Club member building my corner ' +
        "of the internet as a tiny operating system. click around the desktop " +
        "to get to know me.</p>" +
        '<div class="app-about-cols">' +
          "<div><h3>likes</h3><ul>" +
            "<li>pixel art</li><li>late-night coding</li>" +
            "<li>lavender everything</li><li>my mascot 🐹</li>" +
          "</ul></div>" +
          "<div><h3>dislikes</h3><ul>" +
            "<li>boring websites</li><li>popups</li><li>full storage</li>" +
          "</ul></div>" +
        "</div>" +
      "</div>",
  },
  notes: {
    title: "~/notes",
    content: '<textarea class="app-notes" placeholder="type something..."></textarea>',
  },
  // advanced apps — content is a builder function (see js/apps/)
  music: {
    title: "~/music",
    content: buildMusicPlayer,
  },
  game: {
    title: "~/2048",
    content: buildGame2048,
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
  if (!app) return;
  // content may be an HTML string, a DOM node, or a builder function
  const content = typeof app.content === "function" ? app.content() : app.content;
  createWindow({ id: appId, title: app.title, content });
}
