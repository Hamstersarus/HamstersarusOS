// HamstersarusOS — boot, desktop, clock.
// Keep behavior here; structure stays in index.html, styling in css/style.css.

// --- Part 1: Welcome -> Desktop ---
const welcome = document.getElementById("welcome");
const desktop = document.getElementById("desktop");
const enterBtn = document.getElementById("enter-btn");

enterBtn.addEventListener("click", () => {
  welcome.classList.add("hidden");
  desktop.classList.remove("hidden");
});

// --- Part 2: Live clock in the top bar ---
const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

// --- Part 2: Desktop icons ---
const icons = document.querySelectorAll(".icon");

icons.forEach((icon) => {
  // single click selects (deselect the others)
  icon.addEventListener("click", () => {
    icons.forEach((i) => i.classList.remove("selected"));
    icon.classList.add("selected");
  });

  // double click will open the app's window once Part 3 exists
  icon.addEventListener("dblclick", () => {
    const app = icon.dataset.app;
    console.log(`open app: ${app}`); // TODO Part 3: createWindow(...)
  });
});

// click empty desktop -> clear selection
desktop.addEventListener("click", (e) => {
  if (e.target === desktop) icons.forEach((i) => i.classList.remove("selected"));
});

// --- Part 3+: window system goes in js/windows.js (split out when it grows) ---
