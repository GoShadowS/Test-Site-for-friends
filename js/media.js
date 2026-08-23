/* Медиа: пианино, драм-машина, визуализатор, canvas-демо — Web Audio API */
"use strict";

/* ---------- AudioContext (общий) ---------- */
let AC = null;
const getAC = () => {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === "suspended") AC.resume();
  return AC;
};
const midiToFreq = m => 440 * Math.pow(2, (m - 69) / 12);

function playNote(freq, dur = 0.8, vol = 0.5, type = "triangle") {
  const ac = getAC();
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g); g.connect(ac.destination);
  const t = ac.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + .05);
}

document.addEventListener("DOMContentLoaded", () => {

  /* ================= ПИАНИНО ================= */
  (function piano() {
    const wrap = document.getElementById("piano"); if (!wrap) return;
    const KEYS = [
      { n: "C4", m: 60, b: 0, kb: "a" }, { n: "C#4", m: 61, b: 1, kb: "w" },
      { n: "D4", m: 62, b: 0, kb: "s" }, { n: "D#4", m: 63, b: 1, kb: "e" },
      { n: "E4", m: 64, b: 0, kb: "d" },
      { n: "F4", m: 65, b: 0, kb: "f" }, { n: "F#4", m: 66, b: 1, kb: "t" },
      { n: "G4", m: 67, b: 0, kb: "g" }, { n: "G#4", m: 68, b: 1, kb: "y" },
      { n: "A4", m: 69, b: 0, kb: "h" }, { n: "A#4", m: 70, b: 1, kb: "u" },
      { n: "B4", m: 71, b: 0, kb: "j" },
      { n: "C5", m: 72, b: 0, kb: "k" }, { n: "C#5", m: 73, b: 1, kb: "o" },
      { n: "D5", m: 74, b: 0, kb: "l" }, { n: "D#5", m: 75, b: 1, kb: "p" },
      { n: "E5", m: 76, b: 0, kb: ";" }
    ];
    const keyEls = {};
    KEYS.forEach(k => {
      const el = document.createElement("div");
      el.className = "pkey" + (k.b ? " black" : "");
      el.innerHTML = `<span>${k.n}<br><small>${k.kb.toUpperCase()}</small></span>`;
      el.addEventListener("pointerdown", ev => { ev.preventDefault(); hit(k, el); });
      wrap.appendChild(el);
      keyEls[k.kb] = { k, el };
    });
    function hit(k, el) {
      const vol = +document.getElementById("pianoVol").value / 100;
      playNote(midiToFreq(k.m), 0.9, vol * 0.6, "triangle");
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 180);
      unlockAchievement("piano");
    }
    const down = new Set();
    addEventListener("keydown", e => {
      if (e.repeat || document.activeElement?.tagName === "INPUT") return;
      const rec = keyEls[e.key.toLowerCase()];
      if (rec && !down.has(e.key)) { down.add(e.key); hit(rec.k, rec.el); }
    });
    addEventListener("keyup", e => down.delete(e.key));
    document.getElementById("pianoVol").addEventListener("input", e =>
      document.getElementById("volOut").textContent = e.target.value);
  })();

  /* ================= ДРАМ-МАШИНА ================= */
  (function drums() {
    const grid = document.getElementById("seqGrid"); if (!grid) return;
    const ROWS = [
      { name: "🦶 Бочка", key: "kick" },
      { name: "👏 Снейр", key: "snare" },
      { name: "🎩 Хэт", key: "hat" }
    ];
    const STEPS = 8;
    const pattern = { kick: Array(8).fill(0), snare: Array(8).fill(0), hat: Array(8).fill(0) };
    const cells = {};

    ROWS.forEach(r => {
      const label = document.createElement("div");
      label.textContent = r.name;
      label.style.cssText = "display:flex; align-items:center; font-size:.85rem; color:var(--muted)";
      grid.appendChild(label);
      cells[r.key] = [];
      for (let s = 0; s < STEPS; s++) {
        const c = document.createElement("div");
        c.className = "seq-cell";
        if (s % 4 === 0) c.style.borderColor = "var(--accent)";
        c.addEventListener("click", () => {
          pattern[r.key][s] = pattern[r.key][s] ? 0 : 1;
          c.classList.toggle("on", !!pattern[r.key][s]);
          if (pattern[r.key][s]) hitSound(r.key, 0.5);
        });
        grid.appendChild(c);
        cells[r.key].push(c);
      }
    });
    // стартовый бит
    [0, 4].forEach(i => { pattern.kick[i] = 1; cells.kick[i].classList.add("on"); });
    [2, 6].forEach(i => { pattern.snare[i] = 1; cells.snare[i].classList.add("on"); });
    for (let i = 0; i < 8; i += 2) { pattern.hat[i] = 1; cells.hat[i].classList.add("on"); }

    function noiseBuffer(ac) {
      const b = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return b;
    }
    function hitSound(kind, vol = 1) {
      const ac = getAC(), t = ac.currentTime;
      if (kind === "kick") {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(40, t + .12);
        g.gain.setValueAtTime(.7 * vol, t);
        g.gain.exponentialRampToValueAtTime(.001, t + .18);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .2);
      } else {
        const src = ac.createBufferSource(); src.buffer = noiseBuffer(ac);
        const f = ac.createBiquadFilter(), g = ac.createGain();
        if (kind === "snare") {
          f.type = "bandpass"; f.frequency.value = 1800;
          g.gain.setValueAtTime(.5 * vol, t);
          g.gain.exponentialRampToValueAtTime(.001, t + .16);
        } else {
          f.type = "highpass"; f.frequency.value = 7000;
          g.gain.setValueAtTime(.25 * vol, t);
          g.gain.exponentialRampToValueAtTime(.001, t + .05);
        }
        src.connect(f); f.connect(g); g.connect(ac.destination);
        src.start(t); src.stop(t + .2);
      }
    }

    let timer = null, step = 0;
    function loop() {
      ROWS.forEach(r => { if (pattern[r.key][step]) hitSound(r.key); });
      cells[ROWS[0].key].forEach((c, i) => c.classList.toggle("playing", i === step));
      step = (step + 1) % STEPS;
    }
    document.getElementById("seqPlay").addEventListener("click", e => {
      if (timer) {
        clearInterval(timer); timer = null; e.target.textContent = "▶ Играть";
        Object.values(cells).forEach(arr => arr.forEach(c => c.classList.remove("playing")));
      } else {
        getAC(); step = 0; loop();
        timer = setInterval(loop, 60000 / +document.getElementById("seqBpm").value / 2);
        e.target.textContent = "⏸ Стоп";
      }
    });
    document.getElementById("seqBpm").addEventListener("input", e => {
      document.getElementById("bpmOut").textContent = e.target.value;
      if (timer) { clearInterval(timer); timer = setInterval(loop, 60000 / e.target.value / 2); }
    });
    document.getElementById("seqClear").addEventListener("click", () => {
      Object.keys(pattern).forEach(k => { pattern[k].fill(0); cells[k].forEach(c => c.classList.remove("on")); });
    });
    document.getElementById("seqRandom").addEventListener("click", () => {
      const rnd = (p) => Array.from({ length: 8 }, () => Math.random() < p ? 1 : 0);
      pattern.kick = rnd(.35); pattern.snare = rnd(.25); pattern.hat = rnd(.5);
      ROWS.forEach(r => r && cells[r.key].forEach((c, i) => c.classList.toggle("on", !!pattern[r.key][i])));
      toast("Случайный бит готов 🎲", "info", 1500);
    });
  })();

  /* ================= ВИЗУАЛИЗАТОР ================= */
  (function vis() {
    const cv = document.getElementById("visCanvas"); if (!cv) return;
    const ctx = cv.getContext("2d");
    let analyser = null, srcNode = null, raf = null, melodyTimer = null;

    function draw() {
      raf = requestAnimationFrame(draw);
      const light = document.documentElement.dataset.theme === "light";
      ctx.fillStyle = light ? "rgba(243,245,251,.35)" : "rgba(10,14,26,.35)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      if (!analyser) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const bars = 48, step = Math.floor(data.length / bars);
      for (let i = 0; i < bars; i++) {
        const v = data[i * step] / 255;
        const h = v * cv.height * .9;
        const grad = ctx.createLinearGradient(0, cv.height - h, 0, cv.height);
        grad.addColorStop(0, "#06b6d4"); grad.addColorStop(1, "#7c3aed");
        ctx.fillStyle = grad;
        ctx.fillRect(i * (cv.width / bars) + 2, cv.height - h, cv.width / bars - 4, h);
      }
    }
    function attach(node) {
      const ac = getAC();
      stopAll();
      analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      node.connect(analyser);
      srcNode = node;
      if (!raf) draw();
    }
    function stopAll() {
      if (melodyTimer) { clearInterval(melodyTimer); melodyTimer = null; }
      if (srcNode) { try { srcNode.disconnect(); } catch {} srcNode = null; }
      analyser = null;
      cancelAnimationFrame(raf); raf = null;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }

    document.getElementById("melodyBtn").addEventListener("click", () => {
      const ac = getAC();
      const master = ac.createGain();
      master.gain.value = .35;
      master.connect(ac.destination);
      attach(master);
      // простая мелодия (нота, длительность)
      const MELODY = [[60,.4],[64,.4],[67,.4],[72,.6],[71,.2],[67,.4],[69,.4],[64,.8],[62,.4],[67,.4],[72,.8],[0,.4],[60,.4],[64,.4],[67,.4],[76,1]];
      let i = 0;
      const play = () => {
        const [m, d] = MELODY[i % MELODY.length];
        if (m) {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = "sine"; o.frequency.value = midiToFreq(m);
          o.connect(g); g.connect(master);
          const t = ac.currentTime;
          g.gain.setValueAtTime(.4, t);
          g.gain.exponentialRampToValueAtTime(.001, t + d);
          o.start(t); o.stop(t + d + .05);
        }
        i++;
      };
      play();
      melodyTimer = setInterval(play, 400);
      toast("Играет демо-мелодия 🎵", "info", 2000);
    });

    document.getElementById("micBtn").addEventListener("click", async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ac = getAC();
        const src = ac.createMediaStreamSource(stream);
        const silent = ac.createGain(); silent.gain.value = 0; // не выводим в колонки
        silent.connect(ac.destination);
        src.connect(silent);
        attach(src);
        window._micStream = stream;
        toast("Микрофон подключен — говорите! 🎤", "success");
      } catch {
        toast("Не удалось получить доступ к микрофону 😔", "error");
      }
    });

    document.getElementById("stopVisBtn").addEventListener("click", () => {
      stopAll();
      if (window._micStream) { window._micStream.getTracks().forEach(t => t.stop()); window._micStream = null; }
      toast("Остановлено", "info", 1400);
    });
  })();

  /* ================= CANVAS-ДЕМО ================= */
  (function canvases() {
    const cv = document.getElementById("demoCanvas"); if (!cv) return;
    const ctx = cv.getContext("2d");
    let mode = "stars", raf = null, mouse = { x: -999, y: -999 };
    const HINTS = {
      stars: "🌌 Двигайте мышью — звёзды чуть реагируют на курсор.",
      fractal: "🌳 Фрактал-дерево. Перезапуск даёт новые углы и глубину.",
      life: "🦠 Игра «Жизнь» Конвея: клетки рождаются и умирают по правилам.",
      bubbles: "🫧 Пузыри всплывают. Кликните — лопнете ближайший."
    };
    cv.addEventListener("mousemove", e => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * cv.width / r.width;
      mouse.y = (e.clientY - r.top) * cv.height / r.height;
    });
    cv.addEventListener("touchmove", e => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.touches[0].clientX - r.left) * cv.width / r.width;
      mouse.y = (e.touches[0].clientY - r.top) * cv.height / r.height;
    }, { passive: true });

    function stop() { cancelAnimationFrame(raf); raf = null; }

    /* --- звёзды --- */
    function stars() {
      const pts = Array.from({ length: 160 }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        z: Math.random() * cv.width
      }));
      ctx.fillStyle = "#05070f"; ctx.fillRect(0, 0, cv.width, cv.height);
      (function frame() {
        raf = requestAnimationFrame(frame);
        ctx.fillStyle = "rgba(5,7,15,.4)"; ctx.fillRect(0, 0, cv.width, cv.height);
        pts.forEach(p => {
          p.z -= 1.6;
          if (p.z < 1) { p.z = cv.width; p.x = Math.random() * cv.width; p.y = Math.random() * cv.height; }
          const k = 128 / p.z;
          const px = p.x + (mouse.x - cv.width / 2) * k * .4;
          const py = p.y + (mouse.y - cv.height / 2) * k * .4;
          const size = (1 - p.z / cv.width) * 3.2;
          ctx.fillStyle = `rgba(${180 + Math.random() * 75}, ${190 + Math.random() * 60}, 255, ${1 - p.z / cv.width})`;
          ctx.beginPath(); ctx.arc(px, py, Math.max(.3, size), 0, 7); ctx.fill();
        });
      })();
    }

    /* --- фрактал --- */
    function fractal() {
      const a1 = 0.3 + Math.random() * 0.35, a2 = 0.3 + Math.random() * 0.35;
      const depth = 9 + Math.floor(Math.random() * 3);
      let grow = 0;
      (function frame() {
        raf = requestAnimationFrame(frame);
        const light = document.documentElement.dataset.theme === "light";
        ctx.fillStyle = light ? "rgba(243,245,251,.28)" : "rgba(8,11,22,.28)";
        ctx.fillRect(0, 0, cv.width, cv.height);
        grow = Math.min(grow + 0.02, 1);
        const branch = (x, y, len, ang, d) => {
          if (d <= 0 || len < 3) return;
          const x2 = x + Math.cos(ang) * len * grow, y2 = y - Math.sin(ang) * len * grow;
          ctx.strokeStyle = `hsl(${270 - d * 20} 70% ${35 + d * 5}%)`;
          ctx.lineWidth = d / 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
          branch(x2, y2, len * .72, ang - a1, d - 1);
          branch(x2, y2, len * .72, ang + a2, d - 1);
        };
        branch(cv.width / 2, cv.height - 16, 95, Math.PI / 2, depth);
      })();
    }

    /* --- жизнь --- */
    let lifeGrid = null, lifeCols, lifeRows;
    function life() {
      lifeCols = Math.floor(cv.width / 9);
      lifeRows = Math.floor(cv.height / 9);
      lifeGrid = Array.from({ length: lifeRows }, () =>
        Array.from({ length: lifeCols }, () => Math.random() < .22 ? 1 : 0));
      let gen = 0;
      (function frame() {
        raf = requestAnimationFrame(frame);
        const s = 9;
        const light = document.documentElement.dataset.theme === "light";
        ctx.fillStyle = light ? "#eef1f8" : "#0b0f1d";
        ctx.fillRect(0, 0, cv.width, cv.height);
        const next = lifeGrid.map(r => [...r]);
        for (let y = 0; y < lifeRows; y++) for (let x = 0; x < lifeCols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) n += lifeGrid[(y + dy + lifeRows) % lifeRows][(x + dx + lifeCols) % lifeCols];
          }
          if (lifeGrid[y][x] && (n < 2 || n > 3)) next[y][x] = 0;
          if (!lifeGrid[y][x] && n === 3) next[y][x] = 1;
          if (next[y][x]) {
            const grad = ctx.createRadialGradient(x * s + s / 2, y * s + s / 2, 1, x * s + s / 2, y * s + s / 2, s);
            grad.addColorStop(0, "#06b6d4"); grad.addColorStop(1, "#7c3aed");
            ctx.fillStyle = grad;
            ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
          }
        }
        lifeGrid = next;
        gen++;
        if (gen > 600) { stop(); life(); }
      })();
    }

    /* --- пузыри --- */
    function bubbles() {
      let bs = Array.from({ length: 34 }, () => ({
        x: Math.random() * cv.width, y: cv.height + Math.random() * cv.height,
        r: 6 + Math.random() * 26, v: .5 + Math.random() * 1.6,
        hue: 180 + Math.random() * 140
      }));
      cv.onclick = e => {
        const r = cv.getBoundingClientRect();
        const mx = (e.clientX - r.left) * cv.width / r.width;
        const my = (e.clientY - r.top) * cv.height / r.height;
        bs = bs.filter(b => Math.hypot(b.x - mx, b.y - my) > b.r + 4);
      };
      (function frame() {
        raf = requestAnimationFrame(frame);
        const light = document.documentElement.dataset.theme === "light";
        ctx.fillStyle = light ? "rgba(233,237,247,.3)" : "rgba(10,16,34,.3)";
        ctx.fillRect(0, 0, cv.width, cv.height);
        bs.forEach(b => {
          b.y -= b.v;
          if (b.y < -b.r) { b.y = cv.height + b.r; b.x = Math.random() * cv.width; }
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7);
          ctx.strokeStyle = `hsla(${b.hue} 80% 65% / .8)`; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = `hsla(${b.hue} 80% 65% / .12)`; ctx.fill();
          ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - b.r * .35, b.r * .18, 0, 7);
          ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fill();
        });
      })();
    }

    const MODES = { stars, fractal, life, bubbles };
    function run() {
      stop();
      cv.onclick = null;
      document.getElementById("cvHint").textContent = HINTS[mode];
      MODES[mode]();
    }
    document.querySelectorAll("#canvasTabs .chip").forEach(ch => ch.addEventListener("click", () => {
      document.querySelectorAll("#canvasTabs .chip").forEach(c => c.classList.remove("active"));
      ch.classList.add("active"); mode = ch.dataset.cv; run();
    }));
    document.getElementById("cvRestart").addEventListener("click", run);
    // запуск, когда вкладка видима
    new IntersectionObserver(en => { if (en[0].isIntersecting && !raf) run(); }).observe(cv);
    run();
  })();
});
