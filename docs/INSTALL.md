# Install c9n internally

**Early alpha for guided testing · Linux amd64 · Docker with Compose v2.** This installer contains configuration and instructions. Pilot customers receive the application image separately. The installer alone does not contain a runnable application. Community sharing, GPU routing and credits are not enabled.

## Install with a shell script

Requirements: Linux amd64, Docker Engine with Compose v2, Python 3 and curl. Place the separately supplied pilot image and `SHA256SUMS-application.txt` in the same directory. Replace `VERSION` below with the version in the image filename. The script downloads the matching public installer, checks both packages, loads the image and starts c9n with persistent storage.

```sh
curl -fL https://c9n.app/install.sh -o c9n-install.sh
curl -fL https://c9n.app/install.sh.sha256 -o c9n-install.sh.sha256
sha256sum -c c9n-install.sh.sha256
sh c9n-install.sh --image ./c9n-app-VERSION-linux-amd64.tar.gz
```

The script creates `./c9n`. If your user cannot access Docker, run the same command with `sudo sh`. Add `--check` to verify packages without installation. Use `--bundle-dir /path/to/packages` for a previously downloaded installer and its `SHA256SUMS-installer.txt`. Existing installations and data volumes are never overwritten. The script does not install Docker or GPU models, or configure public HTTPS.

After startup, open `http://127.0.0.1:8765`. For a remote server, first run `ssh -N -L 8765:127.0.0.1:8765 USER@SERVER` on your own computer. The installer checks that first-owner setup is available.

## Alternative: manual installation

1. Download the installer and the separately supplied application archive with their checksums. Run `sha256sum -c SHA256SUMS-installer.txt` (macOS: `shasum -a 256 -c SHA256SUMS-installer.txt`).
Use the separate `SHA256SUMS-application.txt` to verify the application archive in the same way.
2. Extract the installer into a new directory. Load the application with `docker load -i c9n-app-<version>-linux-amd64.tar.gz`.
3. Run `sh install.sh` inside the extracted folder. It verifies the exact image ID, generates a local encryption key and starts a persistent Docker installation.
4. Visit `http://127.0.0.1:8765` on that host to create the first administrator. For a remote server, first use an SSH tunnel to its loopback port. No account is preconfigured.

Only loopback is exposed. For team access, configure an internal HTTPS reverse proxy and set `COOKIE_SECURE` to `1`. Complete first-owner setup before enabling team access. Do not expose port 8765 directly to the Internet.

Designs, knowledge and workflows run on your own host. Model credentials are configured in the application; inference costs and GPU hardware are separate. This installer creates no Cloudflare tunnel and publishes no community models.

## Operation and updates

`docker compose ps` shows status; `docker compose stop` stops the application. Keep the named data volume (default `c9n_data`) and `.env` encryption key backed up together and confidential. Stop the application for a consistent backup and test recovery in a separate installation. Never use `docker compose down -v` for updates; it deletes the data volume.

Updates use explicit versions and migration instructions. The initial installer refuses to overwrite an existing `.env`. Rolling back the image does not undo database migrations. Multiple installations require different Compose project names and loopback ports.

Application distribution remains private; this download grants no new Open Source licence. Request pilot access: https://c9n.app/en.html#contact

## Optional: host on DigitalOcean

The [DigitalOcean guide](https://c9n.app/digitalocean.en.html) explains how to set up a Docker Droplet and then install c9n. The application image is supplied separately through the pilot program; hosting is billed to your own DigitalOcean account.
