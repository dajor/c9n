// A non-modal disclosure: real links remain available when JavaScript is disabled.
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const button = header.querySelector('.menu-toggle');
  const panel = header.querySelector('.header-panel');
  const mobile = window.matchMedia('(max-width: 1000px)');
  let open = false;

  function update() {
    button.hidden = !mobile.matches;
    panel.hidden = mobile.matches && !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? button.dataset.closeLabel : button.dataset.openLabel);
  }
  function close(restoreFocus = false) {
    open = false;
    update();
    if (restoreFocus && mobile.matches) button.focus();
  }
  button.addEventListener('click', () => {
    open = !open;
    update();
  });
  panel.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches) return;
    close();
    const href = link.getAttribute('href');
    if (href.startsWith('#') && href.length > 1) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        target.tabIndex = -1;
        target.focus({preventScroll: true});
      }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (open && !header.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (open && !header.contains(event.target)) close();
  });
  mobile.addEventListener('change', () => {
    const focusInPanel = panel.contains(document.activeElement);
    const focusOnButton = document.activeElement === button;
    close(mobile.matches && focusInPanel);
    if (!mobile.matches && focusOnButton) header.querySelector('.logo').focus();
  });
  update();
})();
