# Anwenderguide

## Einstieg

Der aktuelle Hauptfluss für Anwender liegt in der Mobile App:

1. E-Mail eingeben
2. OTP-Code bestätigen
3. Barcode scannen
4. Produktinformationen lesen
5. Verlauf und Chat nutzen

## Login

Kumu verwendet Convex Auth mit OTP-Flow.

- In der UI geben Anwender ihre E-Mail-Adresse ein.
- Danach wird ein Code bestätigt.
- Im aktuellen Repo nutzt der Backend-Provider `console-otp`.
- Für lokale Entwicklung bedeutet das: Der Code wird im Backend-Log
  ausgegeben, nicht zwingend als produktionsreife E-Mail zugestellt.

## Barcode-Scan

Die Mobile App verwendet die Kamera und unterstützt mehrere Barcode-Typen.

Aktueller Ablauf:

1. Scan-Tab öffnen
2. Kamera-Berechtigung erlauben
3. Barcode in den Scanbereich halten
4. Produktseite wird direkt geöffnet

## Demo-Hinweis

> Alle Barcode-Ergebnisse sind Testresultate.
> Für die Demo werden nur gemockte Produktdaten angezeigt.

## Produktdetailseite

Die Produktansicht zeigt, sofern Daten vorhanden sind:

- Produktbild und Produktname
- Produzent
- Barcode
- Kumu Score
- Labels
- Zutaten
- Nährwerte
- Zusatzstoffe
- Supply-Chain-Einstieg
- ökologischen Fussabdruck
- Batch-Traceability

## Verlauf

Im Overview-Bereich sehen Anwender ihre letzten Scans mit:

- Produktname oder Barcode
- Produzent
- Zeitpunkt
- Bildvorschau

## Chat

Chats können aktuell in der Mobile App genutzt werden:

- produktbezogen über den AI-Button auf der Produktseite
- allgemein über den Chats-Tab

Sessions und Nachrichten werden gespeichert. Der aktuelle AI-Text ist jedoch
noch ein Platzhalter und keine fachlich generierte Antwort.

## Profil

Die Profilansicht bietet aktuell vor allem:

- Kontobereich
- Navigation zu Einstellungen
- Logout

Nicht alle angezeigten Profildaten sind bereits voll dynamisch an das Backend
gebunden.
