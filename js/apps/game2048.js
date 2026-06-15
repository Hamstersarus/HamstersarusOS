// HamstersarusOS — 2048 (advanced app), purple themed.
//
// Structured to mirror my Java 2048:
//   - Grid      — owns the 4x4 board (Grid.java)
//   - GamePanel — controller + renderer; Swing's paintComponent becomes a DOM
//                 render(), and KeyListener becomes keydown + touch handlers
// buildGame2048() returns the window's DOM node (used by js/windows.js).

const SIZE = 4;

// Mirrors Grid.java — encapsulates the 4x4 board.
class Grid {
  constructor() {
    this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  getGrid() {
    return this.grid;
  }

  addNumToGrid(row, col, num) {
    this.grid[row][col] = num;
  }

  addRandomNum() {
    const ranNum = Math.random() < 0.5 ? 2 : 4;
    let row, col;
    do {
      row = Math.floor(Math.random() * SIZE);
      col = Math.floor(Math.random() * SIZE);
    } while (this.grid[row][col] !== 0);
    this.grid[row][col] = ranNum;
  }

  numNumInGrid() {
    let count = 0;
    for (let row = 0; row < SIZE; row++)
      for (let col = 0; col < SIZE; col++)
        if (this.grid[row][col] !== 0) count++;
    return count;
  }
}

// Mirrors GamePanel.java — the game controller and (DOM) renderer.
class GamePanel {
  constructor() {
    this.grid = null;
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.keepPlaying = false;

    this.root = this.buildDom(); // replaces the Swing JPanel setup
    this.bindInput(); // replaces addKeyListener(this)
    this.newGame();
  }

  // Build the DOM the game lives in (and cache element references).
  buildDom() {
    const root = document.createElement("div");
    root.className = "g2048";
    root.innerHTML =
      '<div class="g2048-top">' +
        '<span class="g2048-score">score <b>0</b></span>' +
        '<button class="g2048-new">new game</button>' +
      "</div>" +
      '<div class="g2048-board"></div>' +
      '<p class="g2048-msg"></p>' +
      '<p class="g2048-hint">arrow keys / WASD or swipe · R to restart</p>';

    this.boardEl = root.querySelector(".g2048-board");
    this.scoreEl = root.querySelector(".g2048-score b");
    this.msgEl = root.querySelector(".g2048-msg");

    this.cells = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
      const cell = document.createElement("div");
      cell.className = "g2048-cell";
      this.boardEl.appendChild(cell);
      this.cells.push(cell);
    }

    root.querySelector(".g2048-new").addEventListener("click", () => this.newGame());
    return root;
  }

  newGame() {
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.keepPlaying = false;
    this.grid = new Grid();
    this.grid.addRandomNum();
    this.grid.addRandomNum();
    this.render();
  }

