// Illustrative role views only. Real access control belongs to the application server.
(() => {
  const group = document.querySelector('.access-switch');
  if (!group) return;
  const buttons = [...group.querySelectorAll('[data-access-role]')];
  const panels = [...document.querySelectorAll('.access-view')];
  group.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    panels.forEach(panel => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
  }));
})();
