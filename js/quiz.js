/* Логика квиза */
"use strict";
const QUESTIONS = [
  {
    q: "Что означает аббревиатура HTML?",
    a: ["HyperText Markup Language", "HighText Machine Language", "HyperTransfer Markup Logic", "Home Tool Markup Language"],
    c: 0,
    e: "HTML — HyperText Markup Language, «язык гипертекстовой разметки». Он описывает структуру страницы."
  },
  {
    q: "Какое свойство CSS делает блок гибким контейнером?",
    a: ["display: block", "display: flex", "position: sticky", "float: left"],
    c: 1,
    e: "display: flex превращает элемент во flex-контейнер, а его дочерние элементы — во flex-элементы."
  },
  {
    q: "Сколько дней создавался первый JavaScript?",
    a: ["2 года", "3 месяца", "10 дней", "Полчаса"],
    c: 2,
    e: "Брендан Айк создал прототип JavaScript примерно за 10 дней в мае 1995 года в Netscape."
  },
  {
    q: "Что хранит localStorage браузера?",
    a: ["Пароли пользователя", "Данные только до закрытия вкладки", "Данные на устройстве без срока", "Файлы cookie с сервера"],
    c: 2,
    e: "localStorage сохраняет данные бессрочно и только на устройстве — например, рекорды и тему этого сайта."
  },
  {
    q: "Какой тег подключает внешний JavaScript-файл?",
    a: ["<script src=\"…\">", "<js file=\"…\">", "<link script=\"…\">", "<code src=\"…\">"],
    c: 0,
    e: "Внешний скрипт подключается атрибутом src у тега <script>. Обычно с атрибутом defer."
  },
  {
    q: "GitHub Pages предназначен для хостинга…",
    a: ["Только документации", "Статических сайтов", "Бэкенд-приложений", "Баз данных"],
    c: 1,
    e: "GitHub Pages раздаёт статические файлы: HTML, CSS, JS, картинки. Идеально для лендингов и портфолио."
  },
  {
    q: "Какой метод массива превратит его элементы в строку через запятую?",
    a: [".split()", ".push()", ".join()", ".trim()"],
    c: 2,
    e: "arr.join(', ') склеивает элементы массива в строку. Обратная операция — 'a,b'.split(',')."
  },
  {
    q: "Что сделает CSS-свойство border-radius: 50% у квадрата?",
    a: ["Ничего", "Круг", "Ромб", "Тень"],
    c: 1,
    e: "Радиус 50% у квадратного элемента превращает его в идеальный круг — так сделаны аватары на этом сайте."
  },
  {
    q: "Какой API браузера рисует графику через JavaScript?",
    a: ["Canvas 2D", "Cookie API", "Fetch Static", "DOM CSS"],
    c: 0,
    e: "Canvas 2D — на нём работают Змейка, частицы на главной и визуализатор звука."
  },
  {
    q: "Сколько достижений можно собрать на этом сайте?",
    a: ["5", "10", "15", "Бесконечно"],
    c: 2,
    e: "Ровно 15 — от «Первого визита» до «Пасхалкомана». Список — в футере, кнопка 🏆."
  },
  {
    q: "Что такое Service Worker?",
    a: ["Скрипт для фоновой работы и офлайна", "CSS-препроцессор", "Формат изображений", "Браузерное расширение"],
    c: 0,
    e: "Service Worker перехватывает сетевые запросы и умеет кэшировать — поэтому этот сайт работает без интернета."
  },
  {
    q: "Продолжите: !false равно…",
    a: ["false", "true", "undefined", "Ошибка"],
    c: 1,
    e: "Оператор ! инвертирует значение: !false → true, !true → false. Классическая булева логика."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  let idx = 0, score = 0, answered = false;
  const bestEl = document.getElementById("quizBestBadge");
  const savedBest = +localStorage.getItem("dv_quiz_best") || 0;
  if (savedBest) bestEl.textContent = `🏆 Рекорд: ${savedBest}/12`;

  function show() {
    answered = false;
    document.getElementById("quizCounter").textContent = `Вопрос ${idx + 1} из ${QUESTIONS.length}`;
    document.getElementById("quizBar").style.width = (idx / QUESTIONS.length * 100) + "%";
    document.getElementById("quizScore").textContent = score;
    document.getElementById("quizQ").textContent = QUESTIONS[idx].q;
    const box = document.getElementById("quizAnswers");
    box.innerHTML = "";
    QUESTIONS[idx].a.forEach((ans, i) => {
      const b = document.createElement("button");
      b.className = "quiz-ans";
      b.textContent = `${"АБВГ"[i]}) ${ans}`;
      b.addEventListener("click", () => pick(i, b));
      box.appendChild(b);
    });
    document.getElementById("quizExplain").style.display = "none";
    const next = document.getElementById("quizNext");
    next.disabled = true;
    next.textContent = idx === QUESTIONS.length - 1 ? "Результат 🏁" : "Дальше →";
  }

  function pick(i, btn) {
    if (answered) return;
    answered = true;
    const q = QUESTIONS[idx];
    const btns = document.querySelectorAll(".quiz-ans");
    btns.forEach(b => b.disabled = true);
    btns[q.c].classList.add("correct");
    if (i !== q.c) btn.classList.add("wrong");
    else {
      score++;
      document.getElementById("quizScore").textContent = score;
    }
    const ex = document.getElementById("quizExplain");
    ex.style.display = "block";
    ex.className = "alert " + (i === q.c ? "alert-success" : "alert-warning") + " mt-16";
    ex.innerHTML = (i === q.c ? "✅ <b>Верно!</b> " : "📖 <b>Правильный ответ:</b> «" + q.a[q.c] + "». ") + q.e;
    document.getElementById("quizNext").disabled = false;
  }

  document.getElementById("quizNext").addEventListener("click", () => {
    idx++;
    if (idx < QUESTIONS.length) show();
    else finish();
  });

  function finish() {
    document.getElementById("quizGame").style.display = "none";
    document.getElementById("quizResult").style.display = "block";
    document.getElementById("quizBar").style.width = "100%";
    const pct = Math.round(score / QUESTIONS.length * 100);
    const circle = document.getElementById("quizCircle");
    circle.style.setProperty("--p", 0);
    setTimeout(() => circle.style.setProperty("--p", pct), 100);
    circle.querySelector("span").textContent = pct + "%";
    document.getElementById("quizPct").textContent = pct + "%";
    const t = document.getElementById("quizTitle"), s = document.getElementById("quizSub");
    if (pct === 100) { t.innerHTML = "🏆 Идеально! Все ответы верны"; s.textContent = "Вы знаете веб лучше, чем некоторые браузеры. Снимок результата — в буфер обмена!"; if (window.confetti) confetti(); }
    else if (pct >= 70) { t.innerHTML = "🎉 Отличный результат!"; s.textContent = `${score} из ${QUESTIONS.length} — вы явно фронтендер в душе.`; if (window.confetti) confetti(); }
    else if (pct >= 40) { t.innerHTML = "🙂 Неплохо!"; s.textContent = `${score} из ${QUESTIONS.length}. Загляните в блог — там есть чему поучиться.`; }
    else { t.innerHTML = "😅 Есть куда расти"; s.textContent = `${score} из ${QUESTIONS.length}. Попробуйте ещё раз — теперь вы знаете все ответы!`; }
    if (pct >= 70) unlockAchievement("quiz_pass");
    if (score > savedBest) {
      localStorage.setItem("dv_quiz_best", score);
      bestEl.textContent = `🏆 Рекорд: ${score}/12`;
      if (score > 0) toast("Новый личный рекорд! 🏅", "success");
    }
  }

  document.getElementById("quizRestart").addEventListener("click", () => {
    idx = 0; score = 0;
    document.getElementById("quizResult").style.display = "none";
    document.getElementById("quizGame").style.display = "block";
    show();
  });

  document.getElementById("quizShare").addEventListener("click", () => {
    const pct = Math.round(score / QUESTIONS.length * 100);
    copyText(`Я набрал ${score}/12 (${pct}%) в квизе на сайте DemoVerse! Попробуй победить мой результат 😉`);
  });

  show();
});
