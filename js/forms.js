/* Логика страницы форм */
"use strict";
document.addEventListener("DOMContentLoaded", () => {

  const setErr = (inputId, fieldId, bad) => {
    const inp = document.getElementById(inputId), f = document.getElementById(fieldId);
    if (!inp || !f) return;
    f.classList.toggle("invalid", bad);
    inp.classList.toggle("error", bad);
    inp.classList.toggle("valid", !bad && inp.value.length > 0);
    return !bad;
  };

  /* ---------- Регистрация ---------- */
  const nameEl = document.getElementById("regName");
  const emailEl = document.getElementById("regEmail");
  const phoneEl = document.getElementById("regPhone");
  const passEl = document.getElementById("regPass");
  const pass2El = document.getElementById("regPass2");

  nameEl?.addEventListener("input", () => setErr("regName", "f-name", nameEl.value.trim().length < 2));
  emailEl?.addEventListener("input", () => setErr("regEmail", "f-email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value)));
  passEl?.addEventListener("input", () => {
    setErr("regPass", "f-pass", passEl.value.length > 0 && passEl.value.length < 8);
    const bar = document.getElementById("regStrength"), txt = document.getElementById("regStrengthTxt");
    const v = passEl.value;
    let lvl = 0;
    if (v.length >= 8) lvl++;
    if (/[A-ZА-Я]/.test(v) && /[a-zа-я]/.test(v)) lvl++;
    if (/\d/.test(v)) lvl++;
    if (/[^A-Za-zА-Яа-я0-9]/.test(v)) lvl++;
    const map = [
      ["очень слабый", "#ef4444", 20], ["слабый", "#f97316", 40],
      ["средний", "#f59e0b", 60], ["хороший", "#22c55e", 80], ["надёжный 💪", "#06b6d4", 100]
    ];
    bar.style.width = v ? map[lvl][2] + "%" : "0";
    bar.style.background = map[lvl][1];
    txt.textContent = "Стойкость: " + (v ? map[lvl][0] : "—");
  });
  pass2El?.addEventListener("input", () => setErr("regPass2", "f-pass2", pass2El.value !== passEl.value));

  /* маска телефона +7 (999) 123-45-67 */
  phoneEl?.addEventListener("input", () => {
    let d = phoneEl.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    let out = "+7";
    if (d.length > 1) out += " (" + d.slice(1, 4);
    if (d.length >= 5) out += ") " + d.slice(4, 7);
    if (d.length >= 8) out += "-" + d.slice(7, 9);
    if (d.length >= 10) out += "-" + d.slice(9, 11);
    phoneEl.value = out;
    setErr("regPhone", "f-phone", d.length > 0 && d.length < 11);
  });

  document.getElementById("regForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const ok1 = setErr("regName", "f-name", nameEl.value.trim().length < 2);
    const ok2 = setErr("regEmail", "f-email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value));
    const ok3 = setErr("regPhone", "f-phone", phoneEl.value.replace(/\D/g, "").length !== 11);
    const ok4 = setErr("regPass", "f-pass", passEl.value.length < 8);
    const ok5 = setErr("regPass2", "f-pass2", pass2El.value !== passEl.value || !pass2El.value);
    const agree = document.getElementById("regAgree").checked;
    if (!agree) toast("Нужно согласиться с условиями 🙂", "warning");
    if (ok1 && ok2 && ok3 && ok4 && ok5 && agree) {
      unlockAchievement("form");
      openModal(`<div class="modal-head"><h3>🎉 Успешная регистрация!</h3><button class="icon-btn" data-close>✕</button></div>
        <p>Добро пожаловать, <b>${nameEl.value.trim().split(" ")[0]}</b>!</p>
        <p class="muted mt-16">Это демо-форма: данные никуда не отправлялись и остались только в вашем браузере.</p>
        <button class="btn btn-primary btn-block mt-24" data-close>Ура!</button>`);
      document.getElementById("regForm").reset();
      document.getElementById("regStrength").style.width = 0;
      document.getElementById("regStrengthTxt").textContent = "Стойкость: —";
    } else {
      toast("Проверьте выделенные поля 🔍", "error");
    }
  });

  /* ---------- Drag-n-drop ---------- */
  const dz = document.getElementById("dropZone"), fi = document.getElementById("fileInput"), fl = document.getElementById("fileList");
  if (dz) {
    dz.addEventListener("click", () => fi.click());
    ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => {
      e.preventDefault(); dz.style.borderColor = "var(--accent-2)"; dz.style.background = "var(--card-hover)";
    }));
    ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => {
      e.preventDefault(); dz.style.borderColor = "var(--border)"; dz.style.background = "transparent";
    }));
    dz.addEventListener("drop", e => handleFiles(e.dataTransfer.files));
    fi.addEventListener("change", () => handleFiles(fi.files));
    function handleFiles(files) {
      [...files].forEach(file => {
        const row = document.createElement("div");
        row.className = "todo-item";
        row.innerHTML = `<span style="font-size:1.4rem">${file.type.startsWith("image/") ? "🖼️" : "📄"}</span>
          <span class="todo-text"><b>${file.name}</b><br><span class="muted" style="font-size:.78rem">${(file.size / 1024).toFixed(1)} КБ · ${file.type || "неизвестный тип"}</span></span>`;
        if (file.type.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = URL.createObjectURL(file);
          img.style.cssText = "width:46px; height:46px; object-fit:cover; border-radius:9px";
          row.prepend(img);
        }
        fl.prepend(row);
      });
      if (files.length) toast(`Файлов добавлено: ${files.length} ✅`, "success");
    }
  }

  /* ---------- range/color мелочи ---------- */
  const rangeDemo = document.getElementById("rangeDemo");
  rangeDemo?.addEventListener("input", () => {
    document.getElementById("rangeOut").textContent = rangeDemo.value;
  });

  /* ---------- Обратная связь ---------- */
  const fbMsg = document.getElementById("fbMsg");
  fbMsg?.addEventListener("input", () => {
    document.getElementById("fbCount").textContent = `${fbMsg.value.length}/300`;
    setErr("fbMsg", "f-fb-msg", fbMsg.value.length > 0 && fbMsg.value.trim().length < 10);
  });
  document.getElementById("fbName")?.addEventListener("input", e =>
    setErr("fbName", "f-fb-name", e.target.value.trim().length < 2));

  document.getElementById("feedbackForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const n = document.getElementById("fbName").value.trim();
    const m = fbMsg.value.trim();
    const okn = setErr("fbName", "f-fb-name", n.length < 2);
    const okm = setErr("fbMsg", "f-fb-msg", m.length < 10);
    if (!okn || !okm) { toast("Заполните поля корректно ✍️", "error"); return; }
    const btn = document.getElementById("fbSubmit");
    btn.classList.add("loading");
    setTimeout(() => {
      btn.classList.remove("loading");
      unlockAchievement("form");
      toast(`Спасибо, ${n.split(" ")[0]}! Сообщение «отправлено» (демо) 💜`, "success", 4000);
      document.getElementById("feedbackForm").reset();
      document.getElementById("fbCount").textContent = "0/300";
    }, 1200);
  });
});
