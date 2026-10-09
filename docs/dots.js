// The artwork is already in the HTML. Enhancement adds a single, bounded scene.
(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('[data-dots-scene]')];
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
      // The handoff owns the scene's 4.8-second clock; limb animations finish earlier.
      if (event.animationName === 'dots-handoff') scene.dataset.motion = 'done';
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
