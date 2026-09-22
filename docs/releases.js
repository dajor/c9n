(() => {
  const card = document.querySelector('[data-release-card]');
  if (!card) return;
  const en = document.documentElement.lang === 'en';
  const badge = card.querySelector('.release-badge');
  const status = card.querySelector('[data-release-status]');
  const notes = card.querySelector('[data-release-notes]');
  const zip = card.querySelector('[data-release-zip]');
  const checksum = card.querySelector('[data-release-checksum]');
  const shell = card.querySelector('[data-release-shell]');
  status.textContent = en ? 'Checking the latest public release…' : 'Neueste öffentliche Version wird geprüft …';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  fetch('https://api.github.com/repos/dajor/c9n/releases?per_page=100', {
    headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal
  }).then(response => {
    if (!response.ok) throw new Error('release-unavailable');
    return response.json();
  }).then(releases => {
    if (!Array.isArray(releases)) throw new Error('invalid-response');
    const release = releases.filter(r => !r.draft && /^v?\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(r.tag_name) && r.published_at)
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0];
    if (!release) throw new Error('no-public-release');
    const version = release.tag_name.replace(/^v/, '');
    const url = 'https://github.com/dajor/c9n/releases/tag/' + encodeURIComponent(release.tag_name);
    badge.textContent = version + (release.prerelease ? (en ? ' · Preview' : ' · Vorabversion') : '');
    notes.href = url;
    notes.textContent = 'Release Notes · ' + version;
    const assets = Array.isArray(release.assets) ? release.assets : [];
    function assetLink(element, pattern) {
      const asset = assets.find(a => pattern.test(a.name) && typeof a.browser_download_url === 'string' && a.browser_download_url.startsWith('https://github.com/dajor/c9n/releases/download/'));
      element.hidden = !asset;
      if (asset) element.href = asset.browser_download_url;
    }
    assetLink(zip, /^c9n-installer-.*\.zip$/);
    assetLink(checksum, /^SHA256SUMS-installer\.txt$/);
    // The bundled shell installer belongs to the bundled release, never relabel it.
    if (version !== card.dataset.bundledVersion) assetLink(shell, /^(?:c9n-)?install\.sh$/);
    status.textContent = en ? 'Latest public release. Downloads belong to this version.' : 'Neueste öffentliche Version. Downloads gehören zu diesem Release.';
  }).catch(() => {
    status.textContent = en ? 'Live check unavailable. Showing the last known release; see all releases on GitHub.' : 'Live-Abfrage derzeit nicht möglich. Angezeigt wird der zuletzt bekannte Stand; alle Releases findest du auf GitHub.';
  }).finally(() => clearTimeout(timeout));
})();
