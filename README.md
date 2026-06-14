# 🐹 HamstersarusOS

A personal website **and portfolio** built as a tiny **web operating system**. Instead of a plain "about me" page, you land on a desktop and get to know me and my work by clicking around, opening windows, browsing projects, playing games, and poking through apps.

### ▸ [Open the live site](https://hamstersarus.github.io/HamstersarusOS/)

Built for **Hack Club Stardance**, following the [webOS jam](https://jams.hackclub.com/batch/webOS).

---

## ✨ Features

Double click the desktop icons to open apps.

**Portfolio**
- **About Me 🐹** - who I am, plus my likes and dislikes.
- **Projects 📁** - cards for my projects (this OS, SENTINEL, Fight, 2048), each linked to its code.
- **Skills 🛠️** - languages and tools shown as proficiency bars.
- **Resume 📄** - education, experience, and awards.
- **Contact ✉️** - GitHub, LinkedIn, and email.

**The OS itself**
- **Welcome screen** - a pixel logo and a fake "neofetch" terminal that boots you into the desktop.
- **Desktop & top bar** - graph-paper wallpaper, a live clock, and clickable app icons.
- **Draggable windows** - drag them by the title bar, click to bring one to the front, and close them with the ×.
- **Music player 🎵** - lofi tracks start playing the moment you enter, with a "now playing" notification. Play / pause / skip from the app, and it keeps playing even after you close its window.
- **2048 🎮** - a fully playable, purple-themed version of the game.
- **Message me 💬** - leave a message and it goes straight to my inbox.
- **Gallery & Trash** - small extra apps to explore.

## 🎮 Controls

- **Double-click** a desktop icon to open its app.
- **Drag** a window by its title bar to move it; **click** it to bring it forward; **×** to close.
- In **2048**, use the **arrow keys** or **WASD** to slide the tiles. Combine matching numbers to reach 2048!

## 🎨 The look

A dreamy **lavender "Tokyo Night"** desktop crossed with a **Y2K Windows scrapbook** vibe, soft purple graph paper, dark windows with neon-purple borders, and pixel + retro-terminal fonts. The wallpaper grid is pure CSS (no image!).

## 🛠️ Built with

Plain **HTML, CSS, and JavaScript**.

```
HamstersarusOS/
├── index.html        # the whole OS
├── css/style.css     # all styling + the design system
├── js/
│   ├── os.js         # boot, desktop, clock, icons
│   ├── windows.js    # the draggable-window system + app registry
│   └── apps/
│       ├── game2048.js
│       └── music.js
└── assets/music/     # drop your songs here
```

## ▶️ Run it locally

No install needed. Either open `index.html` in a browser, or (recommended) serve it:

```bash
python3 -m http.server 8000
```

Then visit **http://localhost:8000**. Using a local server avoids browser caching issues while editing.

## 🎵 Adding your own music

1. Put `.mp3` files in `assets/music/`.
2. List them in the `playlist` array in `js/apps/music.js`.

---

Made with 🐹 by Hamstersarus.
