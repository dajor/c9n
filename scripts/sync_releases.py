"""Publish release notes from public GitHub releases, without application sources."""
import argparse
import html
import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
VERSION = re.compile(r'v?(\d+\.\d+\.\d+(?:-[\w.-]+)?)')
REPO = 'https://github.com/dajor/c9n'


def inline(text):
    # Escape source text before adding markup. Release bodies cannot inject HTML.
    parts = re.split(r'(`[^`]+`)', text)
    result = []
    for part in parts:
        if part.startswith('`') and part.endswith('`'):
            result.append('<code>' + html.escape(part[1:-1]) + '</code>')
        else:
            escaped = html.escape(part)
            escaped = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', escaped)
            result.append(escaped)
    return ''.join(result)


def markdown(text):
    """Render the headings, paragraphs and lists used by our customer notes."""
    output, paragraph, items = [], [], []
    list_kind = None

    def flush():
        nonlocal list_kind
        if paragraph:
            output.append('<p>' + inline(' '.join(paragraph)) + '</p>')
            paragraph.clear()
        if items:
            output.append(f'<{list_kind}>' + ''.join('<li>' + inline(item) + '</li>' for item in items) + f'</{list_kind}>')
            items.clear()
            list_kind = None

    for line in text.splitlines():
        if not line.strip():
            flush()
            continue
        heading = re.match(r'^(#{1,6}) (.+)$', line)
        bullet = re.match(r'^(- |\d+\. )(.+)$', line)
        if heading:
            flush()
            if len(heading[1]) == 1:
                continue  # The article supplies the version heading.
            level = min(len(heading[1]) + 1, 6)
            output.append(f'<h{level}>' + inline(heading[2]) + f'</h{level}>')
        elif bullet:
            kind = 'ul' if bullet[1] == '- ' else 'ol'
            if paragraph or list_kind not in (None, kind):
                flush()
            list_kind = kind
            items.append(bullet[2])
        elif items and line.startswith('  '):
            items[-1] += ' ' + line.strip()
        else:
            if items:
                flush()
            paragraph.append(line.strip())
    flush()
    return ''.join(output)


def public_releases(payload):
    if not isinstance(payload, list):
        raise ValueError('Expected public GitHub releases')
    releases, notes = [], {}
    for release in payload:
        match = VERSION.fullmatch(release.get('tag_name', ''))
        if release.get('draft') or not match or not release.get('published_at'):
            continue
        version = match[1]
        published = release['published_at']
        datetime.fromisoformat(published.replace('Z', '+00:00'))
        body = release.get('body')
        if not isinstance(body, str) or not body.strip():
            raise ValueError('Missing notes for ' + version)
        # The publisher appends a distribution footer after the customer notes.
        note = body.split('\n\nSelf-hosted software for guided pilots.', 1)[0].rstrip() + '\n'
        assets = {}
        for asset in release.get('assets', []):
            name, url = asset.get('name', ''), asset.get('browser_download_url', '')
            prefix = REPO + '/releases/download/' + release['tag_name'] + '/'
            if url == prefix + name and '/' not in name:
                assets[name] = url
        releases.append({'version': version, 'tag': release['tag_name'], 'published_at': published,
                         'prerelease': bool(release.get('prerelease')), 'url': REPO + '/releases/tag/' + release['tag_name'],
                         'notes': 'releases/' + version + '.md', 'notes_language': 'de' if note.startswith('# c9n ') else 'en',
                         'assets': assets})
        notes[version] = note
    releases.sort(key=lambda release: release['published_at'], reverse=True)
    if not releases or len(notes) != len(releases):
        raise ValueError('No public releases or duplicate versions')
    return releases, notes


def date_label(timestamp, lang):
    date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).astimezone(ZoneInfo('Europe/Berlin'))
    return date.strftime('%d.%m.%Y' if lang == 'de' else '%d %b %Y')


def notes_article(release, note, lang, current):
    version = release['version']
    preview = (' · Vorabversion' if lang == 'de' else ' · Preview') if release['prerelease'] else ''
    date = date_label(release['published_at'], lang)
    links = (f'<div class="release-source-links"><a href="{release["notes"]}" download>Markdown</a>'
             f'<a href="{release["url"]}">GitHub Release ↗</a></div>')
    body = f'<div class="release-note-body" lang="{release["notes_language"]}">{markdown(note)}{links}</div>'
    if current:
        return (f'<article class="release-current" id="v{version}"><p class="eyebrow">'
                + ('AKTUELLE ÖFFENTLICHE VERSION' if lang == 'de' else 'LATEST PUBLIC RELEASE')
                + f'</p><h2>c9n {version}{preview}</h2><p class="release-date"><time datetime="{release["published_at"]}">{date}</time></p>' + body + '</article>')
    return (f'<details class="release-entry" id="v{version}"><summary><span class="release-summary-row">'
            f'<strong>c9n {version}{preview}</strong><time datetime="{release["published_at"]}">{date}</time></span></summary>' + body + '</details>')


