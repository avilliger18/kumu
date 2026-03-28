# Anwenderguide

## Einstieg

Der aktuelle Hauptfluss fuer Anwender liegt in der Mobile App:

1. E-Mail eingeben
2. OTP-Code bestaetigen
3. Barcode scannen
4. Produktinformationen lesen
5. Verlauf und Chat nutzen

## Login

Kumu verwendet Convex Auth mit OTP-Flow.

- In der UI geben Anwender ihre E-Mail-Adresse ein.
- Danach wird ein Code bestaetigt.
- Im aktuellen Repo nutzt der Backend-Provider `console-otp`.
- Fuer lokale Entwicklung bedeutet das: Der Code wird im Backend-Log
  ausgegeben, nicht zwingend als produktionsreife E-Mail zugestellt.

## Barcode-Scan

Die Mobile App verwendet die Kamera und unterstuetzt mehrere Barcode-Typen.

Aktueller Ablauf:

1. Scan-Tab oeffnen
2. Kamera-Berechtigung erlauben
3. Barcode in den Scanbereich halten
4. Produktseite wird direkt geoeffnet

## Demo-Hinweis

> Alle Barcode-Ergebnisse sind Testresultate.
> Fuer die Demo werden nur gemockte Produktdaten angezeigt.

## Produktdetailseite

Die Produktansicht zeigt, sofern Daten vorhanden sind:

- Produktbild und Produktname
- Produzent
- Barcode
- Kumu Score
- Labels
- Zutaten
- Naehrwerte
- Zusatzstoffe
- Supply-Chain-Einstieg
- oekologischen Fussabdruck
- Batch-Traceability

## Verlauf

Im Overview-Bereich sehen Anwender ihre letzten Scans mit:

- Produktname oder Barcode
- Produzent
- Zeitpunkt
- Bildvorschau

## Chat

Chats koennen aktuell in der Mobile App genutzt werden:

- produktbezogen ueber den AI-Button auf der Produktseite
- allgemein ueber den Chats-Tab

Sessions und Nachrichten werden gespeichert. Der aktuelle AI-Text ist jedoch
noch ein Platzhalter und keine fachlich generierte Antwort.

## Profil

Die Profilansicht bietet aktuell vor allem:

- Kontobereich
- Navigation zu Einstellungen
- Logout

Nicht alle angezeigten Profildaten sind bereits voll dynamisch an das Backend
gebunden.
