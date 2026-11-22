/* Global behaviour: header, mobile menu, scroll reveal, counters,
   image fallback, back-to-top. Only toggles classes / text — all
   visuals live in the CSS files. */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const toTop = document.querySelector(".to-top");

  /* ---------- Header state on scroll ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("is-menu-open", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", () => setMenu(false));
  }

  /* ---------- Back to top ---------- */
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = Number(el.dataset.count).toLocaleString("en-US") + (el.dataset.suffix || "");
    });
  }

  /* ---------- Broken image fallback (CSS shows a pink placeholder) ---------- */
  document.querySelectorAll("img").forEach((img) => {
    const fail = () => img.classList.add("is-failed");
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0 && img.loading !== "lazy") fail();
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
