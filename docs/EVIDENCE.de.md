# Nachweise und aktueller Entwicklungsstand

Aktueller Produktfokus: 9. Oktober 2026.

Der Neuaufbau konzentriert sich auf Prozesse, Agentenschritte und menschliche Freigaben. Die vorhandenen Hub-Agentenfunktionen sind die Grundlage; die neue Prozessausführung mit verbindlichen Freigabepausen und zugehörigen Zugängen muss noch abgenommen werden. Ein gezeichneter Ablauf ist kein Nachweis, dass jeder Schritt verbindlich ausgeführt wird. Die Website erklärt diesen Aufbau mit fiktiven Beispielen.

## Historischer Prüfstand · 20. September 2026

Die nachfolgenden Prüfungen dokumentieren den früheren Prototyp. Projekte, Wissen und Design sind vorerst keine eigenen Bereiche des ersten Neuaufbaus. Diese älteren Prüfungen bestätigen keine neue Prozessengine.

Die Screenshots zeigen die echte lokale Anwendung mit einer Beispielorganisation. Sie sind keine Kundenfallstudien. Produktcode und interne Tests bleiben derzeit privat; aus diesem Repository lassen sich deshalb nicht alle Anwendungstests unabhängig wiederholen.

### Im früheren lokalen Prototyp geprüft

- Unternehmenslandkarte: Bereiche und Rollen auswählen, Heute/Zielbild wechseln, suchen, zoomen, verschieben, Listenansicht per Tastatur und Vollbildpräsentation.
- Gespeichertes Design: über die Zeichenfläche bearbeiten, speichern, erneut laden und zur Organisation zurückkehren.
- Wissen: Notizen und begrenzte Text-PDFs erfassen, menschlich prüfen, versioniert ablegen und Folgeaufgaben erstellen.
- Dashboard: persönliche Bausteine, Projektauswahl und berechtigte Wissenskennzahlen.
- Navigation: Wissensbereich und verknüpften Advanced-Workflow öffnen.
- Darstellung: Desktop sowie Mobilansicht mit 390 Pixeln Breite ohne seitlichen Seitenüberlauf.

Die Browserprüfungen der Unternehmenslandkarte liefen ohne JavaScript-Fehler durch. Der Produktionsbuild war erfolgreich. Das sind Funktionsprüfungen des Prototyps, keine Sicherheitszertifizierung oder Lastprüfung.

### Grenzen des früheren Prototyps

Eine gestaltete KI-Rolle bedeutet noch nicht, dass ein Agent läuft. Die Workflow-Editoren können mehr darstellen, als die aktuelle Ausführung unterstützt. Karten, Ablauf und Anbieter müssen für den jeweiligen Einsatz geprüft werden.

Der frühere Wissensumfang umfasst Notizen, Text-PDFs und Links mit bereitgestellten Auszügen. Allgemeiner Webseitenimport, Video-/Audiotranskription, OCR und semantische Suche gehören nicht zu diesem geprüften Umfang. Modellaufrufe benötigen eine eingerichtete Verbindung und freigegebene Testdaten.

Geschäftliche Messungen enthalten derzeit auch manuell erfasste Beobachtungen mit Quelle und Zeitraum. Es gibt noch keine veröffentlichten, unabhängig bestätigten Kundeneinsparungen. Eine öffentlich zugängliche App sowie eine allgemeine Self-Hosting- oder Open-Source-Veröffentlichung stehen aus.

## So wird eine Wirkungsaussage belastbar

Ausgangslage und Pilot an vergleichbaren Aufgaben messen. Qualitätsmaßstab, Quelle, Zeitraum, Fallzahl, aktiven Aufwand und Prüfzeit dokumentieren. Fehler und Nacharbeit mit erfassen. Kundenergebnisse erst nach Prüfung und Zustimmung veröffentlichen.

[Messvorlage](../templates/measurement.csv) · [Entwicklungsplan](ROADMAP.de.md) · [English](EVIDENCE.md)
