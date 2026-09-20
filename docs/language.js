// Keep the current section when switching language; real links also work without JS.
function syncLanguageLinks() {
  document.querySelectorAll('a[data-language]').forEach(link => {
    const destination = new URL(link.getAttribute('href'), location.href);
    destination.hash = location.hash;
    link.href = destination.href;
  });
}
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);
