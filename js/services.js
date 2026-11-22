/* Services page: category filter (also reads ?cat=cut|color|style|care). */
(() => {
  "use strict";

  const list = document.querySelector("[data-services]");
  if (!list) return;

  const cards = [...list.querySelectorAll(".price-card")];
  const chips = [...document.querySelectorAll("[data-filter]")];
  const label = document.querySelector("[data-count-label]");
  const valid = new Set(chips.map((c) => c.dataset.filter));

  const apply = (filter) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    chips.forEach((chip) => {
      const on = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    if (label) label.textContent = `Showing ${shown} service${shown === 1 ? "" : "s"}`;
  };

  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.filter)));

  const param = new URLSearchParams(window.location.search).get("cat");
  apply(param && valid.has(param) ? param : "all");
})();
