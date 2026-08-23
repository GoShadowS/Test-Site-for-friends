/* Логика страницы UI-кита */
"use strict";
document.addEventListener("DOMContentLoaded", () => {

  /* Кнопка с загрузкой */
  const lb = document.getElementById("loadingBtn");
  if (lb) lb.addEventListener("click", () => {
    lb.classList.add("loading");
    setTimeout(() => { lb.classList.remove("loading"); toast("Загрузка завершена! ✨", "success"); }, 1600);
  });

  /* Чипы */
  document.querySelectorAll("[data-chip]").forEach(ch => ch.addEventListener("click", () => {
    document.querySelectorAll("[data-chip]").forEach(c => c.classList.remove("active"));
    ch.classList.add("active");
  }));

  /* Закрываемые алерты */
  document.querySelectorAll("[data-close-alert]").forEach(x => x.addEventListener("click", () => {
    const a = x.closest(".alert");
    a.style.transition = "opacity .3s, transform .3s";
    a.style.opacity = 0; a.style.transform = "translateX(30px)";
    setTimeout(() => a.remove(), 300);
  }));

  /* Модалка */
  document.getElementById("openModalBtn")?.addEventListener("click", () => {
    openModal(`
      <div class="modal-head"><h3>📨 Модальное окно</h3><button class="icon-btn" data-close>✕</button></div>
      <p class="muted mb-16">Оверлей с блюром, плавное появление, закрытие по фону, крестику и <kbd>Esc</kbd>. Внутри может быть что угодно:</p>
      <div class="alert alert-success">✅ Например, сообщение об успехе</div>
      <div class="field mt-16"><label>Или поле формы</label><input class="input" placeholder="Введите что-нибудь…"></div>
      <button class="btn btn-primary btn-block" data-close>Понятно, закрыть</button>
    `);
  });

  /* Drawer */
  const drawer = document.getElementById("drawer"), overlay = document.getElementById("drawerOverlay");
  window.closeDrawer = () => { drawer?.classList.remove("open"); overlay?.classList.remove("open"); };
  document.getElementById("openDrawerBtn")?.addEventListener("click", () => { drawer.classList.add("open"); overlay.classList.add("open"); });
  document.getElementById("drawerClose")?.addEventListener("click", window.closeDrawer);
  overlay?.addEventListener("click", window.closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape") window.closeDrawer(); });

  /* Табы с сохранением */
  document.querySelectorAll("[data-tabs]").forEach(tabs => {
    const btns = tabs.querySelectorAll(".tab");
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(b.dataset.tab)?.classList.add("active");
      localStorage.setItem("dv_last_tab", b.dataset.tab);
    }));
    const last = localStorage.getItem("dv_last_tab");
    const restore = last && document.getElementById(last);
    if (restore) restore.click();
  });

  /* Аккордеон */
  document.querySelectorAll(".acc-head").forEach(h => h.addEventListener("click", () => {
    const item = h.parentElement, body = item.querySelector(".acc-body");
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".acc-item.open").forEach(i => { i.classList.remove("open"); i.querySelector(".acc-body").style.maxHeight = null; });
    if (!wasOpen) { item.classList.add("open"); body.style.maxHeight = body.scrollHeight + "px"; }
  }));

  /* Прогресс-бары */
  document.getElementById("pbRandom")?.addEventListener("click", () => {
    ["pb1", "pb2", "pb3"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = Math.floor(Math.random() * 96) + 4 + "%";
    });
  });

  /* Карусель */
  (function () {
    const view = document.getElementById("carView"); if (!view) return;
    const items = [
      { t: "«Лучший тестовый сайт, который я видел. А я видел много — я зеркальце»", a: "🪞 Зеркало", s: "Снежная королева" },
      { t: "«Ноль зависимостей, а по ощущениям — целый фреймворк. Магия!»", a: "🧙 Волшебник", s: "HTML-академия" },
      { t: "«Пианино в браузере? Теперь я играю сонаты на переменах.»", a: "🎹 Пианист", s: "Филармония" },
      { t: "«Змейка честно съела 20 минут моего рабочего дня. Рекомендую.»", a: "🐍 Продакт-менеджер", s: "ИТ-компания" }
    ];
    let i = 0, timer;
    const dots = document.getElementById("carDots");
    items.forEach((_, k) => {
      const d = document.createElement("button");
      d.className = "page-btn"; d.style.minWidth = "12px"; d.style.height = "12px"; d.style.borderRadius = "50%"; d.style.padding = 0;
      d.addEventListener("click", () => { show(k); restart(); });
      dots.appendChild(d);
    });
    function show(k) {
      i = k;
      const it = items[k];
      view.innerHTML = `<div style="animation:fadeUp .4s">
        <p style="font-size:1.06rem; font-style:italic">“${it.t}”</p>
        <p class="muted mt-16"><b>${it.a}</b> · ${it.s}</p></div>`;
      dots.querySelectorAll(".page-btn").forEach((d, idx) => d.classList.toggle("active", idx === k));
    }
    const next = () => show((i + 1) % items.length);
    const prev = () => show((i - 1 + items.length) % items.length);
    function restart() { clearInterval(timer); timer = setInterval(next, 4000); }
    document.getElementById("carNext")?.addEventListener("click", () => { next(); restart(); });
    document.getElementById("carPrev")?.addEventListener("click", () => { prev(); restart(); });
    show(0); restart();
  })();

  /* Переключатели с сохранением */
  [["setToasts"], ["setConfetti"], ["setDev"]].forEach(([id]) => {
    const el = document.getElementById(id); if (!el) return;
    el.checked = localStorage.getItem("dv_set_" + id) === "1";
    el.addEventListener("change", () => {
      localStorage.setItem("dv_set_" + id, el.checked ? "1" : "0");
      if (window.toast) toast(`Настройка «${el.previousElementSibling?.textContent || id}»: ${el.checked ? "вкл" : "выкл"}`, "info", 1800);
      if (id === "setConfetti" && el.checked) confetti();
    });
  });

  /* Мини-конфетти */
  window.confetti = function () {
    const colors = ["#7c3aed", "#06b6d4", "#f472b6", "#22c55e", "#f59e0b"];
    for (let k = 0; k < 60; k++) {
      const c = document.createElement("div");
      const size = 5 + Math.random() * 7;
      Object.assign(c.style, {
        position: "fixed", zIndex: 1100, pointerEvents: "none",
        left: Math.random() * 100 + "vw", top: "-14px",
        width: size + "px", height: size * .6 + "px",
        background: colors[k % colors.length], borderRadius: "2px",
        transform: `rotate(${Math.random() * 360}deg)`,
        transition: `top ${1.4 + Math.random()}s ease-in, left .6s ease-out, opacity 1.8s`
      });
      document.body.appendChild(c);
      requestAnimationFrame(() => {
        c.style.top = 100 + Math.random() * 20 + "vh";
        c.style.left = Math.random() * 100 + "vw";
        c.style.opacity = 0;
      });
      setTimeout(() => c.remove(), 2600);
    }
  };

  /* Пагинация демо */
  document.querySelectorAll("#pagDemo .page-btn").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("#pagDemo .page-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  }));

});
