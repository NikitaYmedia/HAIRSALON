/* Contact page: 4-step booking form with validation, summary and a
   local confirmation (no server — reference is saved in localStorage). */
(() => {
  "use strict";

  const form = document.getElementById("booking-form");
  if (!form) return;

  const panels = [...form.querySelectorAll("[data-panel]")];
  const stepItems = [...document.querySelectorAll("[data-step-item]")];
  const success = document.querySelector("[data-success]");
  const heads = [...document.querySelectorAll("[data-booking-head]")];
  const total = panels.length;
  let step = 1;

  /* ---------- Helpers ---------- */
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const setError = (name, message) => {
    const out = form.querySelector(`[data-error-for="${name}"]`);
    if (out) out.textContent = message || "";
    const holder = out && out.closest(".field, .fieldset");
    if (holder) holder.classList.toggle("has-error", Boolean(message));
  };

  const checkedRadio = (name) => form.querySelector(`input[name="${name}"]:checked`);

  /* ---------- Initial values ---------- */
  form.elements.date.min = toISO(new Date());

  const preselect = new URLSearchParams(window.location.search).get("service");
  if (preselect) {
    const radio = [...form.querySelectorAll('input[name="service"]')].find((r) => r.value === preselect);
    if (radio) radio.checked = true;
  }

  /* ---------- Step display ---------- */
  const show = (n, scroll = true) => {
    step = n;
    form.dataset.step = String(n);
    panels.forEach((panel) => {
      const on = Number(panel.dataset.panel) === n;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    stepItems.forEach((item) => {
      const num = Number(item.dataset.stepItem);
      item.classList.toggle("is-active", num === n);
      item.classList.toggle("is-done", num < n);
    });
    if (n === total) fillSummary();
    const top = form.closest(".booking");
    if (scroll && top) top.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- Validation per step ---------- */
  const validators = {
    1() {
      const ok = Boolean(checkedRadio("service"));
      setError("service", ok ? "" : "Please choose a service to continue.");
      return ok;
    },
    2() {
      let ok = true;
      const dateValue = form.elements.date.value;

      if (!dateValue) {
        setError("date", "Pick a date for your visit.");
        ok = false;
      } else {
        const date = new Date(`${dateValue}T12:00:00`);
        if (dateValue < form.elements.date.min) {
          setError("date", "Please choose today or a future date.");
          ok = false;
        } else if (date.getDay() === 0) {
          setError("date", "We are closed on Sundays — please pick another day.");
          ok = false;
        } else {
          setError("date", "");
        }
      }

      if (!checkedRadio("time")) {
        setError("time", "Choose a time slot.");
        ok = false;
      } else {
        setError("time", "");
      }
      return ok;
    },
    3() {
      let ok = true;
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const phone = form.elements.phone.value.trim();

      if (name.length < 2) {
        setError("name", "Please enter your name.");
        ok = false;
      } else setError("name", "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("email", "Enter a valid email address.");
        ok = false;
      } else setError("email", "");

      if (phone && !/^[+()\d\s-]{6,20}$/.test(phone)) {
        setError("phone", "Phone number looks incorrect.");
        ok = false;
      } else setError("phone", "");

      return ok;
    },
    4() {
      const ok = form.elements.consent.checked;
      setError("consent", ok ? "" : "Please confirm to send your request.");
      return ok;
    },
  };

  /* ---------- Summary ---------- */
  const fillSummary = () => {
    const service = checkedRadio("service");
    const time = checkedRadio("time");
    const date = new Date(`${form.elements.date.value}T12:00:00`);
    const stylist = form.elements.stylist;

    const values = {
      service: service ? service.dataset.name : "",
      price: service ? service.dataset.price : "",
      stylist: stylist.options[stylist.selectedIndex].text,
      date: date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: time ? time.value : "",
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
    };

    Object.entries(values).forEach(([key, value]) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) el.textContent = value;
    });
  };

  /* ---------- Navigation ---------- */
  form.addEventListener("click", (e) => {
    const next = e.target.closest("[data-next]");
    const prev = e.target.closest("[data-prev]");
    if (next && validators[step]()) show(Math.min(step + 1, total));
    if (prev) show(Math.max(step - 1, 1));
  });

  // clear errors while the user fixes things
  form.addEventListener("input", (e) => {
    const name = e.target.name;
    if (name) setError(name, "");
  });

  /* ---------- Submit ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validators[4]()) return;

    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const ref = `HS-${code}`;

    try {
      const saved = JSON.parse(localStorage.getItem("hs-bookings") || "[]");
      saved.push({
        ref,
        service: checkedRadio("service").dataset.name,
        date: form.elements.date.value,
        time: checkedRadio("time").value,
        created: new Date().toISOString(),
      });
      localStorage.setItem("hs-bookings", JSON.stringify(saved));
    } catch (err) {
      /* storage may be unavailable — the confirmation still works */
    }

    const refEl = document.querySelector("[data-ref]");
    const mailEl = document.querySelector("[data-success-email]");
    if (refEl) refEl.textContent = ref;
    if (mailEl) mailEl.textContent = form.elements.email.value.trim();

    form.hidden = true;
    heads.forEach((h) => (h.hidden = true));
    success.hidden = false;
    success.querySelector("h2").focus();
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- New booking ---------- */
  const again = document.querySelector("[data-new-booking]");
  if (again) {
    again.addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      heads.forEach((h) => (h.hidden = false));
      success.hidden = true;
      show(1);
    });
  }

  show(1, false);
})();
