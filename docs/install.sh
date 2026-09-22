#!/bin/sh
# c9n first-install launcher. Download this file before running it.
set -eu
command -v python3 >/dev/null 2>&1 || {
  echo 'Python 3 is required. On Ubuntu/Debian: sudo apt-get install python3' >&2
  exit 1
}
exec python3 - "$@" <<'PY'
import argparse
import hashlib
import json
import os
import platform
import re
import shutil
import socket
import stat
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path


def fail(message):
    raise RuntimeError(message)


def run(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.PIPE).strip()


def verify(path, checksums):
    entries = []
    for line in checksums.read_text().splitlines():
        match = re.fullmatch(r'([a-fA-F0-9]{64}) [ *](.+)', line)
        if match and match[2] == path.name:
            entries.append(match[1].lower())
    if len(entries) != 1:
        fail('Missing or ambiguous checksum for ' + path.name)
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    if digest.hexdigest() != entries[0]:
        fail('Checksum mismatch: ' + path.name + '. Nothing will be installed.')


def download(url, target):
    request = urllib.request.Request(url, headers={'User-Agent': 'c9n-installer/1.0'})
    with urllib.request.urlopen(request, timeout=60) as response, target.open('xb') as out:
        if urllib.parse.urlsplit(response.url).scheme != 'https':
            fail('HTTPS is required for release downloads.')
        shutil.copyfileobj(response, out)


