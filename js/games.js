/* Логика игр: Змейка, 2048, крестики-нолики, угадай число, память */
"use strict";
const best = (k, v) => { // рекорды
  if (v === undefined) return +localStorage.getItem("dv_best_" + k) || 0;
  localStorage.setItem("dv_best_" + k, v);
};

/* ================= ЗМЕЙКА ================= */
(function snake() {
  const cv = document.getElementById("snakeCanvas"); if (!cv) return;
  const ctx = cv.getContext("2d");
  const N = 20, CELL = cv.width / N;
  let snake, dir, nextDir, food, score, speed, timer = null, paused = false, alive = false;

  document.getElementById("snakeBest").textContent = best("snake");

  function place() {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }
  function reset() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; nextDir = dir; score = 0; speed = 130; alive = true; paused = false;
    place(); updateScore(); clearInterval(timer); loop();
    document.getElementById("snakeScore").textContent = 0;
  }
  function updateScore() {
    document.getElementById("snakeScore").textContent = score;
    const b = best("snake");
    if (score > b) { best("snake", score); document.getElementById("snakeBest").textContent = score; }
    if (score >= 5) unlockAchievement("snake");
  }
  function loop() {
    clearInterval(timer);
    timer = setInterval(tick, speed);
  }
  function tick() {
    if (paused || !alive) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(s => s.x === head.x && s.y === head.y)) {
      alive = false; clearInterval(timer);
      draw();
      ctx.fillStyle = "rgba(4,7,16,.72)"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#f87171"; ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Игра окончена!", cv.width / 2, cv.height / 2 - 12);
      ctx.fillStyle = "#e8ecf4"; ctx.font = "15px sans-serif";
      ctx.fillText(`Очки: ${score} · Нажмите «Старт»`, cv.width / 2, cv.height / 2 + 18);
      if (score > 0) toast(`Змейка закончилась на ${score} очках 🐍`, "info");
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score += 10; updateScore(); place(); if (speed > 60) { speed -= 3; loop(); } }
    else snake.pop();
    draw();
  }
  function draw() {
    const light = document.documentElement.dataset.theme === "light";
    ctx.fillStyle = light ? "#e9edf7" : "#10162a";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.05)";
    for (let i = 1; i < N; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, cv.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(cv.width, i * CELL); ctx.stroke();
    }
    // еда
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2.6, 0, 7); ctx.fill();
    // змейка
    snake.forEach((s, i) => {
      const t = i / snake.length;
      ctx.fillStyle = i === 0 ? "#06b6d4" : `rgba(124,58,237,${1 - t * .55})`;
      const r = 4;
      ctx.beginPath(); ctx.roundRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, r); ctx.fill();
    });
  }
  const keymap = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], ц: [0, -1], ы: [0, 1], ф: [-1, 0], в: [1, 0] };
  addEventListener("keydown", e => {
    if (!alive || paused) return;
    const k = keymap[e.key] || keymap[e.key.toLowerCase?.()];
    if (!k) return;
    e.preventDefault();
    if (k[0] === -dir.x && k[1] === -dir.y) return; // нельзя разворот на 180°
    nextDir = { x: k[0], y: k[1] };
  });
  // свайпы
  let tx, ty;
  cv.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    let k;
    if (Math.abs(dx) > Math.abs(dy)) k = dx > 0 ? [1, 0] : [-1, 0];
    else k = dy > 0 ? [0, 1] : [0, -1];
    if (!alive || paused) return;
    if (k[0] === -dir.x && k[1] === -dir.y) return;
    nextDir = { x: k[0], y: k[1] };
  }, { passive: true });

  document.getElementById("snakeStart").addEventListener("click", () => { reset(); toast("Поехали! 🐍", "info", 1500); });
  document.getElementById("snakePause").addEventListener("click", e => {
    paused = !paused;
    e.target.textContent = paused ? "▶ Продолжить" : "⏸ Пауза";
  });
  // превью
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  food = { x: 15, y: 10 }; score = 0; alive = false;
  draw();
})();

