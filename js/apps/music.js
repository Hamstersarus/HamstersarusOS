// HamstersarusOS — music player (advanced app).
// Plays real audio files from assets/music/.
//
// TO ADD YOUR MUSIC:
//   1. drop .mp3 files into the assets/music/ folder
//   2. list them in the `playlist` array below (title + matching filename)

function buildMusicPlayer() {
  const playlist = [
    { title: "track one", src: "assets/music/track1.mp3" },
    { title: "track two", src: "assets/music/track2.mp3" },
  ];
  let index = 0;

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

  const audio = new Audio();
  const trackEl = root.querySelector(".app-music-track");
  const playBtn = root.querySelector('[data-act="play"]');
  const art = root.querySelector(".app-music-art");

  function load(i) {
    index = (i + playlist.length) % playlist.length;
    audio.src = playlist[index].src;
    trackEl.textContent = playlist[index].title;
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });
  root.querySelector('[data-act="next"]').addEventListener("click", () => {
    load(index + 1);
    audio.play();
  });
  root.querySelector('[data-act="prev"]').addEventListener("click", () => {
    load(index - 1);
    audio.play();
  });

  audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    art.classList.add("spin");
  });
  audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    art.classList.remove("spin");
  });
  audio.addEventListener("ended", () => {
    load(index + 1);
    audio.play();
  });
  audio.addEventListener("error", () => {
    trackEl.textContent = "drop songs in assets/music/";
    art.classList.remove("spin");
  });

  load(0);
  return root;
}
