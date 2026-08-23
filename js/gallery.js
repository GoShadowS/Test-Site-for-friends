/* Логика галереи: фильтры + лайтбокс */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const ITEMS = [
    { src: "img/gallery/nature.jpg",   cat: "Природа",     title: "Горное озеро на рассвете", desc: "Туман, бирюзовая вода и снежные вершины" },
    { src: "img/gallery/city.jpg",     cat: "Город",       title: "Неоновый мегаполис", desc: "Киберпанк-город после дождя" },
    { src: "img/gallery/abstract.jpg", cat: "Абстракция",  title: "Жидкие волны", desc: "Переливающийся 3D-рендер" },
    { src: "img/gallery/animal.jpg",   cat: "Природа",     title: "Рыжая лисица", desc: "Осенний лес в золотом свете" },
    { src: "img/gallery/space.jpg",    cat: "Космос",      title: "Глубокий космос", desc: "Туманность в фиолетово-розовых тонах" },
    { src: "img/gallery/ocean.jpg",    cat: "Природа",     title: "Тропический океан", desc: "Солнечные лучи сквозь толщу воды" }
  ];
  const grid = document.getElementById("galGrid");
  if (!grid) return;
  let visible = [...ITEMS];

  function render() {
    grid.innerHTML = "";
    visible.forEach((it, i) => {
      const d = document.createElement("div");
      d.className = "gal-item reveal visible";
      d.innerHTML = `<img src="${it.src}" alt="${it.title}" loading="lazy"><div class="cap">📸 <b>${it.title}</b> · ${it.cat}</div>`;
      d.addEventListener("click", () => openLb(i));
      grid.appendChild(d);
    });
    document.getElementById("galCount").textContent = `Показано изображений: ${visible.length} из ${ITEMS.length}`;
  }

  /* фильтры */
  document.querySelectorAll("#galFilters .chip").forEach(ch => ch.addEventListener("click", () => {
    document.querySelectorAll("#galFilters .chip").forEach(c => c.classList.remove("active"));
    ch.classList.add("active");
    const f = ch.dataset.g;
    visible = f === "all" ? [...ITEMS] : ITEMS.filter(it => it.cat === f);
    render();
  }));

  /* лайтбокс */
  const lb = document.getElementById("lightbox"), lbImg = document.getElementById("lbImg"), lbCap = document.getElementById("lbCap");
  let cur = 0;
  function openLb(i) {
    cur = i;
    lbImg.src = visible[i].src;
    lbCap.innerHTML = `<b>${visible[i].title}</b> — ${visible[i].desc} <span class="muted">(${i + 1}/${visible.length})</span>`;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    unlockAchievement("gallery");
  }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  const step = d => openLb((cur + d + visible.length) % visible.length);
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  /* свайпы */
  let tx = null;
  lb.addEventListener("touchstart", e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener("touchend", e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    tx = null;
  }, { passive: true });

  render();
});
