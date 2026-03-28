# Produktüberblick

## Problem

Produktinformationen sind für Anwender oft verteilt, schwer verständlich und
nicht direkt mit Rückmeldungen aus der Lieferkette verbunden. Gleichzeitig
brauchen Supplier eine einfache Möglichkeit, Produktdaten, Lieferketteninfos
und Warnungen zentral zu pflegen.

## Ziel von Kumu

Kumu verbindet diese beiden Seiten:

- Anwender scannen ein Produkt und sehen strukturierte Produktinformationen.
- Supplier pflegen Produkte, Lieferkettenstationen und Alerts in einer Web-App.
- Das Backend verbindet Scan, Produktdaten, Chat und Notifications in einer
  gemeinsamen Datenbasis.

## Aktueller Produktumfang

| Bereich    | Aktueller Stand                                               |
| ---------- | ------------------------------------------------------------- |
| Web-App    | Supplier-Portal mit Company-, Products- und Alerts-Bereich    |
| Mobile App | OTP-Login, Scan, Verlauf, Produktdetail, KI Chats, Profil     |
| Backend    | Convex mit Auth, Products, Suppliers, Notifications und Chats |
| Live-Demo  | [kumu-web.vercel.app](https://kumu-web.vercel.app/)           |

## Kernfunktionen

| Funktion        | Kanal          | Beschreibung                                            |
| --------------- | -------------- | ------------------------------------------------------- |
| OTP-Login       | Web und Mobile | Sign-in per E-Mail-Code über Convex Auth                |
| Barcode-Scan    | Mobile         | Kamera-Scan öffnet die Produktdetailseite               |
| Produktdetail   | Mobile und Web | Produktinfos, Labels, Supply Chain, Footprint, Producer |
| Verlauf         | Mobile         | Letzte Scans pro Nutzer                                 |
| Chat            | Mobile         | Chat-Sessions pro Nutzer und Produkt                    |
| Supplier-Portal | Web            | Firmenprofil, Produkte, Lieferkettenpflege und Alerts   |
| Notifications   | Backend        | Fan-out von Produktwarnungen an betroffene Nutzer       |

## Demo-Realität

Kumu ist als echter Code und echte Deployment-Kette vorhanden. Für die Demo
gilt aber bewusst:

- Barcode-Ergebnisse sind gemockt
- Resultate sind Testdaten
- es findet keine echte globale Produktverifikation statt

## Nutzenversprechen

- Anwender erhalten Produktkontext deutlich schneller als über klassische
  Verpackungs- oder Suchlogik.
- Supplier können Informationen und Warnungen direkt an einer Stelle pflegen.
- Das System zeigt, wie Scan, Lieferkette und Benachrichtigung in einem
  gemeinsamen Produkt zusammenspielen.
