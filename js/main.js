/* ============================================================
   DemoVerse — главный скрипт (общий для всех страниц)
   ============================================================ */
"use strict";

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ---------- Утилиты ---------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("dv_" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("dv_" + k, JSON.stringify(v)); } catch {} }
};

/* ---------- Тосты ---------- */
function toast(msg, type = "info", ms = 3200) {
  let stack = $(".toast-stack");
  if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
  const icons = { success: "✅", error: "⛔", info: "ℹ️", warning: "⚠️" };
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, ms);
}
window.toast = toast;

/* ---------- Достижения ---------- */
const ACHIEVEMENTS = {
  first_visit:  { icon: "👣", title: "Первый визит",       desc: "Открыть сайт впервые" },
  theme:        { icon: "🌗", title: "Смена времени суток", desc: "Переключить тему оформления" },
  konami:       { icon: "🕹️", title: "Чит-код",            desc: "Ввести код Konami" },
  snake:        { icon: "🐍", title: "Змеелов",            desc: "Набрать 5+ очков в Змейке" },
  g2048:        { icon: "🔢", title: "Матемагия",          desc: "Собрать 128 в 2048" },
  memory:       { icon: "🧠", title: "Эйдетик",            desc: "Пройти игру Память" },
  ttt:          { icon: "⭕", title: "Стратег",            desc: "Победить в крестиках-ноликах" },
  quiz_pass:    { icon: "🎓", title: "Отличник",           desc: "Пройти квиз на 70%+" },
  todo:         { icon: "📝", title: "Планировщик",         desc: "Добавить задачу в список" },
  note:         { icon: "🗒️", title: "Летописец",           desc: "Сохранить заметку" },
  piano:        { icon: "🎹", title: "Виртуоз",            desc: "Сыграть ноту на пианино" },
  gallery:      { icon: "🖼️", title: "Искусствовед",       desc: "Открыть лайтбокс галереи" },
  form:         { icon: "📨", title: "Формалист",          desc: "Отправить форму" },
  csv:          { icon: "📊", title: "Аналитик",           desc: "Экспортировать CSV" },
  logo_click:   { icon: "🥚", title: "Пасхалкоман",        desc: "Кликнуть по логотипу 5 раз" }
};
function unlockAchievement(id) {
  const list = store.get("achv", {});
  if (list[id] || !ACHIEVEMENTS[id]) return;
  list[id] = Date.now();
  store.set("achv", list);
  const a = ACHIEVEMENTS[id];
  toast(`Достижение получено: ${a.icon} <b>${a.title}</b>`, "success", 4000);
  updateAchvCounter();
}
window.unlockAchievement = unlockAchievement;
function updateAchvCounter() {
  const n = Object.keys(store.get("achv", {})).length;
  $$("#achvCount").forEach(el => el.textContent = `${n}/${Object.keys(ACHIEVEMENTS).length}`);
}
window.showAchievements = function () {
  const list = store.get("achv", {});
  const rows = Object.entries(ACHIEVEMENTS).map(([id, a]) => {
    const got = list[id];
    return `<div class="todo-item ${got ? "done" : ""}" style="opacity:${got ? 1 : .55}">
      <span style="font-size:1.3rem">${got ? a.icon : "🔒"}</span>
      <span class="todo-text"><b>${a.title}</b><br><span class="muted" style="font-size:.8rem">${a.desc}</span></span>
      ${got ? `<span class="badge badge-success">получено</span>` : `<span class="badge">закрыто</span>`}
    </div>`;
  }).join("");
  openModal(`<div class="modal-head"><h3>🏆 Достижения</h3><button class="icon-btn" data-close>✕</button></div>${rows}`);
};

/* ---------- Модалки (универсальные) ---------- */
function openModal(html) {
  let m = $("#dvModal");
  if (!m) {
    m = document.createElement("div");
    m.id = "dvModal"; m.className = "modal";
    m.innerHTML = `<div class="modal-card">${html}</div>`;
    document.body.appendChild(m);
    m.addEventListener("click", e => {
      if (e.target === m || e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  } else {
    m.querySelector(".modal-card").innerHTML = html;
  }
  m.classList.add("open");
  document.body.style.overflow = "hidden";
  return m;
}
function closeModal() {
  const m = $("#dvModal");
  if (m) { m.classList.remove("open"); document.body.style.overflow = ""; }
}
window.openModal = openModal;
window.closeModal = closeModal;

/* ---------- Тема ---------- */
function initTheme() {
  const saved = store.get("theme", "dark");
  document.documentElement.dataset.theme = saved;
  const btn = $("#themeToggle");
  if (btn) {
    const sync = () => btn.textContent = document.documentElement.dataset.theme === "dark" ? "🌙" : "☀️";
    sync();
    btn.addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme;
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store.set("theme", next);
      sync();
      unlockAchievement("theme");
      toast(`Тема: ${next === "dark" ? "🌙 тёмная" : "☀️ светлая"}`, "info", 1800);
    });
  }
}

/* ---------- Прелоадер ---------- */
window.addEventListener("load", () => {
  const p = $("#preloader");
  if (p) setTimeout(() => p.classList.add("hide"), 350);
});

/* ---------- Навигация ---------- */
function initNav() {
  const burger = $("#burger"), nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      burger.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });
  }
  // Выпадающие меню на мобильных
  $$(".dropdown").forEach(dd => {
    const btn = $(".dropbtn", dd);
    if (btn) btn.addEventListener("click", e => {
      if (window.innerWidth <= 1020) { e.preventDefault(); dd.classList.toggle("open"); }
    });
  });
  // Активная ссылка
  const page = location.pathname.split("/").pop() || "index.html";
  $$("#nav a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (href === page) {
      a.classList.add("active");
      const dd = a.closest(".dropdown");
      if (dd) { const b = $(".dropbtn", dd); if (b) b.style.color = "var(--accent-2)"; }
    }
  });
  // Пасхалка: клик по логотипу 5 раз
  let logoClicks = 0, logoTimer;
  const logo = $("#brandLogo");
  if (logo) logo.addEventListener("click", e => {
    logoClicks++;
    clearTimeout(logoTimer); logoTimer = setTimeout(() => logoClicks = 0, 1600);
    if (logoClicks >= 5) { e.preventDefault(); logoClicks = 0; unlockAchievement("logo_click"); logo.classList.add("anim-pulse"); setTimeout(() => logo.classList.remove("anim-pulse"), 2400); }
  });
}