/* ================= 2048 ================= */
(function g2048() {
  const boardEl = document.getElementById("board2048"); if (!boardEl) return;
  let grid, score, over = false;
  document.getElementById("g2048Best").textContent = best("g2048");

  function init() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0; over = false;
    document.getElementById("over2048").style.display = "none";
    addTile(); addTile(); render();
    document.getElementById("g2048Score").textContent = 0;
  }
  function addTile() {
    const empty = [];
    grid.forEach((r, y) => r.forEach((v, x) => { if (!v) empty.push([x, y]); }));
    if (!empty.length) return;
    const [x, y] = empty[Math.floor(Math.random() * empty.length)];
    grid[y][x] = Math.random() < .9 ? 2 : 4;
  }
  function render() {
    boardEl.innerHTML = "";
    let maxTile = 0;
    grid.forEach(r => r.forEach(v => {
      maxTile = Math.max(maxTile, v);
      const c = document.createElement("div");
      c.className = "cell-2048" + (v ? " t-" + v : "");
      c.textContent = v || "";
      boardEl.appendChild(c);
    }));
    document.getElementById("g2048Score").textContent = score;
    if (score > best("g2048")) { best("g2048", score); document.getElementById("g2048Best").textContent = score; }
    if (maxTile >= 128) unlockAchievement("g2048");
  }
  function slide(row) {
    let a = row.filter(v => v);
    let gained = 0;
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] === a[i + 1]) { a[i] *= 2; gained += a[i]; a.splice(i + 1, 1); }
    }
    while (a.length < 4) a.push(0);
    return [a, gained];
  }
  function move(dirX, dirY) {
    if (over) return;
    const old = JSON.stringify(grid);
    let gained = 0;
    if (dirX) { // влево/вправо
      for (let y = 0; y < 4; y++) {
        const row = grid[y].map(v => v);
        const rev = dirX > 0;
        let a = rev ? row.reverse() : row;
        let res = slide(a);
        gained += res[1];
        grid[y] = rev ? res[0].reverse() : res[0];
      }
    } else {
      for (let x = 0; x < 4; x++) {
        let col = [grid[0][x], grid[1][x], grid[2][x], grid[3][x]];
        const rev = dirY > 0;
        let a = rev ? col.reverse() : col;
        let res = slide(a);
        gained += res[1];
        col = rev ? res[0].reverse() : res[0];
        for (let y = 0; y < 4; y++) grid[y][x] = col[y];
      }
    }
    if (JSON.stringify(grid) === old) return;
    score += gained;
    addTile(); render();
    if (gained > 0) toast(`+${gained} очков!`, "success", 1200);
    if (isGameOver()) { over = true; document.getElementById("over2048").style.display = "grid"; }
  }
  function isGameOver() {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      if (!grid[y][x]) return false;
      if (x < 3 && grid[y][x] === grid[y][x + 1]) return false;
      if (y < 3 && grid[y][x] === grid[y + 1][x]) return false;
    }
    return true;
  }
  addEventListener("keydown", e => {
    const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (map[e.key]) { e.preventDefault(); move(...map[e.key]); }
  });
  let tx, ty;
  boardEl.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  boardEl.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0); else move(0, dy > 0 ? 1 : -1);
  }, { passive: true });
  document.getElementById("retry2048").addEventListener("click", init);
  init();
})();

