/* Gallery page: category filter + lightbox with keyboard support.
   Reads ?filter=waves|long|updo|color from the URL (used by the home quiz). */
(() => {
  "use strict";

  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;

  const items = [...grid.querySelectorAll(".gallery__item")];
  const chips = [...document.querySelectorAll("[data-filter]")];
  const label = document.querySelector("[data-count-label]");
  const dialog = document.querySelector("[data-lightbox]");
  const valid = new Set(chips.map((c) => c.dataset.filter));

  /* ---------- Filter ---------- */
  const apply = (filter) => {
    let shown = 0;
    items.forEach((item) => {
      const match = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    chips.forEach((chip) => {
      const on = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    if (label) label.textContent = `Showing ${shown} look${shown === 1 ? "" : "s"}`;
  };

  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.filter)));

  const param = new URLSearchParams(window.location.search).get("filter");
  apply(param && valid.has(param) ? param : "all");

  /* ---------- Lightbox ---------- */
  if (!dialog || typeof dialog.showModal !== "function") return;

  const img = dialog.querySelector(".lightbox__img");
  const caption = dialog.querySelector(".lightbox__caption");
  let visible = [];
  let index = 0;

  const render = () => {
    const item = visible[index];
    const button = item.querySelector(".gallery__open");
    img.src = button.dataset.full;
    img.alt = item.querySelector("img").alt;
    caption.textContent = item.querySelector(".gallery__name").textContent;
  };

  const open = (item) => {
    visible = items.filter((i) => !i.classList.contains("is-hidden"));
    index = visible.indexOf(item);
    render();
    dialog.showModal();
  };

  const step = (dir) => {
    index = (index + dir + visible.length) % visible.length;
    render();
  };

  grid.addEventListener("click", (e) => {
    const button = e.target.closest(".gallery__open");
    if (button) open(button.closest(".gallery__item"));
  });

  dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-lightbox-prev]").addEventListener("click", () => step(-1));
  dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => step(1));

  // click on the backdrop closes
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
})();
