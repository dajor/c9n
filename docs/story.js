// Progressive enhancement: all five explanations remain readable without JavaScript.
(() => {
  const group = document.querySelector('.story-switch');
  if (!group) return;
  const buttons = [...group.querySelectorAll('[data-story]')];
  const panels = [...document.querySelectorAll('.story-panel')];
  function select(button) {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  select(buttons[0]);
  group.hidden = false;
})();
