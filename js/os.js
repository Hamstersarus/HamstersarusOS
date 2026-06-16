// HamstersarusOS — boot, desktop, clock.
// Keep behavior here; structure stays in index.html, styling in css/style.css.

// --- Part 1: Welcome -> Desktop ---
const welcome = document.getElementById("welcome");
const desktop = document.getElementById("desktop");
const enterBtn = document.getElementById("enter-btn");

enterBtn.addEventListener("click", () => {
  welcome.classList.add("hidden");
  // start the music during the click (browsers only allow audio from a gesture)
  musicPlayer.play();
  // play a short boot sequence, then fade into the desktop
  runBoot(() => {
    desktop.classList.remove("hidden");
    boot.classList.add("boot--out");
    setTimeout(() => {
      boot.classList.add("hidden");
      boot.classList.remove("boot--out");
      showNotification("🎵 now playing: " + musicPlayer.currentTitle);
    }, 450);
  });
});

// --- Boot sequence: terminal-style log + progress bar ---
const boot = document.getElementById("boot");
const bootLog = document.getElementById("boot-log");
const bootBar = boot.querySelector(".boot-progress i");

const BOOT_LINES = [
  "HamstersarusOS v1.0",
  "loading kernel................ ok",
  "mounting /home/hamstersarus... ok",
  "starting window manager....... ok",
  "waking the hamster............ 🐹",
  "welcome.",
];

function runBoot(onDone) {
  boot.classList.remove("hidden");
  bootLog.textContent = "";
  bootBar.style.width = "0";
  let i = 0;
  const next = () => {
    if (i < BOOT_LINES.length) {
      bootLog.textContent += BOOT_LINES[i] + "\n";
      i += 1;
      bootBar.style.width = Math.round((i / BOOT_LINES.length) * 100) + "%";
      setTimeout(next, 300);
    } else {
      setTimeout(onDone, 450);
    }
  };
  next();
}

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
