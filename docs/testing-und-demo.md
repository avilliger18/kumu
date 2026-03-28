# Testing und Demo

## Live-Demo

Die veröffentlichte Web-App ist hier erreichbar:

[https://kumu-web.vercel.app/](https://kumu-web.vercel.app/)

Aktueller Stand:

- die Seite ist live
- sie startet mit einem Sign-in-Screen
- sie dient als Demo- und Testumgebung

## Demo-Grenzen

> Alle Barcode-Ergebnisse sind gemockt und liefern nur Testresultate.

Das bedeutet konkret:

- Scans und Produktabfragen zeigen Demo-Daten
- es gibt keine echte externe Produktauflösung
- die Demo ist für UX, Produktfluss und Architekturgedanken gedacht

## Aktuelle Root-CI

Die Root-CI prüft derzeit genau diese drei Kommandos:

- `bun run format:check`
- `bun run lint`
- `bun run test:run`

Mehr sollte in diesem Dokument nicht als bereits aktiv behauptet werden.

## Sinnvolle Testszenarien

### Web

- Sign-in-Flow aufrufen
- Company-Profil prüfen
- Produkt anlegen oder bearbeiten
- Alert anlegen und auflösen

### Mobile

- OTP-Flow anstossen
- Scan-Screen öffnen und Kamera prüfen
- Produktdetail für Demo-Barcode aufrufen
- Verlauf prüfen
- Chat-Session starten

### Backend

- Produktabfrage über Barcode
- Scan-Aufzeichnung
- Alert-Erstellung
- Notification-Fan-out

## Wichtiger Bewertungsaspekt

Die Demo ist bewusst ehrlich eingegrenzt:

- kein falscher Anspruch auf echte globale Barcode-Verifikation
- klare Trennung zwischen Testdaten und realem Produktziel
- echter Code, echte Oberflächen und echtes Deployment trotz Demo-Datenbasis
