# Install c9n internally

**Early alpha for guided testing · Linux amd64 · Docker with Compose v2.** This installer contains configuration and instructions. Pilot customers receive the application image separately. The installer alone does not contain a runnable application. Community sharing, GPU routing and credits are not enabled.

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
