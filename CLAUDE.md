> **For Claude.** This file is the single source of truth for the Hamstersarus webOS project. Everything built here must follow it. When a decision is made that affects future work, record it here so the next session stays consistent. For a human-facing overview, see [README.md](README.md).

# Hamstersarus — a personal webOS portfolio

A web-based operating system that *is* my personal website **and portfolio**. Instead of a plain page, visitors land on a desktop and get to know me (Ayla / Hamstersarus) — and my skills, projects, and resume — by exploring windows and apps.

Built for the **Hack Club Stardance** event, following the **webOS jam**: <https://jams.hackclub.com/batch/webOS>.

> **Privacy:** the site is fully public (no password). Never put personal/contact details that shouldn't be world-readable on it — specifically **no home address, no phone number, and no third party's contact info**. Resume content is the professional parts only (education, experience, skills, awards, GitHub).

> "What if instead of directing random strangers to your boring personal website, you could direct them to an entire OS — where through exploring, they get to know you?"

---

## Build & Run

No build step, no tooling, no install.

```bash
# from this folder
open index.html        # or just double-click index.html in a file browser
```

For live-reload while editing, any static server works (optional):
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

---

## Hard Constraints

These are fixed for the whole project. Do not break them without updating this file first.

- **Plain HTML / CSS / JavaScript only.** No React, Vue, Tailwind, jQuery, TypeScript, or any framework.
- **No build step and no npm.** Nothing that needs compiling, bundling, or installing. The site must run by opening `index.html` directly from disk.
- **Vanilla JS only** — browser-native APIs (DOM, `localStorage`, `setInterval`, etc.). No external JS libraries.
- **No backend.** Everything runs in the browser. Persistence (if any) uses `localStorage`.
- **Mobile is secondary.** Target desktop browsers first; don't block on responsive layout.

---

## Project Structure

Current layout:

```
HamstersarusOS/
├── index.html          # the whole OS lives in one page (welcome → desktop)
├── css/
│   └── style.css       # all styling + the design system
├── js/
│   ├── os.js           # boot, desktop, top bar, clock, icons, toast
│   ├── windows.js      # window create / drag / close / focus + APPS registry
│   └── apps/
│       ├── game2048.js # buildGame2048()
│       └── music.js    # musicPlayer singleton + buildMusicPlayer()
├── assets/
│   └── music/          # .mp3 tracks for the music app
├── README.md           # human-facing overview
└── CLAUDE.md           # this file
```

Keep it flat: one CSS file, simple apps inline in `windows.js`, and a file in `js/apps/` only for interactive apps that need real logic.

---

## The Build Plan (jam = 5 parts)

All five parts are complete. Kept here as a record of what was built.