def generated_files(releases, notes):
    latest = releases[0]
    version = latest['version']
    files = {DOCS / release['notes']: notes[release['version']] for release in releases}
    translations = {}
    for release in releases:
        translated_path = DOCS / 'releases' / (release['version'] + '.en.md')
        if translated_path.exists():
            translated = translated_path.read_text()
            if not translated.startswith('# c9n ' + release['version'] + '\n'):
                raise ValueError('Wrong translation version: ' + release['version'])
            translations[release['version']] = translated
            files[translated_path] = translated
    files[DOCS / 'release-data.json'] = json.dumps({'releases': releases}, ensure_ascii=False, indent=2) + '\n'
    for path in sorted(DOCS.glob('*.html')):
        text = path.read_text()
        if 'class="site-header"' not in text:
            continue
        lang = 'en' if '<html lang="en">' in text else 'de'
        page = 'releases.en.html' if lang == 'en' else 'releases.html'
        preview = (' · Preview' if lang == 'en' else ' · Vorabversion') if latest['prerelease'] else ''
        version_link = f'<a class="site-version" data-site-version href="{page}#v{version}">c9n {version}{preview} · Release Notes</a>'
        text = re.sub(r'<a class="site-version" data-site-version[^>]*>.*?</a>', lambda _: version_link, text)
        if path.name == page:
            def render_release(release, current):
                translated = translations.get(release['version']) if lang == 'en' else None
                localized = {**release, 'notes': 'releases/' + release['version'] + '.en.md', 'notes_language': 'en'} if translated else release
                return notes_article(localized, translated or notes[release['version']], lang, current)
            current = render_release(latest, True)
            history = ''.join(render_release(release, False) for release in releases[1:])
            generated = (current + '<section class="release-history-section" aria-labelledby="history-title"><h2 id="history-title">'
                         + ('Frühere Versionen' if lang == 'de' else 'Previous releases') + '</h2>' + history + '</section>')
            text = re.sub(r'<!-- release-content:start -->.*?<!-- release-content:end -->', lambda _: '<!-- release-content:start -->' + generated + '<!-- release-content:end -->', text, flags=re.S)
        if path.name in ('download.html', 'download.en.html'):
            # Each download is tied to the published version, never to local VERSION.
            text = re.sub(r'data-site-version="[^"]*"', 'data-site-version="' + version + '"', text)
            text = re.sub(r'<span class="release-badge">.*?</span>', '<span class="release-badge">' + version + preview + '</span>', text)
            text = re.sub(r'(<a[^>]*data-release-notes[^>]*href=")[^"]*("[^>]*>).*?</a>', lambda m: m[1] + page + '#v' + version + m[2] + 'Release Notes · ' + version + '</a>', text)
            for attribute, name in [('zip', 'c9n-installer-' + version + '.zip'), ('application', 'c9n-app-' + version + '-linux-amd64.tar.gz'), ('checksum', 'SHA256SUMS-installer.txt')]:
                url = latest['assets'].get(name)
                def download_link(match):
                    link = match[0]
                    link = re.sub(r'\s+hidden(?:="[^"]*")?', '', link)
                    if url:
                        link = re.sub(r'href="[^"]*"', 'href="' + html.escape(url, quote=True) + '"', link)
                    else:
                        link = link.replace('<a ', '<a hidden ')
                    return link
                text = re.sub(r'<a[^>]*data-release-' + attribute + r'[^>]*>.*?</a>', download_link, text)
        files[path] = text
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Read published releases from GitHub')
    parser.add_argument('--source', type=Path, help='Read an already fetched public GitHub response')
    parser.add_argument('--check', action='store_true', help='Check generated pages against the saved public snapshot')
    args = parser.parse_args()
    if args.refresh or args.source:
        if args.source:
            payload = json.loads(args.source.read_text())
        else:
            payload, page = [], 1
            while True:
                request = Request(f'https://api.github.com/repos/dajor/c9n/releases?per_page=100&page={page}', headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'c9n-release-pages'})
                with urlopen(request, timeout=30) as response:
                    batch = json.load(response)
                if not isinstance(batch, list):
                    raise ValueError('Expected public GitHub releases')
                payload.extend(batch)
                if len(batch) < 100:
                    break
                page += 1
        releases, notes = public_releases(payload)
    else:
        releases = json.loads((DOCS / 'release-data.json').read_text())['releases']
        notes = {release['version']: (DOCS / release['notes']).read_text() for release in releases}
    files = generated_files(releases, notes)
    changed = [str(path.relative_to(ROOT)) for path, text in files.items() if not path.exists() or path.read_text() != text]
    if args.check:
        if changed:
            raise SystemExit('Release pages out of sync: ' + ', '.join(changed))
    else:
        for path, text in files.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
        for path in (DOCS / 'releases').glob('*.md'):
            if path not in files:
                path.unlink()
    print(f'{len(releases)} public releases; latest {releases[0]["version"]}; {len(changed)} generated files changed.')


if __name__ == '__main__':
    main()
