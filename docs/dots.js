// Inline artwork remains readable without JS. Each visible scene plays once.
(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('[data-dots-scene], [data-actor-scene]')];
  if (!scenes.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();

  function update(scene) {
    if (reducedMotion.matches) {
      scene.dataset.motion = 'still';
      scene.removeAttribute('data-paused');
      return;
    }
    const paused = document.hidden || !visible.has(scene);
    scene.toggleAttribute('data-paused', paused);
    if (!paused && scene.dataset.motion === 'still') scene.dataset.motion = 'playing';
  }

  scenes.forEach(scene => {
    scene.addEventListener('animationend', event => {
      // The handoff ends the hero; the portrait's main action ends its own scene.
      if (event.animationName === 'dots-handoff' || event.target.hasAttribute('data-motion-end')) {
        scene.dataset.motion = 'done';
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        update(entry.target);
      });
    }, { threshold: 0.2 });
    scenes.forEach(scene => observer.observe(scene));
  } else {
    scenes.forEach(scene => { visible.add(scene); update(scene); });
  }
  document.addEventListener('visibilitychange', () => scenes.forEach(update));
  reducedMotion.addEventListener('change', () => scenes.forEach(update));
})();
