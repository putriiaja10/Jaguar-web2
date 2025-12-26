(() => {
  const selector = '.marquee-list';
  const wrapperSelector = '.marquee-wrap';

  function init() {
    const list = document.querySelector(selector);
    const wrap = document.querySelector(wrapperSelector);
    if (!list || !wrap) return;

    let rafId = null;
    const pixelsPerSecond = 15;
    let paused = false;

    wrap.style.overflow = 'hidden';
    list.style.display = 'flex';
    list.style.flexWrap = 'nowrap';
    list.style.willChange = 'transform';

    (function ensureDuplication() {
      if (list.dataset.marqueeCloned === 'true') return;
      const children = Array.from(list.children);
      if (!children.length) return;

      const original = children.slice();
      const origCount = original.length;

      let hasDuplicate = false;
      for (let i = 1; i < children.length; i++) {
        if (children[i].outerHTML === children[0].outerHTML) {
          hasDuplicate = true;
          break;
        }
      }

      const cloneTimes = hasDuplicate ? 0 : 2;
      for (let t = 0; t < cloneTimes; t++) {
        original.forEach(node => {
          const clone = node.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.dataset.cloned = 'true';
          list.appendChild(clone);
        });
      }

      list.dataset.marqueeCloned = 'true';
      list.dataset.marqueeOriginalCount = String(origCount);
      list.dataset.marqueeSets = String(
        Math.max(1, Math.round(list.children.length / origCount))
      );
    })();

    function waitForImages(timeout = 800) {
      const imgs = Array.from(list.querySelectorAll('img'));
      if (!imgs.length) return Promise.resolve();
      const pending = imgs.filter(i => !i.complete);
      if (!pending.length) return Promise.resolve();

      return new Promise(resolve => {
        let finished = false;
        const onDone = () => {
          if (finished) return;
          finished = true;
          resolve();
        };
        pending.forEach(img => {
          img.addEventListener('load', onDone, { once: true });
          img.addEventListener('error', onDone, { once: true });
        });
        setTimeout(onDone, timeout);
      });
    }

    function measure() {
      const prevTransform = list.style.transform;
      list.style.transform = 'none';
      const total = list.scrollWidth || 0;
      const sets = parseInt(list.dataset.marqueeSets, 10) || 2;
      const setWidth = Math.max(1, Math.round(total / sets));
      list.style.transform = prevTransform;
      return setWidth;
    }

    let resetAt = 0;
    let x = 0;
    let lastTime = 0;

    function step(now) {
      if (!lastTime) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;

      if (!paused && resetAt > 0) {
        const dx = (pixelsPerSecond * dt) / 1000;
        x -= dx;

        if (Math.abs(x) >= resetAt) {
          const m = ((x % resetAt) + resetAt) % resetAt;
          x = m - resetAt;
        }
        list.style.transform = `translate3d(${x}px,0,0)`;
      }
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (!rafId) rafId = requestAnimationFrame(step);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastTime = 0;
    }

    wrap.addEventListener('mouseenter', () => (paused = true));
    wrap.addEventListener('mouseleave', () => (paused = false));
    wrap.addEventListener('focusin', () => (paused = true));
    wrap.addEventListener('focusout', () => (paused = false));

    let resizeTimer = null;
    function recalc() {
      const m = measure();
      if (m > 0) resetAt = m;
      if (resetAt > 0) x = x % resetAt;
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 120);
    });

    waitForImages(1000).then(() => {
      recalc();
      start();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
