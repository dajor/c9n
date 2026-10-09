import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('sync', Path(__file__).resolve().parents[1] / 'scripts/sync_releases.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class PublicReleasePages(unittest.TestCase):
    def fixture(self):
        return {'tag_name': 'v1.2.3', 'published_at': '2026-10-09T08:00:00Z',
                'prerelease': False, 'body': '# c9n 1.2.3\n\n## Changes\n\n- A customer change.\n\nSelf-hosted software for guided pilots.\nDistribution footer.',
                'assets': [{'name': 'c9n-installer-1.2.3.zip', 'browser_download_url': sync.REPO + '/releases/download/v1.2.3/c9n-installer-1.2.3.zip'}]}

    def test_only_published_versions_are_exported_with_customer_notes(self):
        release = self.fixture()
        older = {**release, 'tag_name': 'v1.2.2', 'published_at': '2026-10-08T08:00:00Z'}
        releases, notes = sync.public_releases([older, {**release, 'draft': True}, {**release, 'published_at': None}, {**release, 'tag_name': '../private'}, release])
        self.assertEqual([r['version'] for r in releases], ['1.2.3', '1.2.2'])
        self.assertEqual(notes['1.2.3'], '# c9n 1.2.3\n\n## Changes\n\n- A customer change.\n')

    def test_empty_malformed_missing_and_duplicate_releases_fail_before_writes(self):
        for payload in [[], {}, [{**self.fixture(), 'body': ''}], [self.fixture(), self.fixture()]]:
            with self.assertRaises(ValueError):
                sync.public_releases(payload)

    def test_release_html_cannot_inject_markup_or_execute_code(self):
        rendered = sync.markdown('# c9n 1.2.3\n\n## Safe\n\n- <script>alert(1)</script>\n  **review** `x < y`\n')
        self.assertNotIn('<script>', rendered)
        self.assertIn('&lt;script&gt;', rendered)
        self.assertIn('<strong>review</strong>', rendered)
        self.assertIn('<code>x &lt; y</code>', rendered)

    def test_future_release_updates_website_notes_and_downloads_together(self):
        releases, notes = sync.public_releases([self.fixture()])
        original = sync.DOCS
        with tempfile.TemporaryDirectory() as directory:
            sync.DOCS = Path(directory)
            (sync.DOCS / 'download.html').write_text('<html lang="de"><header class="site-header"></header><a class="site-version" data-site-version href="old">old</a><div data-site-version="0.2.0"><span class="release-badge">old</span><a data-release-zip href="old">ZIP</a><a data-release-application href="old">Image</a><a data-release-notes href="old">Notes</a></div>')
            (sync.DOCS / 'releases.html').write_text('<html lang="de"><header class="site-header"></header><!-- release-content:start --><!-- release-content:end -->')
            try:
                files = sync.generated_files(releases, notes)
                download = files[sync.DOCS / 'download.html']
                self.assertIn('releases.html#v1.2.3', download)
                self.assertIn('v1.2.3/c9n-installer-1.2.3.zip', download)
                self.assertIn('<a hidden data-release-application', download)
                self.assertIn('A customer change.', files[sync.DOCS / 'releases.html'])
            finally:
                sync.DOCS = original


if __name__ == '__main__':
    unittest.main()
