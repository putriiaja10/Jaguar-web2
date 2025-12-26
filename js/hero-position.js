(function () {
  function findActiveHeading() {
    const headings = Array.from(document.querySelectorAll('.hero-text'));
    if (!headings.length) return null;

    for (const h of headings) {
      const st = getComputedStyle(h);
      const op = parseFloat(st.opacity || 0);
      if (op > 0.15) return h;
    }

    let best = headings[0];
    let bestOp = parseFloat(getComputedStyle(best).opacity || 0);
    for (const h of headings) {
      const op = parseFloat(getComputedStyle(h).opacity || 0);
      if (op > bestOp) {
        bestOp = op;
        best = h;
      }
    }
    return best;
  }

  function updatePosition() {
    const actions = document.querySelector('.hero-actions-top');
    const overlay = document.querySelector('.absolute.inset-0');
    if (!actions || !overlay) return;

    const active = findActiveHeading();
    if (!active) return;

    const aRect = active.getBoundingClientRect();
    const containerRect = overlay.getBoundingClientRect();

    const left = aRect.left - containerRect.left;
    const inset = 12;
    const leftWithInset = left + inset;

    const gap = Math.min(20, Math.max(10, Math.round(aRect.height * 0.12)));
    const top = aRect.bottom - containerRect.top + gap;

    const minLeft = 8;
    const maxLeft = Math.max(8, containerRect.width - actions.offsetWidth - 8);
    const clampedLeft = Math.min(maxLeft, Math.max(minLeft, leftWithInset));

    actions.style.left = clampedLeft + 'px';
    actions.style.top = top + 'px';
    actions.style.transform = 'translateX(0)';
  }

  let rafId = null;

  function loop() {
    updatePosition();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId) return;
    loop();
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(updatePosition, 200);
    start();

    window.addEventListener('resize', updatePosition, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });
  });
})();
