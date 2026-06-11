> **For Claude.** This file is the single source of truth for the Hamstersarus webOS project. Everything built here must follow it. When a decision is made that affects future work, record it here so the next session stays consistent. For a human-facing overview, see [README.md](README.md) (create when ready).

# Hamstersarus — a personal webOS

A web-based operating system that *is* my personal website. Instead of a plain page, visitors land on a desktop and get to know me (Hamstersarus) by exploring windows and apps.

Built for the **Hack Club Stardance** event, following the **webOS jam**: <https://jams.hackclub.com/batch/webOS>.

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

> There is a leftover `Grid.java` in this folder from an earlier (abandoned) idea. It is **not** part of this project and should be deleted.

---

## Project Structure

Grow into this layout as parts get built — keep it flat and obvious.

```
Hamstersarus_Website/
├── index.html          # the whole OS lives in one page (welcome → desktop)
├── css/
│   └── style.css       # all styling (one file until it gets unwieldy)
├── js/
│   ├── os.js           # boot, desktop, top bar, clock
│   ├── windows.js      # window create / drag / close / focus
│   └── apps/           # one file per app
│       └── <app>.js
├── assets/             # images, icons, the Hamstersarus mascot
└── CLAUDE.md           # this file
```

Start with everything in `index.html` + `style.css` + `os.js` and split files out only when a section gets big. Don't pre-build empty folders.

---

## The Build Plan (jam = 5 parts)

Build in order. Each part should fully work and be committable before starting the next.

- [ ] **Part 1 — Welcome screen.** The first thing a visitor sees: a branded boot/landing screen (Hamstersarus name + mascot) with an "Enter" action that reveals the desktop. Set the tone here.
- [ ] **Part 2 — Desktop & top bar with clock.** The OS desktop (wallpaper + space for icons), a top bar, and a **live clock** that updates every second (`setInterval`, real time).
- [ ] **Part 3 — Draggable, closable, openable windows.** A reusable window system: open a window, drag it by its title bar, bring it to front on click, and close it. This is the technical heart of the project — see [Window System](#window-system) below.
- [ ] **Part 4 — First app (basic).** One simple app that opens in a window. Something personal — e.g. About Me, Notes, a photo viewer.
- [ ] **Part 5 — Advanced app.** A second, more involved app — interactive and stateful (e.g. a mini-game, music player, paint app, terminal). Reuse the window system; don't reinvent it.

When a part is done, tick its box and add any notes that future parts depend on.

---

## Window System

The window system from Part 3 is shared infrastructure — every app from Part 4 onward sits inside a window. Design it once, reuse it everywhere.

**A window is a `<div>` with:**
- a **title bar** (drag handle + title text + close button) and a **content area**
- absolute positioning (`position: absolute; left/top`) so it can be moved freely
- a `z-index` that increases when the window is focused, so the clicked window comes to front

**Core behaviors:**
- **Open** — a factory like `createWindow(title, contentEl)` builds the element, appends it to the desktop, and returns a handle.
- **Drag** — `mousedown` on the title bar starts a drag; track the cursor offset, update `left`/`top` on `mousemove`, stop on `mouseup`. (Drag only by the title bar, never the whole window.)
- **Focus** — clicking anywhere on a window raises it above the others (bump `z-index`).
- **Close** — the close button removes the element from the DOM.

Keep this generic: apps pass in their content and never touch dragging/z-index themselves.

---

## Apps

Each app is self-contained and opens inside a standard window.

- One app = one file in `js/apps/`, exposing an `open()` function that builds its content and calls `createWindow(...)`.
- Apps are launched from a desktop icon and/or the top bar.
- Apps should reflect *me* — the whole point of the jam is that exploring the OS teaches the visitor who Hamstersarus is.

| App | Part | Status | What it does |
|-----|------|--------|--------------|
| _(first app)_ | 4 | TODO | — |
| _(advanced app)_ | 5 | TODO | — |

Fill this table in as apps are designed.

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
