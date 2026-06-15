// HamstersarusOS — 2048 (Part 5 advanced app), purple themed.
// Self-contained: builds its own DOM node, owns its state + keyboard input.
// Returns the node so the window manager can drop it into a window.

function buildGame2048() {
  const SIZE = 4;
  let grid, score, won, over;

  const root = document.createElement("div");
  root.className = "g2048";
  root.innerHTML =
    '<div class="g2048-top">' +
      '<span class="g2048-score">score <b>0</b></span>' +
      '<button class="g2048-new">new game</button>' +
    "</div>" +
    '<div class="g2048-board"></div>' +
    '<p class="g2048-msg"></p>' +
    '<p class="g2048-hint">arrow keys or WASD to move</p>';

  const boardEl = root.querySelector(".g2048-board");
  const scoreEl = root.querySelector(".g2048-score b");
  const msgEl = root.querySelector(".g2048-msg");

  // 16 fixed cells we just re-paint each render
  const cells = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "g2048-cell";
    boardEl.appendChild(cell);
    cells.push(cell);
  }

  function reset() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    won = false;
    over = false;
    addRandom();
    addRandom();
    render();
  }

  function addRandom() {
    const empty = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = grid[r][c];
        const cell = cells[r * SIZE + c];
        cell.textContent = v || "";
        cell.dataset.v = v;
      }
    }
    scoreEl.textContent = score;
    msgEl.textContent = won ? "🎉 you made 2048!" : over ? "game over!" : "";
  }

  // slide one row's numbers left and merge equal neighbours.
  // returns [newRow, pointsGained]
  function slide(row) {
    let arr = row.filter((v) => v);
    let gained = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gained += arr[i];
        if (arr[i] === 2048) won = true;
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < SIZE) arr.push(0);
    return [arr, gained];
  }

  const transpose = (g) => g[0].map((_, c) => g.map((row) => row[c]));

  function move(dir) {
    if (over) return;
    let g = grid.map((r) => r.slice());
    const transposed = dir === "up" || dir === "down";
    const reversed = dir === "right" || dir === "down";
    if (transposed) g = transpose(g);
    if (reversed) g = g.map((r) => r.reverse());

    let moved = false;
    let gained = 0;
    g = g.map((row) => {
      const [nr, gg] = slide(row);
      if (nr.join() !== row.join()) moved = true;
      gained += gg;
      return nr;
    });

    if (reversed) g = g.map((r) => r.reverse());
    if (transposed) g = transpose(g);

    if (moved) {
      grid = g;
      score += gained;
      addRandom();
      if (isOver()) over = true;
      render();
    }
  }

  function isOver() {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
      }
    return true;
  }

  const keymap = {
    ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
    a: "left", d: "right", w: "up", s: "down",
  };

  function onKey(e) {
    // self-clean: once this game's window is closed, stop listening
    if (!root.isConnected) {
      document.removeEventListener("keydown", onKey);
      return;
    }
    // don't hijack typing in text fields (e.g. the notes app)
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    const dir = keymap[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  }
  document.addEventListener("keydown", onKey);

  // touch: swipe the board to move (mobile)
  let startX = 0;
  let startY = 0;
  boardEl.addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    },
    { passive: true }
  );
  boardEl.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // ignore taps
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
      else move(dy > 0 ? "down" : "up");
    },
    { passive: true }
  );

  root.querySelector(".g2048-new").addEventListener("click", reset);
  reset();
  return root;
}