/* ================= КРЕСТИКИ-НОЛИКИ ================= */
(function ttt() {
  const boardEl = document.getElementById("tttBoard"); if (!boardEl) return;
  let cells, turn, finished;
  const stats = JSON.parse(localStorage.getItem("dv_ttt") || '{"w":0,"d":0,"l":0}');
  const updStats = () => {
    document.getElementById("tttWin").textContent = stats.w;
    document.getElementById("tttDraw").textContent = stats.d;
    document.getElementById("tttLose").textContent = stats.l;
    localStorage.setItem("dv_ttt", JSON.stringify(stats));
  };
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = b => {
    for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { p: b[a], line: [a, c, d] };
    return b.every(v => v) ? { p: "draw" } : null;
  };
  // минимакс (ИИ — «O»)
  function minimax(b, isMax, depth) {
    const w = winner(b);
    if (w) return w.p === "O" ? 10 - depth : w.p === "X" ? depth - 10 : 0;
    let bestV = isMax ? -99 : 99;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = isMax ? "O" : "X";
      const v = minimax(b, !isMax, depth + 1);
      b[i] = null;
      bestV = isMax ? Math.max(bestV, v) : Math.min(bestV, v);
    }
    return bestV;
  }
  function aiMove() {
    let bestV = -99, move = -1;
    for (let i = 0; i < 9; i++) {
      if (cells[i]) continue;
      cells[i] = "O";
      const v = minimax(cells, false, 0);
      cells[i] = null;
      if (v > bestV) { bestV = v; move = i; }
    }
    if (move >= 0) cells[move] = "O";
  }
  function render(winLine) {
    boardEl.innerHTML = "";
    cells.forEach((v, i) => {
      const b = document.createElement("button");
      b.className = "ttt-cell" + (v === "O" ? " o" : "") + (winLine?.includes(i) ? " win" : "");
      b.textContent = v || "";
      b.addEventListener("click", () => playerMove(i));
      boardEl.appendChild(b);
    });
  }
  function playerMove(i) {
    if (cells[i] || finished || turn !== "X") return;
    cells[i] = "X";
    let w = winner(cells);
    if (!w) { turn = "O"; aiMove(); w = winner(cells); }
    render(w?.line);
    const status = document.getElementById("tttStatus");
    if (w) {
      finished = true;
      if (w.p === "X") { stats.w++; status.textContent = "Вы победили! 🎉"; unlockAchievement("ttt"); confetti && confetti(); toast("Победа над ИИ! 🏆", "success"); }
      else if (w.p === "O") { stats.l++; status.textContent = "ИИ победил 🤖"; }
      else { stats.d++; status.textContent = "Ничья 🤝"; }
      updStats();
    } else status.textContent = turn === "X" ? "Ваш ход — X" : "Ход ИИ…";
    if (!finished && turn === "O") { turn = "X"; status.textContent = "Ваш ход — X"; }
    else if (!finished) status.textContent = "Ваш ход — X";
  }
  document.getElementById("tttReset").addEventListener("click", () => {
    stats.w = stats.d = stats.l = 0; updStats(); newGame();
  });
  function newGame() {
    cells = Array(9).fill(null); turn = "X"; finished = false;
    document.getElementById("tttStatus").textContent = "Ваш ход — X";
    render();
  }
  updStats(); newGame();
})();

/* ================= УГАДАЙ ЧИСЛО ================= */
(function guess() {
  const input = document.getElementById("guessInput"); if (!input) return;
  let secret, attempts;
  const b = best("guess"); if (b) document.getElementById("guessBest").textContent = b;
  function newRound() { secret = 1 + Math.floor(Math.random() * 100); attempts = 0; }
  function check() {
    const v = +input.value;
    if (!v || v < 1 || v > 100) { toast("Введите число от 1 до 100!", "warning"); return; }
    attempts++;
    const hint = document.getElementById("guessHint");
    if (v === secret) {
      hint.innerHTML = `🎉 Верно! Это было <b>${secret}</b>. Попыток: <b>${attempts}</b>`;
      toast(`Угадано за ${attempts} попыток! 🎯`, "success");
      if (!best("guess") || attempts < best("guess")) { best("guess", attempts); document.getElementById("guessBest").textContent = attempts; }
      newRound(); input.value = "";
    } else {
      const diff = Math.abs(v - secret);
      hint.innerHTML = v < secret ? "⬆️ Больше! Ещё раз." : "⬇️ Меньше! Ещё раз.";
      if (diff <= 5) hint.innerHTML += " <b>(Совсем близко! 🔥)</b>";
      else if (diff <= 12) hint.innerHTML += " <b>(Тепло)</b>";
      else hint.innerHTML += " <i>(Холодно ❄️)</i>";
    }
    document.getElementById("guessLog").innerHTML = `Попыток: ${attempts} · Рекорд: <span id="guessBest">${best("guess") || "—"}</span>`;
    input.select();
  }
  document.getElementById("guessBtn").addEventListener("click", check);
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  newRound();
})();