/* ---------- Прогресс скролла и кнопка вверх ---------- */
function initScroll() {
  const bar = $("#scrollProgress"), top = $("#backTop");
  const onScroll = () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    if (bar) bar.style.width = pct + "%";
    if (top) top.classList.toggle("show", h.scrollTop > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Появление при скролле ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
  }, { threshold: .12 });
  els.forEach(el => io.observe(el));
}

/* ---------- Cookie-баннер ---------- */
function initCookie() {
  if (store.get("cookieOk")) return;
  const b = $("#cookieBanner");
  if (!b) return;
  setTimeout(() => b.classList.add("show"), 1500);
  $("#cookieOk")?.addEventListener("click", () => { store.set("cookieOk", true); b.classList.remove("show"); toast("Спасибо! Cookie сохранены 🍪", "success"); });
}

/* ---------- Часы и счётчик визитов ---------- */
function initWidgets() {
  const clock = $("#clock");
  if (clock) {
    const tick = () => {
      const d = new Date();
      clock.textContent = d.toLocaleTimeString("ru-RU") + " · " + d.toLocaleDateString("ru-RU");
    };
    tick(); setInterval(tick, 1000);
  }
  const vis = $("#visits");
  if (vis) {
    let n = store.get("visits", 0) + 1;
    store.set("visits", n);
    vis.textContent = n;
  }
  $$("#year").forEach(e => e.textContent = new Date().getFullYear());
  updateAchvCounter();
  $("#achvBtn")?.addEventListener("click", showAchievements);
}

/* ---------- Код Konami + Матрица ---------- */
function initKonami() {
  const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let pos = 0;
  document.addEventListener("keydown", e => {
    pos = (e.key === code[pos] || e.key.toLowerCase() === code[pos]) ? pos + 1 : (e.key === code[0] ? 1 : 0);
    if (pos === code.length) { pos = 0; runMatrix(); }
  });
}
function runMatrix() {
  unlockAchievement("konami");
  let ov = $("#matrixOverlay");
  if (!ov) { ov = document.createElement("canvas"); ov.id = "matrixOverlay"; document.body.appendChild(ov); }
  ov.classList.add("show");
  const ctx = ov.getContext("2d");
  ov.width = innerWidth; ov.height = innerHeight;
  const cols = Math.floor(innerWidth / 14);
  const drops = Array(cols).fill(0);
  const chars = "アカサタナハマヤラワデモウエオアイウ01ДОБРОПОЖАЛОВАТЬ".split("");
  let raf;
  const draw = () => {
    ctx.fillStyle = "rgba(0,4,1,.09)"; ctx.fillRect(0, 0, ov.width, ov.height);
    ctx.fillStyle = "#22c55e"; ctx.font = "15px monospace";
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 15);
      drops[i] = y * 15 > ov.height && Math.random() > .97 ? 0 : y + 1;
    });
    raf = requestAnimationFrame(draw);
  };
  draw();
  toast("Wake up, Neo... Матрица вокруг вас 🟩", "success", 4000);
  const stop = () => { cancelAnimationFrame(raf); ov.classList.remove("show"); removeEventListener("keydown", esc); };
  const esc = e => { if (e.key === "Escape" || e.key === "Enter") stop(); };
  addEventListener("keydown", esc);
  setTimeout(() => { cancelAnimationFrame(raf); ov.classList.remove("show"); }, 12000);
}

/* ---------- Копирование ---------- */
function copyText(text, okMsg = "Скопировано в буфер!") {
  const done = () => toast(okMsg, "success", 2000);
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback);
  else fallback();
  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch { toast("Не удалось скопировать", "error"); }
    ta.remove();
  }
}
window.copyText = copyText;
document.addEventListener("click", e => {
  const c = e.target.closest("[data-copy]");
  if (c) copyText(c.dataset.copy || c.textContent.trim());
});

/* ---------- Счётчики-анимации ---------- */
function animateCounters() {
  $$(".stat-box .num[data-to]").forEach(el => {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const to = +el.dataset.to, dur = 1300, t0 = performance.now();
      const step = t => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.floor(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: .4 });
    io.observe(el);
  });
}

/* ---------- Service Worker (офлайн-режим PWA) ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/* ---------- Инициализация ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initScroll();
  initReveal();
  initCookie();
  initWidgets();
  initKonami();
  animateCounters();
  if (!store.get("seenWelcome")) {
    store.set("seenWelcome", 1);
    unlockAchievement("first_visit");
    setTimeout(() => toast("Добро пожаловать в DemoVerse! Загляните в 🏆 достижения в футере.", "info", 5000), 1200);
  }
});