  // Replaces paintComponent — paint the board into the DOM.
  render() {
    const cells = this.grid.getGrid();
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const val = cells[row][col];
        const cell = this.cells[row * SIZE + col];
        cell.textContent = val || "";
        cell.dataset.v = val;
      }
    }
    this.scoreEl.textContent = this.score;
    this.msgEl.textContent = this.gameOver
      ? "game over!"
      : this.won && !this.keepPlaying
      ? "🎉 you win! keep going →"
      : "";
  }

  // Keyboard (desktop) + swipe (mobile), routed through handleMove().
  bindInput() {
    const keymap = {
      ArrowUp: "w", ArrowDown: "s", ArrowLeft: "a", ArrowRight: "d",
      w: "w", a: "a", s: "s", d: "d", r: "r",
    };
    const onKey = (e) => {
      // self-clean once this game's window is closed
      if (!this.root.isConnected) {
        document.removeEventListener("keydown", onKey);
        return;
      }
      // don't hijack typing in text fields (e.g. the message app)
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = keymap[e.key];
      if (!key) return;
      e.preventDefault();
      if (key === "r") {
        this.newGame();
        return;
      }
      this.handleMove({ w: "up", s: "down", a: "left", d: "right" }[key]);
    };
    document.addEventListener("keydown", onKey);

    // touch swipe
    let startX = 0;
    let startY = 0;
    this.boardEl.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );
    this.boardEl.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        if (Math.abs(dx) > Math.abs(dy)) this.handleMove(dx > 0 ? "right" : "left");
        else this.handleMove(dy > 0 ? "down" : "up");
      },
      { passive: true }
    );
  }

  // Mirrors the move-handling half of GamePanel.keyPressed.
  handleMove(dir) {
    if (this.gameOver) return;
    if (this.won && !this.keepPlaying) {
      this.keepPlaying = true;
      this.render();
      return;
    }

    const before = this.copyGrid(this.grid.getGrid());

    if (dir === "up") this.moveUp();
    else if (dir === "down") this.moveDown();
    else if (dir === "left") this.moveLeft();
    else if (dir === "right") this.moveRight();
    else return;

    if (this.gridChanged(before, this.grid.getGrid())) this.grid.addRandomNum();
    if (!this.won && this.hasWon()) this.won = true;
    if (this.isGameOver()) this.gameOver = true;
    this.render();
  }

  copyGrid(g) {
    return g.map((row) => row.slice());
  }

  gridChanged(before, after) {
    for (let row = 0; row < SIZE; row++)
      for (let col = 0; col < SIZE; col++)
        if (before[row][col] !== after[row][col]) return true;
    return false;
  }

  hasWon() {
    const g = this.grid.getGrid();
    for (let row = 0; row < SIZE; row++)
      for (let col = 0; col < SIZE; col++)
        if (g[row][col] === 2048) return true;
    return false;
  }

  isGameOver() {
    const g = this.grid.getGrid();
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (g[row][col] === 0) return false;
        if (row < 3 && g[row][col] === g[row + 1][col]) return false;
        if (col < 3 && g[row][col] === g[row][col + 1]) return false;
      }
    }
    return true;
  }

  // --- the four move methods, mirrored from the Java (compact → merge → compact) ---

  moveUp() {
    const g = this.grid.getGrid();
    for (let col = 0; col < SIZE; col++) {
      const val = [0, 0, 0, 0];
      let index = 0;
      for (let row = 0; row < SIZE; row++) if (g[row][col] !== 0) val[index++] = g[row][col];
      for (let i = 0; i < 3; i++) {
        if (val[i] !== 0 && val[i] === val[i + 1]) {
          val[i] *= 2;
          this.score += val[i];
          val[i + 1] = 0;
          i++;
        }
      }
      const result = [0, 0, 0, 0];
      index = 0;
      for (let i = 0; i < SIZE; i++) if (val[i] !== 0) result[index++] = val[i];
      for (let row = 0; row < SIZE; row++) g[row][col] = result[row];
    }
  }

  moveDown() {
    const g = this.grid.getGrid();
    for (let col = 0; col < SIZE; col++) {
      const val = [0, 0, 0, 0];
      let index = 0;
      for (let row = SIZE - 1; row >= 0; row--) if (g[row][col] !== 0) val[index++] = g[row][col];
      for (let i = 0; i < 3; i++) {
        if (val[i] !== 0 && val[i] === val[i + 1]) {
          val[i] *= 2;
          this.score += val[i];
          val[i + 1] = 0;
          i++;
        }
      }
      const result = [0, 0, 0, 0];
      index = 0;
      for (let i = 0; i < SIZE; i++) if (val[i] !== 0) result[index++] = val[i];
      for (let row = SIZE - 1; row >= 0; row--) g[row][col] = result[SIZE - 1 - row];
    }
  }

  moveLeft() {
    const g = this.grid.getGrid();
    for (let row = 0; row < SIZE; row++) {
      const val = [0, 0, 0, 0];
      let index = 0;
      for (let col = 0; col < SIZE; col++) if (g[row][col] !== 0) val[index++] = g[row][col];
      for (let i = 0; i < 3; i++) {
        if (val[i] !== 0 && val[i] === val[i + 1]) {
          val[i] *= 2;
          this.score += val[i];
          val[i + 1] = 0;
          i++;
        }
      }
      const result = [0, 0, 0, 0];
      index = 0;
      for (let i = 0; i < SIZE; i++) if (val[i] !== 0) result[index++] = val[i];
      for (let col = 0; col < SIZE; col++) g[row][col] = result[col];
    }
  }

  moveRight() {
    const g = this.grid.getGrid();
    for (let row = 0; row < SIZE; row++) {
      const val = [0, 0, 0, 0];
      let index = 0;
      for (let col = SIZE - 1; col >= 0; col--) if (g[row][col] !== 0) val[index++] = g[row][col];
      for (let i = 0; i < 3; i++) {
        if (val[i] !== 0 && val[i] === val[i + 1]) {
          val[i] *= 2;
          this.score += val[i];
          val[i + 1] = 0;
          i++;
        }
      }
      const result = [0, 0, 0, 0];
      index = 0;
      for (let i = 0; i < SIZE; i++) if (val[i] !== 0) result[index++] = val[i];
      for (let col = SIZE - 1; col >= 0; col--) g[row][col] = result[SIZE - 1 - col];
    }
  }
}

// Entry point used by the window manager.
function buildGame2048() {
  return new GamePanel().root;
}
