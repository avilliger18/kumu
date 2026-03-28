# Testing und Demo

## Live-Demo

Die veroeffentlichte Web-App ist hier erreichbar:

[https://kumu-web.vercel.app/](https://kumu-web.vercel.app/)

Aktueller Stand:

- die Seite ist live
- sie startet mit einem Sign-in-Screen
- sie dient als Demo- und Testumgebung

## Demo-Grenzen

> Alle Barcode-Ergebnisse sind gemockt und liefern nur Testresultate.

Das bedeutet konkret:

- Scans und Produktabfragen zeigen Demo-Daten
- es gibt keine echte externe Produktaufloesung
- die Demo ist fuer UX, Produktfluss und Architekturgedanken gedacht

## Aktuelle Root-CI

Die Root-CI prueft derzeit genau diese drei Kommandos:

- `bun run format:check`
- `bun run lint`
- `bun run test:run`

Mehr sollte in diesem Dokument nicht als bereits aktiv behauptet werden.

## Sinnvolle Testszenarien

### Web

- Sign-in-Flow aufrufen
- Company-Profil pruefen
- Produkt anlegen oder bearbeiten
- Alert anlegen und aufloesen

### Mobile

- OTP-Flow anstossen
- Scan-Screen oeffnen und Kamera pruefen
- Produktdetail fuer Demo-Barcode aufrufen
- Verlauf pruefen
- Chat-Session starten

### Backend

- Produktabfrage ueber Barcode
- Scan-Aufzeichnung
- Alert-Erstellung
- Notification-Fan-out

## Wichtiger Bewertungsaspekt

Die Demo ist bewusst ehrlich eingegrenzt:

- kein falscher Anspruch auf echte globale Barcode-Verifikation
- klare Trennung zwischen Testdaten und realem Produktziel
- echter Code, echte Oberflaechen und echtes Deployment trotz Demo-Datenbasis
