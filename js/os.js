// HamstersarusOS — boot, desktop, clock.
// Keep behavior here; structure stays in index.html, styling in css/style.css.

// --- Part 1: Welcome -> Desktop ---
const welcome = document.getElementById("welcome");
const desktop = document.getElementById("desktop");
const enterBtn = document.getElementById("enter-btn");

enterBtn.addEventListener("click", () => {
  welcome.classList.add("hidden");
  desktop.classList.remove("hidden");
  // start the music right away (this click is the user gesture browsers
  // require to allow audio), and announce it with a toast
  musicPlayer.play();
  showNotification("🎵 now playing: " + musicPlayer.currentTitle);
});

// Small desktop toast that slides in, then fades out.
function showNotification(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  desktop.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// --- Part 2: Live clock in the top bar ---
const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

// --- Part 2: Desktop icons ---
const icons = document.querySelectorAll(".icon");
const isTouch = window.matchMedia("(pointer: coarse)").matches;

icons.forEach((icon) => {
  // click selects (deselect the others); on touch, a single tap also opens
  icon.addEventListener("click", () => {
    icons.forEach((i) => i.classList.remove("selected"));
    icon.classList.add("selected");
    if (isTouch) openApp(icon.dataset.app);
  });

  // on desktop (mouse), double-click opens the app (defined in js/windows.js)
  icon.addEventListener("dblclick", () => {
    openApp(icon.dataset.app);
  });
});

// click empty desktop -> clear selection
desktop.addEventListener("click", (e) => {
  if (e.target === desktop) icons.forEach((i) => i.classList.remove("selected"));
});

// --- Part 3+: window system goes in js/windows.js (split out when it grows) ---
