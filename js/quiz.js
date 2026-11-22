/* "Find your signature look" quiz (home page).
   Counts answers, then reveals the matching result block. */
(() => {
  "use strict";

  const root = document.querySelector("[data-quiz]");
  if (!root) return;

  const steps = [...root.querySelectorAll(".quiz__step")];
  const dots = [...root.querySelectorAll(".quiz__dot")];
  const results = [...root.querySelectorAll("[data-result-id]")];
  const progress = root.querySelector(".quiz__progress");
  const restart = root.querySelector("[data-quiz-restart]");

  let current = 0;
  let tally = {};

  const showStep = (index) => {
    current = index;
    steps.forEach((step, i) => {
      const on = i === index;
      step.classList.toggle("is-active", on);
      step.hidden = !on;
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.classList.toggle("is-done", i < index);
    });
  };

  const showResult = () => {
    const order = results.map((r) => r.dataset.resultId);
    let winner = order[0];
    let best = -1;
    order.forEach((key) => {
      const score = tally[key] || 0;
      if (score > best) {
        best = score;
        winner = key;
      }
    });

    steps.forEach((s) => (s.hidden = true));
    if (progress) progress.hidden = true;
    results.forEach((r) => (r.hidden = r.dataset.resultId !== winner));
  };

  const reset = () => {
    tally = {};
    results.forEach((r) => (r.hidden = true));
    root.querySelectorAll(".quiz__option").forEach((o) => o.classList.remove("is-picked"));
    if (progress) progress.hidden = false;
    showStep(0);
  };

  root.addEventListener("click", (e) => {
    const option = e.target.closest(".quiz__option");
    if (!option) return;

    const key = option.dataset.result;
    tally[key] = (tally[key] || 0) + 1;
    option.classList.add("is-picked");

    // short pause so the picked state is visible
    window.setTimeout(() => {
      if (current < steps.length - 1) showStep(current + 1);
      else showResult();
    }, 280);
  });

  if (restart) restart.addEventListener("click", reset);
  reset();
})();
