// Plays the isometric process figure once when it scrolls into view. Without JS or with
// reduced motion the finished picture is shown (CSS default).
(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('[data-flow-scene]')];
  if (!scenes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)) return;
  const seen = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.dataset.motion = 'playing';
    seen.unobserve(entry.target);
  }), { threshold: 0.35 });
  scenes.forEach(scene => { scene.dataset.motion = 'ready'; seen.observe(scene); });
})();
