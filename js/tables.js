/* Логика таблицы данных: сортировка, поиск, фильтр, пагинация, CSV */
"use strict";
const SPACE = [
  { name: "Меркурий", type: "planet", diameter: 4879, dist: 57.9, day: 176, moons: 0, temp: 167 },
  { name: "Венера", type: "planet", diameter: 12104, dist: 108.2, day: 243, moons: 0, temp: 464 },
  { name: "Земля", type: "planet", diameter: 12756, dist: 149.6, day: 1, moons: 1, temp: 15 },
  { name: "Марс", type: "planet", diameter: 6792, dist: 227.9, day: 1.03, moons: 2, temp: -65 },
  { name: "Юпитер", type: "planet", diameter: 142984, dist: 778.6, day: 0.41, moons: 95, temp: -110 },
  { name: "Сатурн", type: "planet", diameter: 120536, dist: 1433.5, day: 0.45, moons: 146, temp: -140 },
  { name: "Уран", type: "planet", diameter: 51118, dist: 2872.5, day: 0.72, moons: 28, temp: -195 },
  { name: "Нептун", type: "planet", diameter: 49528, dist: 4495.1, day: 0.67, moons: 16, temp: -200 },
  { name: "Плутон", type: "dwarf", diameter: 2376, dist: 5906.4, day: 6.39, moons: 5, temp: -225 },
  { name: "Церера", type: "dwarf", diameter: 946, dist: 413.7, day: 0.38, moons: 0, temp: -105 },
  { name: "Эрида", type: "dwarf", diameter: 2326, dist: 10152, day: 1.08, moons: 1, temp: -231 },
  { name: "Хаумеа", type: "dwarf", diameter: 1560, dist: 6452, day: 0.16, moons: 2, temp: -241 },
  { name: "Макемаке", type: "dwarf", diameter: 1430, dist: 6850, day: 0.95, moons: 1, temp: -239 },
  { name: "Луна", type: "moon", diameter: 3474, dist: 0.384, day: 27.3, moons: 0, temp: -20 },
  { name: "Ио", type: "moon", diameter: 3643, dist: 628.8, day: 1.77, moons: 0, temp: -143 },
  { name: "Европа", type: "moon", diameter: 3122, dist: 628.9, day: 3.55, moons: 0, temp: -171 },
  { name: "Ганимед", type: "moon", diameter: 5268, dist: 628.7, day: 7.15, moons: 0, temp: -163 },
  { name: "Каллисто", type: "moon", diameter: 4821, dist: 628.3, day: 16.69, moons: 0, temp: -139 },
  { name: "Титан", type: "moon", diameter: 5150, dist: 1278.7, day: 15.95, moons: 0, temp: -179 },
  { name: "Энцелад", type: "moon", diameter: 504, dist: 1278.0, day: 1.37, moons: 0, temp: -198 },
  { name: "Тритон", type: "moon", diameter: 2707, dist: 4361, day: 5.88, moons: 0, temp: -235 },
  { name: "Титания", type: "moon", diameter: 1578, dist: 2871.0, day: 8.71, moons: 0, temp: -203 }
];
const TYPE_LABEL = { planet: "🪐 планета", moon: "🌙 луна", dwarf: "☄️ карликовая" };

document.addEventListener("DOMContentLoaded", () => {
  let sortKey = "dist", sortDir = 1, filter = "all", query = "", page = 1;
  const PER = 8;

  function filtered() {
    let rows = SPACE.filter(r =>
      (filter === "all" || r.type === filter) &&
      (!query || r.name.toLowerCase().includes(query))
    );
    rows.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * sortDir;
    });
    return rows;
  }

  function render() {
    const rows = filtered();
    const pages = Math.max(1, Math.ceil(rows.length / PER));
    if (page > pages) page = pages;
    const slice = rows.slice((page - 1) * PER, page * PER);

    const tb = document.getElementById("tblBody");
    tb.innerHTML = slice.map(r => `<tr>
      <td><b>${r.name}</b></td>
      <td><span class="badge ${r.type === "planet" ? "badge-primary" : r.type === "moon" ? "badge-info" : "badge-warning"}">${TYPE_LABEL[r.type]}</span></td>
      <td class="mono">${r.diameter.toLocaleString("ru-RU")}</td>
      <td class="mono">${r.dist.toLocaleString("ru-RU")}</td>
      <td class="mono">${r.day}</td>
      <td class="mono">${r.moons}</td>
      <td class="mono">${r.temp > 0 ? "+" : ""}${r.temp} °C</td>
    </tr>`).join("");

    // пагинация
    const pag = document.getElementById("tblPag");
    pag.innerHTML = "";
    const mk = (txt, p, dis = false, act = false) => {
      const b = document.createElement("button");
      b.className = "page-btn" + (act ? " active" : "");
      b.textContent = txt; b.disabled = dis;
      b.addEventListener("click", () => { page = p; render(); });
      pag.appendChild(b);
    };
    mk("←", page - 1, page === 1);
    for (let p = 1; p <= pages; p++) mk(p, p, false, p === page);
    mk("→", page + 1, page === pages);

    document.getElementById("tblInfo").textContent =
      `Показано ${slice.length} из ${rows.length} (стр. ${page}/${pages}) · всего в базе ${SPACE.length}`;

    // сортировка — стрелки
    document.querySelectorAll("#dataTable th").forEach(th => {
      th.classList.toggle("sort-arrow", th.dataset.sort === sortKey && sortDir === 1);
      th.classList.toggle("sort-arrow", th.dataset.sort === sortKey);
      th.classList.toggle("desc", th.dataset.sort === sortKey && sortDir === -1);
    });
  }

  document.querySelectorAll("#dataTable th").forEach(th => th.addEventListener("click", () => {
    if (sortKey === th.dataset.sort) sortDir *= -1;
    else { sortKey = th.dataset.sort; sortDir = 1; }
    render();
  }));

  document.getElementById("tblSearch").addEventListener("input", e => {
    query = e.target.value.toLowerCase().trim(); page = 1; render();
  });

  document.querySelectorAll("#tblFilters .chip").forEach(ch => ch.addEventListener("click", () => {
    document.querySelectorAll("#tblFilters .chip").forEach(c => c.classList.remove("active"));
    ch.classList.add("active");
    filter = ch.dataset.f; page = 1; render();
  }));

  document.getElementById("tblCsv").addEventListener("click", () => {
    const rows = filtered();
    const head = "Название,Тип,Диаметр (км),Расстояние (млн км),Сутки,Спутники,Температура";
    const body = rows.map(r => [r.name, TYPE_LABEL[r.type], r.diameter, r.dist, r.day, r.moons, r.temp].join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + head + "\n" + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "космос-каталог.csv";
    a.click(); URL.revokeObjectURL(a.href);
    unlockAchievement("csv");
    toast(`Экспортировано строк: ${rows.length} 📊`, "success");
  });

  // статистика
  document.getElementById("stTotal").textContent = SPACE.length;
  const big = SPACE.reduce((m, r) => r.diameter > m.diameter ? r : m);
  document.getElementById("stBiggest").textContent = big.name;
  document.getElementById("stMoons").textContent = SPACE.filter(r => r.type === "planet").reduce((s, r) => s + r.moons, 0);

  render();
});
