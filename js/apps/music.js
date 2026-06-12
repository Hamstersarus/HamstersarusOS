// HamstersarusOS — music player (advanced app).
// `musicPlayer` is ONE shared player that keeps playing even when its window
// is closed. The window built by buildMusicPlayer() is just a UI bound to it,
// so reopening the app always reflects the real play state (no double-play).
//
// TO ADD YOUR MUSIC:
//   1. drop .mp3 files into assets/music/
//   2. add a line to the `playlist` below: title + matching filename

const musicPlayer = (function () {
  const playlist = [
    { title: "soft focus — lofi", src: "assets/music/pocketbeats-soft-focus-aesthetic-lofi-music-background-492869.mp3" },
    { title: "aesthetic lo-fi beat", src: "assets/music/tunetank-aesthetic-lo-fi-beat-348346.mp3" },
  ];

  const audio = new Audio();
  let index = 0;
  let errored = false;
  let render = null; // the open window's UI updater, if a window is open

  function update() {
    if (render) render();
  }

  function load(i, autoplay) {
    index = (i + playlist.length) % playlist.length;
    errored = false;
    audio.src = playlist[index].src;
    if (autoplay) audio.play().catch(() => {});
    update();
  }

  audio.addEventListener("play", update);
  audio.addEventListener("pause", update);
  audio.addEventListener("ended", () => load(index + 1, true));
  audio.addEventListener("error", () => {
    errored = true;
    update();
  });

  load(0, false); // preload the first track but don't play until asked

  return {
    playlist,
    get isPlaying() {
      return !audio.paused && !errored;
    },
    get currentTitle() {
      return errored ? "drop songs in assets/music/" : playlist[index].title;
    },
    play() {
      audio.play().catch(() => {});
    },
    toggle() {
      if (audio.paused) this.play();
      else audio.pause();
    },
    next() {
      load(index + 1, true);
    },
    prev() {
      load(index - 1, true);
    },
    setRender(fn) {
      render = fn;
    },
  };
})();

// The window UI — controls and mirrors the shared musicPlayer above.
function buildMusicPlayer() {
  const root = document.createElement("div");
  root.className = "app-music";
  root.innerHTML =
    '<div class="app-music-art">💿</div>' +
    '<p class="app-music-track">—</p>' +
    '<div class="app-music-controls">' +
      '<button data-act="prev" title="previous">⏮</button>' +
      '<button data-act="play" title="play / pause">▶</button>' +
      '<button data-act="next" title="next">⏭</button>' +
    "</div>";

  const trackEl = root.querySelector(".app-music-track");
  const playBtn = root.querySelector('[data-act="play"]');
  const art = root.querySelector(".app-music-art");

  function render() {
    trackEl.textContent = musicPlayer.currentTitle;
    playBtn.textContent = musicPlayer.isPlaying ? "⏸" : "▶";
    art.classList.toggle("spin", musicPlayer.isPlaying);
  }

  playBtn.addEventListener("click", () => musicPlayer.toggle());
  root.querySelector('[data-act="next"]').addEventListener("click", () => musicPlayer.next());
  root.querySelector('[data-act="prev"]').addEventListener("click", () => musicPlayer.prev());

  musicPlayer.setRender(render); // this window now reflects player state
  render(); // show the current state right away
  return root;
}
