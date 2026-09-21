# c9n intern installieren

**Alpha für begleitete Tests · Linux amd64 · Docker mit Compose v2.** Dieses kleine Installationspaket enthält Konfiguration und Anleitung. Das Anwendungsimage wird Pilotkunden separat bereitgestellt; der Download allein enthält keine lauffähige Anwendung. Community-Gateway, GPU-Sharing und Credits sind noch nicht aktiviert.

1. Installer-ZIP und separat bereitgestelltes Anwendungsarchiv samt Prüfsummen herunterladen. `sha256sum -c SHA256SUMS-installer.txt` ausführen (macOS: `shasum -a 256 -c SHA256SUMS-installer.txt`).
Die separate Datei `SHA256SUMS-application.txt` prüft das Anwendungsarchiv auf dieselbe Weise.
2. ZIP in ein neues Verzeichnis entpacken. `docker load -i c9n-app-<Version>-linux-amd64.tar.gz` ausführen.
3. Im entpackten Verzeichnis `sh install.sh` ausführen. Der Installer prüft die Image-ID, erzeugt einen lokalen Verschlüsselungsschlüssel und startet die Anwendung mit einem persistenten Docker-Volume.
4. Auf demselben Rechner `http://127.0.0.1:8765` öffnen und den ersten Administrator einrichten. Bei einem entfernten Server zuvor einen SSH-Tunnel auf diesen lokalen Port öffnen. Es gibt kein voreingestelltes Benutzerkonto.

Die Anwendung ist zunächst ausschließlich über Loopback erreichbar. Für Teamzugang einen internen HTTPS-Reverse-Proxy einsetzen und `COOKIE_SECURE` auf `1` setzen. Keine bloße Freigabe von Port 8765 ins Internet. Der erste Administrator beansprucht die frische Installation: Einrichtung abschließen, bevor Teamzugang bereitgestellt wird.

Design, Wissen und Workflows laufen im eigenen Docker-Host. Modellzugänge werden in der Anwendung hinterlegt; Modellkosten und GPU-Hardware sind separat. Diese Installation richtet keinen Cloudflare-Tunnel ein und gibt keine Modelle an die Community frei.

## Betrieb und Updates

- Status: `docker compose ps`; stoppen: `docker compose stop`; starten: `docker compose up -d`.
- Daten liegen im benannten Volume `<Compose-Projekt>_data` (Standard `c9n_data`). `.env` enthält den individuellen Verschlüsselungsschlüssel; zusammen mit dem Datenvolume vertraulich sichern. Ohne diesen Schlüssel können gespeicherte Modellzugänge nicht entschlüsselt werden.
- Vor Updates Anwendung stoppen und Datenvolume sowie `.env` konsistent sichern. Wiederherstellung zuerst in einer getrennten Testinstallation prüfen. Nie `docker compose down -v` zum Aktualisieren verwenden: Das würde Daten löschen.
- Updates benötigen eine konkrete neue Version und ihre Anleitung. Der Erstinstaller überschreibt eine vorhandene `.env` nicht. Image-Rollback stellt Datenmigrationen nicht zurück.
- Für mehrere Installationen auf einem Host unterschiedliche Compose-Projektnamen und Loopback-Ports wählen.
- Produktcode und Nutzungsrechte sind derzeit privat. Keine Open-Source-Lizenz wird durch diesen Download vergeben. Pilotzugang: https://c9n.app/#contact
