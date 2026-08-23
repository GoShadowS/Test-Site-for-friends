/* Логика страницы приложений */
"use strict";
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Калькулятор ---------- */
  (function calc() {
    const resEl = document.getElementById("calcRes"); if (!resEl) return;
    const exprEl = document.getElementById("calcExpr");
    const histEl = document.getElementById("calcHistory");
    let expr = "", history = JSON.parse(localStorage.getItem("dv_calc_hist") || "[]");

    const renderHist = () => {
      histEl.innerHTML = history.length ? history.map(h => `<p class="mono" style="padding:6px 0; border-bottom:1px dashed var(--border)">${h}</p>`).join("") : `<p class="muted">Пока пусто — посчитайте что-нибудь!</p>`;
    };
    renderHist();

    function press(k) {
      if (k === "C") { expr = ""; }
      else if (k === "←") { expr = expr.slice(0, -1); }
      else if (k === "=") {
        try {
          const safe = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".");
          if (!/^[0-9+\-*/%.() ]+$/.test(safe) || !safe) return;
          // eslint-disable-next-line no-new-func
          const val = Function('"use strict";return (' + safe + ")")();
          if (!isFinite(val)) throw 0;
          const out = Math.round(val * 1e8) / 1e8;
          history.unshift(`${expr} = <b style="color:var(--accent-2)">${out}</b>`);
          history = history.slice(0, 12);
          localStorage.setItem("dv_calc_hist", JSON.stringify(history));
          renderHist();
          expr = String(out);
        } catch { exprEl.textContent = "Ошибка!"; resEl.textContent = "⛔"; return; }
      }
      else { if (expr.length < 30) expr += k; }
      exprEl.textContent = expr.replace(/\*/g, "×").replace(/\//g, "÷");
      resEl.textContent = expr || "0";
    }
    document.getElementById("calcPad").addEventListener("click", e => {
      const b = e.target.closest("[data-k]");
      if (b) press(b.dataset.k);
    });
    addEventListener("keydown", e => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (/^[0-9+\-*/.=]$/.test(e.key)) { press(e.key === "." ? "," : e.key); e.preventDefault(); }
      else if (e.key === "Enter") { press("="); e.preventDefault(); }
      else if (e.key === "Backspace") { press("←"); e.preventDefault(); }
      else if (e.key === "Escape") press("C");
    });
    document.getElementById("calcClear").addEventListener("click", () => { history = []; localStorage.removeItem("dv_calc_hist"); renderHist(); });
  })();

  /* ---------- Задачи ---------- */
  (function todo() {
    const listEl = document.getElementById("todoList"); if (!listEl) return;
    let todos = JSON.parse(localStorage.getItem("dv_todos") || "[]");
    let filter = "all";

    function save() { localStorage.setItem("dv_todos", JSON.stringify(todos)); }
    function render() {
      const shown = todos.filter(t => filter === "all" || (filter === "done") === t.done);
      listEl.innerHTML = shown.length ? "" : `<p class="muted" style="padding:14px 0">Задач нет 🎈 Добавьте первую!</p>`;
      shown.forEach(t => {
        const div = document.createElement("div");
        div.className = "todo-item" + (t.done ? " done" : "");
        div.innerHTML = `
          <label class="switch"><input type="checkbox" ${t.done ? "checked" : ""}><span class="track"></span></label>
          <span class="todo-text"></span>
          <button class="todo-del" title="Удалить">🗑️</button>`;
        div.querySelector(".todo-text").textContent = t.text;
        div.querySelector("input").addEventListener("change", ev => {
          t.done = ev.target.checked; save(); render();
        });
        div.querySelector(".todo-del").addEventListener("click", () => {
          todos = todos.filter(x => x.id !== t.id); save(); render();
        });
        listEl.appendChild(div);
      });
      const done = todos.filter(t => t.done).length, total = todos.length;
      document.getElementById("todoCount").textContent = `${done} из ${total} выполнено`;
      const pct = total ? Math.round(done / total * 100) : 0;
      document.getElementById("todoRing").style.setProperty("--p", pct);
      document.getElementById("todoPct").textContent = pct + "%";
    }
    document.getElementById("todoAdd").addEventListener("click", add);
    document.getElementById("todoInput").addEventListener("keydown", e => { if (e.key === "Enter") add(); });
    function add() {
      const inp = document.getElementById("todoInput");
      const text = inp.value.trim();
      if (!text) return toast("Введите текст задачи!", "warning");
      todos.unshift({ id: Date.now(), text, done: false });
      inp.value = ""; save(); render();
      unlockAchievement("todo");
    }
    document.querySelectorAll("[data-todo-filter]").forEach(ch => ch.addEventListener("click", () => {
      document.querySelectorAll("[data-todo-filter]").forEach(c => c.classList.remove("active"));
      ch.classList.add("active"); filter = ch.dataset.todoFilter; render();
    }));
    document.getElementById("todoClear").addEventListener("click", () => {
      todos = todos.filter(t => !t.done); save(); render(); toast("Готовые задачи удалены 🧹", "info");
    });
    render();
  })();

  /* ---------- Заметки ---------- */
  (function notes() {
    const body = document.getElementById("noteBody"); if (!body) return;
    const title = document.getElementById("noteTitle"), status = document.getElementById("noteStatus"), meta = document.getElementById("noteMeta");
    title.value = localStorage.getItem("dv_note_title") || "";
    body.value = localStorage.getItem("dv_note") || "";
    let t;
    function autosave() {
      status.textContent = "сохранение…"; status.className = "badge badge-warning";
      clearTimeout(t);
      t = setTimeout(() => {
        localStorage.setItem("dv_note", body.value);
        localStorage.setItem("dv_note_title", title.value);
        status.textContent = "сохранено"; status.className = "badge badge-success";
        unlockAchievement("note");
        const words = body.value.trim() ? body.value.trim().split(/\s+/).length : 0;
        meta.textContent = `Символов: ${body.value.length} · Слов: ${words}`;
      }, 600);
    }
    body.addEventListener("input", autosave); title.addEventListener("input", autosave);
    autosave();
    document.getElementById("noteClear").addEventListener("click", () => {
      if (!confirm("Очистить заметку?")) return;
      body.value = ""; title.value = ""; autosave(); toast("Заметка очищена", "info");
    });
    document.getElementById("noteDownload").addEventListener("click", () => {
      const blob = new Blob([title.value + "\n\n" + body.value], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (title.value || "заметка").replace(/[\\/:*?"<>|]/g, "").slice(0, 40) + ".txt";
      a.click(); URL.revokeObjectURL(a.href);
      toast("Файл скачивается… 📄", "success");
    });
  })();

  /* ---------- Секундомер ---------- */
  (function stopwatch() {
    const disp = document.getElementById("swDisplay"); if (!disp) return;
    let running = false, t0 = 0, elapsed = 0, laps = [];
    const fmt = ms => {
      const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, d = Math.floor(ms / 100) % 10;
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
    };
    let raf;
    (function upd() { if (running) { disp.textContent = fmt(elapsed + performance.now() - t0); } requestAnimationFrame(upd); })();
    document.getElementById("swStart").addEventListener("click", e => {
      running = !running;
      if (running) { t0 = performance.now(); e.target.textContent = "Пауза"; document.getElementById("swLap").disabled = false; }
      else { elapsed += performance.now() - t0; e.target.textContent = "Продолжить"; }
    });
    document.getElementById("swLap").addEventListener("click", () => {
      const cur = running ? elapsed + performance.now() - t0 : elapsed;
      laps.unshift(cur);
      document.getElementById("swLaps").innerHTML = laps.map((l, i) => `<div class="flex-between" style="border-bottom:1px dashed var(--border); padding:5px 0"><span>Круг ${laps.length - i}</span><b class="mono">${fmt(l)}</b></div>`).join("");
    });
    document.getElementById("swReset").addEventListener("click", () => {
      running = false; elapsed = 0; laps = [];
      disp.textContent = "00:00.0";
      document.getElementById("swStart").textContent = "Старт";
      document.getElementById("swLap").disabled = true;
      document.getElementById("swLaps").innerHTML = "";
    });
  })();

  /* ---------- Таймер ---------- */
  (function timerApp() {
    const disp = document.getElementById("tmDisplay"); if (!disp) return;
    let total = 300, left = 300, iv = null;
    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const show = () => { disp.textContent = fmt(left); document.getElementById("tmBar").style.width = (left / total * 100) + "%"; };
    document.querySelectorAll("[data-tm]").forEach(b => b.addEventListener("click", () => {
      clearInterval(iv); iv = null;
      total = left = +b.dataset.tm * 60; show();
      document.getElementById("tmStart").textContent = "Старт";
    }));
    document.getElementById("tmStart").addEventListener("click", e => {
      if (iv) { clearInterval(iv); iv = null; e.target.textContent = "Продолжить"; return; }
      e.target.textContent = "Пауза";
      iv = setInterval(() => {
        left--; show();
        if (left <= 0) {
          clearInterval(iv); iv = null;
          toast("⏰ Время вышло!", "success", 5000);
          beep(880, .4); setTimeout(() => beep(880, .4), 500); setTimeout(() => beep(1100, .6), 1000);
          left = total; show();
          document.getElementById("tmStart").textContent = "Старт";
        }
      }, 1000);
    });
    document.getElementById("tmReset").addEventListener("click", () => {
      clearInterval(iv); iv = null; left = total; show();
      document.getElementById("tmStart").textContent = "Старт";
    });
    show();
    function beep(freq, dur) {
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(.25, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
        o.start(); o.stop(ac.currentTime + dur);
      } catch {}
    }
  })();

  /* ---------- Конвертер единиц ---------- */
  (function conv() {
    const from = document.getElementById("convFrom"); if (!from) return;
    const UNITS = {
      "мм": .001, "см": .01, "м": 1, "км": 1000, "дюйм": .0254, "фут": .3048, "миля": 1609.34,
      "г": .001, "кг": 1, "т": 1000, "фунт": .4536, "унция": .02835
    };
    const names = Object.keys(UNITS);
    [from, document.getElementById("convTo")].forEach(sel => {
      names.forEach(n => sel.add(new Option(n, n)));
    });
    from.value = "см"; document.getElementById("convTo").value = "дюйм";
    function calc() {
      const v = +document.getElementById("convVal").value || 0;
      const to = document.getElementById("convTo").value;
      const meters = v * UNITS[from.value];
      const out = meters / UNITS[to];
      document.getElementById("convResult").textContent = `${v} ${from.value} = ${out.toFixed(4).replace(/\.?0+$/, "")} ${to}`;
    }
    ["convVal", "convFrom", "convTo"].forEach(id => document.getElementById(id).addEventListener("input", calc));
    calc();
  })();

  /* ---------- Температура ---------- */
  (function temp() {
    const el = document.getElementById("tempVal"); if (!el) return;
    function calc() {
      const v = +el.value;
      const f = document.getElementById("tempFrom").value;
      let c = f === "c" ? v : f === "f" ? (v - 32) * 5 / 9 : v - 273.15;
      document.getElementById("tempOut").innerHTML =
        `🌡️ ${c.toFixed(1)} °C &nbsp;·&nbsp; ${(c * 9 / 5 + 32).toFixed(1)} °F &nbsp;·&nbsp; ${(c + 273.15).toFixed(1)} K`;
    }
    ["tempVal", "tempFrom"].forEach(id => document.getElementById(id).addEventListener("input", calc));
    calc();
  })();

  /* ---------- Валюты (офлайн-курсы) ---------- */
  (function cur() {
    const from = document.getElementById("curFrom"); if (!from) return;
    // примерные курсы к рублю (демо-данные!)
    const RATES = { "₽ рубль": 1, "$ доллар": 92, "€ евро": 100, "¥ юань": 12.7, "₸ тенге": 0.19, "₴ гривна": 2.2 };
    const to = document.getElementById("curTo");
    Object.keys(RATES).forEach(k => { from.add(new Option(k, k)); to.add(new Option(k, k)); });
    from.selectedIndex = 0; to.selectedIndex = 1;
    function calc() {
      const v = +document.getElementById("curVal").value || 0;
      const rub = v * RATES[from.value];
      const out = rub / RATES[to.value];
      document.getElementById("curOut").innerHTML = `💱 <b>${v} ${from.value} ≈ ${out.toFixed(2)} ${to.value}</b><br><span style="font-size:.8rem; opacity:.7">демо-курсы, зашитые в код</span>`;
    }
    ["curVal", "curFrom", "curTo"].forEach(id => document.getElementById(id).addEventListener("input", calc));
    calc();
  })();

  /* ---------- Пароли ---------- */
  (function pass() {
    const lenEl = document.getElementById("passLen"); if (!lenEl) return;
    const out = document.getElementById("passOut");
    lenEl.addEventListener("input", () => document.getElementById("passLenVal").textContent = lenEl.value);
    function generate() {
      const sets = [];
      if (document.getElementById("passUpper").checked) sets.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
      if (document.getElementById("passLower").checked) sets.push("abcdefghijkmnopqrstuvwxyz");
      if (document.getElementById("passDigits").checked) sets.push("23456789");
      if (document.getElementById("passSymbols").checked) sets.push("!@#$%^&*_-+=?");
      if (!sets.length) { toast("Выберите хотя бы один набор символов!", "warning"); return; }
      const all = sets.join("");
      const arr = new Uint32Array(+lenEl.value);
      crypto.getRandomValues(arr);
      let pwd = Array.from(arr, n => all[n % all.length]).join("");
      out.textContent = pwd;
      // оценка стойкости
      let bits = Math.log2(all.length) * pwd.length;
      const bar = document.getElementById("passStrength"), txt = document.getElementById("passStrengthTxt");
      const lvl = bits < 40 ? ["слабый", "#ef4444", 25] : bits < 60 ? ["средний", "#f59e0b", 50] : bits < 90 ? ["хороший", "#22c55e", 75] : ["отличный!", "#06b6d4", 100];
      bar.style.width = lvl[2] + "%"; bar.style.background = lvl[1];
      txt.textContent = `Стойкость: ${lvl[0]} (~${Math.round(bits)} бит энтропии)`;
    }
    document.getElementById("passGen").addEventListener("click", generate);
    document.querySelector("[data-copy-id='passOut']").addEventListener("click", () => copyText(out.textContent));
    generate();
  })();

  /* ---------- Анализ текста ---------- */
  (function textStats() {
    const el = document.getElementById("textIn"); if (!el) return;
    const STOP = new Set(["и","в","на","с","это","что","не","по","за","из","у","же","а","но","о","от","для","как","даже","здесь","есть"]);
    function calc() {
      const t = el.value;
      const words = t.trim() ? t.trim().split(/\s+/) : [];
      document.getElementById("tsChars").textContent = t.length;
      document.getElementById("tsWords").textContent = words.length;
      document.getElementById("tsSents").textContent = (t.match(/[.!?…]+/g) || []).length;
      document.getElementById("tsRead").textContent = Math.max(t.trim() ? 1 : 0, Math.round(words.length / 180));
      const freq = {};
      words.map(w => w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "")).filter(w => w.length > 3 && !STOP.has(w)).forEach(w => freq[w] = (freq[w] || 0) + 1);
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
      document.getElementById("tsTop").innerHTML = top.length
        ? top.map(([w, n]) => `<span class="chip">${w} · ${n}</span>`).join("")
        : `<span class="muted">—</span>`;
    }
    el.addEventListener("input", calc);
    calc();
  })();

  /* ---------- Цвета ---------- */
  (function colors() {
    const pick = document.getElementById("colorPick"); if (!pick) return;
    function hexToRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      let h = 0, s = 0, l = (mx + mn) / 2;
      if (mx !== mn) {
        const d = mx - mn;
        s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
        h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h /= 6;
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }
    function update() {
      const hex = pick.value;
      const [r, g, b] = hexToRgb(hex);
      const [h, s, l] = rgbToHsl(r, g, b);
      document.getElementById("colorInfo").innerHTML =
        `HEX: <b>${hex.toUpperCase()}</b><br>RGB: <b>${r}, ${g}, ${b}</b><br>HSL: <b>${h}°, ${s}%, ${l}%</b>`;
      const shades = document.getElementById("colorShades");
      shades.innerHTML = "";
      [90, 70, 50, 30, 12].forEach(l2 => {
        const d = document.createElement("div");
        d.style.cssText = `height:58px; border-radius:9px; cursor:pointer; border:1px solid var(--border); background:hsl(${h} ${s}% ${l2}%)`;
        d.title = `hsl(${h}, ${s}%, ${l2}%)`;
        d.addEventListener("click", () => copyText(`hsl(${h}, ${s}%, ${l2}%)`));
        shades.appendChild(d);
      });
    }
    pick.addEventListener("input", update);
    update();
  })();

});