- [x] **Part 1 — Welcome screen.** Pixel logo + a neofetch-style terminal card; the "enter" button reveals the desktop.
- [x] **Part 2 — Desktop & top bar with clock.** Graph-paper desktop, top bar, a live clock (`setInterval`, every second), and selectable desktop icons.
- [x] **Part 3 — Draggable, closable, openable windows.** `createWindow()` in `js/windows.js` — drag by the title bar, click-to-front, close button, plus clamp-into-view. See [Window System](#window-system).
- [x] **Part 4 — First app.** About Me (avatar, bio, likes/dislikes).
- [x] **Part 5 — Advanced app.** Music player (shared singleton, auto-plays on enter) **and** a playable purple 2048 — 2048 is also the "feature the guide didn't list."

---

## Window System

The window system from Part 3 is shared infrastructure — every app from Part 4 onward sits inside a window. Design it once, reuse it everywhere.

**A window is a `<div>` with:**
- a **title bar** (drag handle + title text + close button) and a **content area**
- absolute positioning (`position: absolute; left/top`) so it can be moved freely
- a `z-index` that increases when the window is focused, so the clicked window comes to front

**Core behaviors** (as implemented in `js/windows.js`):
- **Open** — `createWindow({ id, title, content })` builds the element, cascades + clamps it into view, appends it to the desktop, and returns it. `content` may be an HTML string, a DOM node, or a builder function. `id` de-dupes: opening an already-open app just focuses it.
- **Drag** — **pointer events** on the title bar: `pointerdown` (with `setPointerCapture`) starts the drag, `pointermove` updates `left`/`top` (clamped on-screen), `pointerup` ends it. Drag only by the title bar, never the whole window.
- **Focus** — `pointerdown` anywhere on a window raises it above the others (bump `z-index`).
- **Close** — the × button removes the element from the DOM (and clears it from the open-window map).

Keep this generic: apps pass in their content and never touch dragging/z-index themselves.

---

## Apps

Each app is self-contained and opens inside a standard window.

- Apps are registered in the `APPS` map in `js/windows.js` (keyed by the icon's `data-app`). Each entry has a `title` and `content`.
- `content` is either an **HTML string** (simple apps) or a **builder function** in `js/apps/` that returns a DOM node (interactive apps, e.g. `buildGame2048`, `buildMusicPlayer`).
- Apps are launched by double-clicking a desktop icon (`os.js` → `openApp(id)`).
- Apps should reflect *me* — exploring the OS should teach the visitor who Hamstersarus is.

| App | Icon id | Status | What it does |
|-----|---------|--------|--------------|
| About Me | `about` | ✅ | Name, tag, bio, likes/dislikes (HTML string) |
| Projects | `projects` | ✅ | Project cards (desc + tech + links); scrolls if long |
| Skills | `skills` | ✅ | Proficiency bars via `lvl-1`…`lvl-5` classes |
| Resume | `resume` | ✅ | Education / experience / awards — **professional info only** |
| Contact | `contact` | ✅ | GitHub + email links (no address/phone) |
| Music | `music` | ✅ | Shared `musicPlayer` singleton; auto-plays on enter, keeps playing when closed (`js/apps/music.js`) |
| 2048 | `game` | ✅ | Playable purple 2048, arrow/WASD (`js/apps/game2048.js`) |
| Message | `notes` | ✅ | Message form → Cloudflare Worker → Discord; frontend rate limit (`js/apps/notes.js`, `worker/message-proxy.js`) |
| Gallery | `gallery` | placeholder | Emoji grid — swap for real images |
| Magic Hamster Ball | `fortune` | ✅ | Hamster-pun Magic 8-Ball — replaced Trash (`js/apps/fortune.js`) |

### Plan — Magic Hamster Ball (replaces Trash)

**Concept.** A hamster-pun Magic 8-Ball: an 8-ball is a ball, and a hamster runs in a *hamster ball* — same object. Ask a yes/no question, shake the ball, and the hamster rolls up an answer. Pure flavor (non-functional), reuses the window system, no image assets.

**Desktop icon.** Replaces 🗑️ trash → 🔮 labelled `fortune`, `data-app="fortune"`.

**Files to touch.**
- `js/apps/fortune.js` — **new.** `buildHamsterBall()` returns the app's DOM node (interactive → its own file, like game2048/music).
- `js/windows.js` — add `fortune: { title: "~/hamster-ball", content: buildHamsterBall }` to `APPS`; **remove** the `trash` entry.
- `index.html` — swap the `trash` `<li>` for the `fortune` icon; add `<script src="js/apps/fortune.js">` before `windows.js`.
- `css/style.css` — `.app-fortune` styles (the ball, wobble animation, answer text); the old `.app-trash` rule can go.

**Structure (inside the window).**
- `.fortune-ball` — round purple ball with a 🐹 inside and a soft neon glow.
- `.fortune-question` — text input for the yes/no question.
- `.fortune-shake` — "shake" button.
- `.fortune-answer` — where the answer fades in.

**Behaviour.**
- Shake (button click, or Enter in the input): if the question is empty, nudge *"ask me something first 🐹"*. Otherwise add a `.shaking` class (wobble `@keyframes`, ~0.6s), clear the old answer, then reveal a random answer.
- `ANSWERS` — flat array of ~16 punny strings (yes / maybe / no mix), picked uniformly at random. Avoid repeating the immediately-previous answer.
- No persistence, no network.

**Answer set (starter — tweak freely).**
Yes: "Squeak yes! 🐹" · "All signs point to seeds." · "Cheeks don't lie — yes." · "By the power of the wheel, yes. 🎡" · "It is written in the seeds."
Maybe: "Ask again after my nap. 😴" · "The wheel is still spinning…" · "Reply hazy — too much sawdust." · "Cheeks too full to answer." · "Consult the bedding and try again."
No: "Not a chance, you absolute walnut." · "No. *aggressively stuffs cheeks*" · "The seeds say no." · "My whiskers sense doubt." · "Don't count your seeds before they sprout."

**Style notes.** Purple radial-gradient ball + neon glow (reuse `--purple`/glow pattern), VT323 for the answer text, wobble via `@keyframes`. Keep within the floating-window sizing (it's decorative — fine to be small).

---

## Style & Personality — the locked aesthetic

**Vibe:** a dreamy **lavender "Tokyo Night" desktop rice** crossed with a **Y2K Windows scrapbook**. Soft purple graph-paper wallpaper, dark charcoal-purple windows with thin neon borders and a faint glow, pixel + retro-terminal type, and playful sticker/sparkle decoration. The OS should feel like *my* cozy personal machine — exploring it tells you who Hamstersarus is.

These tokens are defined in [css/style.css](css/style.css) under `:root`. **Use the CSS variables — never hard-code these values in components.**

### Palette
| Token | Value | Use |
|---|---|---|
| `--wall` / `--wall-2` | `#bcb8e0` / `#a9a6d6` | Lavender wallpaper |
| `--grid-line` | `rgba(40,30,70,.10)` | Graph-paper grid lines |
| `--win-bg` / `--win-bg-2` | `#1a1b26` / `#24283b` | Window body / title bar |
| `--win-border` | `#bb9af7` | Window neon border |
| `--ink` | `#c0caf5` | Body text |
| `--muted` | `#565f89` | Dim text, dots |
| `--purple` `--blue` `--cyan` `--green` `--orange` `--pink` | Tokyo Night neons | Accents; `--accent` = purple |

### Fonts (loaded from Google Fonts in `index.html`, no build step)
- `--font-display` — **Press Start 2P** (pixel): big logos/headers only (hard to read small).
- `--font-terminal` — **VT323** (CRT terminal): clocks, neofetch readouts, flavor text.
- `--font-mono` — **JetBrains Mono**: UI labels, buttons, body where readability matters.

### Signature elements
- **Graph-paper wallpaper** is pure CSS (two `linear-gradient`s) — no image asset needed.
- **Windows** = dark rounded rect, 1.5px purple border, soft neon glow, title bar with three colored dots + a `~/path`-style title.
- **Neofetch card** on the welcome screen (mascot + system info) sets the rice tone.
- **Decoration** (add as you go): ✨ sparkles, ⭐ stars, pixel stickers, marker-style doodles, halftone — the Y2K scrapbook layer.

### Rules
- **No pre-made CSS UI kit** (98.css, Bootstrap, etc.) — they fight this bespoke look. Hand-style with the tokens above.
- **Consistency over flash** — every window, app, and the top bar share this one visual language.
- When you add a new color or font, add it as a token here *and* in `:root`, don't inline it.

---

## Coding Conventions

- **Separation:** structure in HTML, styling in CSS, behavior in JS. No inline `style="..."` and no inline `onclick="..."` — wire events in JS with `addEventListener`.
- **Naming:** `camelCase` for JS variables/functions, `kebab-case` for CSS classes and file names, `#id` only for genuinely unique elements.
- **Small functions, clear names.** Prefer readable over clever.
- **Comments** explain *why*, not *what*. Keep them sparse.
- **No magic numbers** for things reused across files (e.g. base z-index, top-bar height) — define them once.

---

## Assets

- Put images/icons in `assets/`.
- Source emoji (if used in markup or text) from a single place and keep it consistent across the project.
- Keep file names lowercase and descriptive (`mascot.png`, not `IMG_2931.png`).

---

## Standards

- **This file wins.** If code and CLAUDE.md disagree, fix the code or update this file — never let them silently drift.
- **One part at a time.** Don't start a later part before the current one works end-to-end.
- **Commit working states.** Each finished part is a natural commit point.
