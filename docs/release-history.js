// Direct version links open the native disclosure; notes also work without JS.
(() => {
  function revealVersion() {
    const version = document.getElementById(location.hash.slice(1));
    if (version instanceof HTMLDetailsElement) {
      version.open = true;
      version.scrollIntoView();
    }
  }
  revealVersion();
  window.addEventListener('hashchange', revealVersion);
})();
