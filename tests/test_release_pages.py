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

    def test_english_notes_and_markdown_link_use_the_same_translation(self):
        releases, notes = sync.public_releases([self.fixture()])
        original = sync.DOCS
        with tempfile.TemporaryDirectory() as directory:
            sync.DOCS = Path(directory)
            (sync.DOCS / 'releases').mkdir()
            (sync.DOCS / 'releases/1.2.3.en.md').write_text('# c9n 1.2.3\n\nAn English customer note.\n')
            (sync.DOCS / 'releases.en.html').write_text('<html lang="en"><header class="site-header"></header><!-- release-content:start --><!-- release-content:end -->')
            try:
                files = sync.generated_files(releases, notes)
                page = files[sync.DOCS / 'releases.en.html']
                self.assertIn('An English customer note.', page)
                self.assertIn('lang="en"', page)
                self.assertIn('href="releases/1.2.3.en.md" download', page)
                self.assertIn(sync.DOCS / 'releases/1.2.3.en.md', files)
            finally:
                sync.DOCS = original

    def test_missing_translation_keeps_original_language_and_download(self):
        release = self.fixture()
        releases, notes = sync.public_releases([release])
        original = sync.DOCS
        with tempfile.TemporaryDirectory() as directory:
            sync.DOCS = Path(directory)
            (sync.DOCS / 'releases.en.html').write_text('<html lang="en"><header class="site-header"></header><!-- release-content:start --><!-- release-content:end -->')
            try:
                page = sync.generated_files(releases, notes)[sync.DOCS / 'releases.en.html']
                self.assertIn('release-note-body" lang="de"', page)
                self.assertIn('href="releases/1.2.3.md" download', page)
            finally:
                sync.DOCS = original

    def test_wrong_version_translation_is_rejected_before_generation(self):
        releases, notes = sync.public_releases([self.fixture()])
        original = sync.DOCS
        with tempfile.TemporaryDirectory() as directory:
            sync.DOCS = Path(directory)
            (sync.DOCS / 'releases').mkdir()
            (sync.DOCS / 'releases/1.2.3.en.md').write_text('# c9n 1.2.2\n\nWrong version.\n')
            try:
                with self.assertRaisesRegex(ValueError, 'Wrong translation version'):
                    sync.generated_files(releases, notes)
            finally:
                sync.DOCS = original

    def test_release_date_is_displayed_in_berlin_time(self):
        self.assertEqual(sync.date_label('2026-10-10T23:40:00Z', 'de'), '11.10.2026')
        self.assertEqual(sync.date_label('2026-10-10T23:40:00Z', 'en'), '11 Oct 2026')


if __name__ == '__main__':
    unittest.main()