def main():
    os.umask(0o077)
    p = argparse.ArgumentParser(prog='c9n-install.sh', description='Install c9n with a matching private pilot image. Linux amd64 and Docker Compose v2 required. Existing installations are never overwritten.')
    p.add_argument('--image', required=True, type=Path, help='Path to c9n-app-VERSION-linux-amd64.tar.gz supplied for your pilot')
    p.add_argument('--checksums', type=Path, help='Application checksums; defaults to SHA256SUMS-application.txt next to the image')
    p.add_argument('--directory', type=Path, default=Path('c9n'), help='New installation directory (default: ./c9n)')
    p.add_argument('--bundle-dir', type=Path, help='Use the matching installer ZIP and checksums from this directory instead of downloading')
    p.add_argument('--check', action='store_true', help='Download and verify packages only; do not load images, create the installation or start services')
    args = p.parse_args()
    image = args.image.expanduser().resolve(strict=True)
    match = re.fullmatch(r'c9n-app-((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.[1-9]\d*)?)-linux-amd64\.tar\.gz', image.name)
    if not match:
        fail('Use the original release filename: c9n-app-VERSION-linux-amd64.tar.gz')
    version = match[1]
    supplied_target = args.directory.expanduser().absolute()
    if supplied_target.exists() or supplied_target.is_symlink():
        fail('Installation directory already exists. Use the update procedure; no files were changed.')
    target = supplied_target.resolve()
    if not target.parent.is_dir():
        fail('The parent installation directory must already exist.')
    checksums = (args.checksums or image.parent / 'SHA256SUMS-application.txt').expanduser().resolve(strict=True)
    print('Checking c9n ' + version + ' application checksum…', flush=True)
    verify(image, checksums)
    if not args.check:
        if platform.system() != 'Linux' or platform.machine() not in ('x86_64', 'amd64'):
            fail('Installation requires a Linux amd64 server. Use --check to verify packages on another computer.')
        if not shutil.which('docker'):
            fail('Install Docker Engine and Compose v2 first: https://docs.docker.com/engine/install/')
        run('docker', 'compose', 'version')
        info = json.loads(run('docker', 'info', '--format', '{{json .}}'))
        if info.get('OSType') != 'linux' or info.get('Architecture') not in ('x86_64', 'amd64'):
            fail('The Docker engine must run Linux amd64.')
        context = json.loads(run('docker', 'context', 'inspect'))[0]
        host = os.environ.get('DOCKER_HOST') or context['Endpoints']['docker']['Host']
        if not host.startswith('unix://'):
            fail('Use a local Docker engine on the installation server, not a remote Docker context.')
        if run('docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=c9n'):
            fail('A c9n container already exists. Follow the update procedure.')
        volumes = run('docker', 'volume', 'ls', '--format', '{{.Name}}').splitlines()
        if 'c9n_data' in volumes or run('docker', 'volume', 'ls', '-q', '--filter', 'label=com.docker.compose.project=c9n'):
            fail('Existing c9n data found. This installer will not reuse or overwrite it.')
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', 8765))

    with tempfile.TemporaryDirectory(prefix='c9n-install-') as temp:
        temp = Path(temp)
        filename = 'c9n-installer-' + version + '.zip'
        if args.bundle_dir:
            bundle = args.bundle_dir.expanduser().resolve() / filename
            checksum = bundle.parent / 'SHA256SUMS-installer.txt'
        else:
            base = 'https://github.com/dajor/c9n/releases/download/v' + version + '/'
            bundle, checksum = temp / filename, temp / 'SHA256SUMS-installer.txt'
            print('Downloading matching public installer ' + version + '…', flush=True)
            download(base + filename, bundle)
            download(base + checksum.name, checksum)
        verify(bundle, checksum)
        prefix = 'c9n-' + version + '/'
        required = {'compose.yaml', 'install.sh', 'README.md', 'README.de.md', 'CHANGELOG.md', 'VERSION', 'IMAGE_ID'}
        optional = {'RELEASE_NOTES.md', 'updater.py', 'setup-updater.py', 'compose.updates.yaml', 'UPDATES.md'}
        with zipfile.ZipFile(bundle) as archive:
            files = archive.infolist()
            names = [f.filename for f in files]
            expected = {prefix + name for name in required}
            allowed = expected | {prefix + name for name in optional}
            if len(names) != len(set(names)) or not expected.issubset(names) or not set(names).issubset(allowed):
                fail('Installer contains missing, duplicate or unexpected files.')
            if sum(f.file_size for f in files) > 5 * 1024 * 1024:
                fail('Installer exceeds the allowed size.')
            if any(stat.S_IFMT(f.external_attr >> 16) not in (0, stat.S_IFREG) for f in files):
                fail('Installer contains a link or non-regular file.')
            if archive.read(prefix + 'VERSION').decode().strip() != version:
                fail('Installer version does not match the application.')
            expected_id = archive.read(prefix + 'IMAGE_ID').decode().strip()
            if not re.fullmatch(r'sha256:[a-f0-9]{64}', expected_id):
                fail('Invalid release image ID.')
            staging = temp / 'verified'
            staging.mkdir(mode=0o700)
            for member in files:
                (staging / member.filename[len(prefix):]).write_bytes(archive.read(member))
        print('Both package checksums and installer structure verified.', flush=True)
        if args.check:
            print('Check complete. No application installed or services started.')
            return
        print('Loading application image…', flush=True)
        subprocess.run(['docker', 'load', '-i', str(image)], check=True)
        loaded = json.loads(run('docker', 'image', 'inspect', 'c9n-app:' + version))[0]
        if loaded['Id'] != expected_id or (loaded['Os'], loaded['Architecture']) != ('linux', 'amd64'):
            fail('Loaded image does not match this release. Application was not started.')
        # Atomic creation refuses another installation that appeared since preflight.
        target.mkdir(mode=0o700, parents=False, exist_ok=False)
        for source in staging.iterdir():
            shutil.copyfile(source, target / source.name)
        print('Starting c9n in ' + str(target) + '…', flush=True)
        child_env = {key: value for key, value in os.environ.items()
                     if not key.startswith('COMPOSE_') and key not in {'C9N_IMAGE', 'CONNECTOR_SECRET_KEY'}}
        result = subprocess.run(['sh', str(target / 'install.sh')], cwd=target, env=child_env)
        if result.returncode:
            fail('Startup failed. Configuration is preserved in ' + str(target) + '. Inspect docker compose logs there; do not delete the data volume.')
        with urllib.request.urlopen('http://127.0.0.1:8765/api/health', timeout=10) as response:
            if json.load(response).get('status') != 'ok':
                fail('The application health check failed. Configuration and data were preserved.')
        with urllib.request.urlopen('http://127.0.0.1:8765/api/public-config', timeout=10) as response:
            if json.load(response).get('setup_required') is not True:
                fail('First-owner setup is not available. Inspect the installation before using it.')
        print('\nReady: http://127.0.0.1:8765 — create your first administrator.')
        print('Remote server: on your own computer run ssh -N -L 8765:127.0.0.1:8765 USER@SERVER')
        print('Then open http://127.0.0.1:8765 in your browser. No default account or setup code is required.')
        print('Back up ' + str(target) + '/.env together with the c9n_data Docker volume.')
        print('For team access, configure HTTPS separately. GPU installation and community sharing are not enabled.')


try:
    main()
except (RuntimeError, OSError, ValueError, KeyError, zipfile.BadZipFile, subprocess.CalledProcessError) as error:
    print('c9n installation stopped: ' + str(error), file=sys.stderr)
    sys.exit(1)
PY