/* ================= ПАМЯТЬ ================= */
(function memory() {
  const gridEl = document.getElementById("memGrid"); if (!gridEl) return;
  const EMOJI = ["🚀", "🎧", "🦊", "🍩", "🌵", "⚽", "🎲", "🌙"];
  let cards = [], flipped = [], moves = 0, matched = 0, t0 = null, timer = null;
  const b = best("memory"); if (b) document.getElementById("memBest").textContent = b + " ходов";

  function start() {
    cards = [...EMOJI, ...EMOJI].sort(() => Math.random() - .5);
    flipped = []; moves = 0; matched = 0; t0 = null;
    clearInterval(timer);
    document.getElementById("memMoves").textContent = 0;
    document.getElementById("memTime").textContent = 0;
    gridEl.innerHTML = "";
    cards.forEach((emoji, i) => {
      const c = document.createElement("div");
      c.className = "mem-card";
      c.dataset.emoji = emoji;
      c.addEventListener("click", () => flip(c));
      gridEl.appendChild(c);
    });
  }
  function tick() {
    if (!t0) return;
    document.getElementById("memTime").textContent = Math.floor((Date.now() - t0) / 1000);
  }
  function flip(card) {
    if (!t0) { t0 = Date.now(); timer = setInterval(tick, 500); }
    if (card.classList.contains("flipped") || card.classList.contains("matched") || flipped.length >= 2) return;
    card.classList.add("flipped");
    card.textContent = card.dataset.emoji;
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      document.getElementById("memMoves").textContent = moves;
      const [a, b2] = flipped;
      if (a.dataset.emoji === b2.dataset.emoji) {
        setTimeout(() => {
          a.classList.add("matched"); b2.classList.add("matched");
          a.classList.remove("flipped"); b2.classList.remove("flipped");
          matched++;
          flipped = [];
          if (matched === 8) win();
        }, 350);
      } else {
        setTimeout(() => {
          a.classList.remove("flipped"); b2.classList.remove("flipped");
          a.textContent = ""; b2.textContent = "";
          flipped = [];
        }, 750);
      }
    }
  }
  function win() {
    clearInterval(timer);
    const secs = Math.floor((Date.now() - t0) / 1000);
    unlockAchievement("memory");
    const old = best("memory");
    if (!old || moves < old) { best("memory", moves); document.getElementById("memBest").textContent = moves + " ходов"; }
    confetti();
    openModal(`<div class="modal-head"><h3>🎉 Победа!</h3><button class="icon-btn" data-close>✕</button></div>
      <p>Все пары найдены за <b>${moves} ходов</b> и <b>${secs} секунд</b>.</p>
      <p class="muted mt-16">${(!old || moves < old) ? "Это ваш новый рекорд! 🏅" : `Рекорд: ${old} ходов.`}</p>
      <button class="btn btn-primary btn-block mt-16" onclick="closeModal()" id="memAgain">Играть снова</button>`);
    document.getElementById("memAgain")?.addEventListener("click", () => { closeModal(); start(); });
  }
  document.getElementById("memRestart").addEventListener("click", start);
  start();
})();

/* конфетти для игр (если components.js не подключён) */
if (typeof window.confetti !== "function") {
  window.confetti = function () {
    const colors = ["#7c3aed", "#06b6d4", "#f472b6", "#22c55e", "#f59e0b"];
    for (let k = 0; k < 50; k++) {
      const c = document.createElement("div");
      const s = 5 + Math.random() * 7;
      Object.assign(c.style, {
        position: "fixed", zIndex: 1100, pointerEvents: "none",
        left: Math.random() * 100 + "vw", top: "-14px", width: s + "px", height: s * .6 + "px",
        background: colors[k % colors.length], borderRadius: "2px",
        transform: `rotate(${Math.random() * 360}deg)`,
        transition: `top ${1.3 + Math.random()}s ease-in, left .6s ease-out, opacity 1.7s`
      });
      document.body.appendChild(c);
      requestAnimationFrame(() => { c.style.top = 105 + "vh"; c.style.opacity = 0; });
      setTimeout(() => c.remove(), 2500);
    }
  };
}
