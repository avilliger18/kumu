# Lieferantenguide

## Einstieg in die Web-App

Die veröffentlichte Web-App ist unter
[https://kumu-web.vercel.app/](https://kumu-web.vercel.app/) erreichbar und
startet aktuell mit einem Sign-in-Screen.

Nach dem Login ist das Supplier-Portal in drei Hauptbereiche gegliedert:

- Company
- Products
- Alerts

## Firmenprofil

Im aktuellen UI lassen sich folgende Felder pflegen:

- legaler Firmenname
- Display-Name
- Country Code
- Website

Zusatzfelder wie Logo, Beschreibung oder Kontaktblock sind im aktuellen
Supplier-Formular noch nicht vorhanden und sollten daher nicht als fertige
Funktion beschrieben werden.

## Produkte

Supplier koennen Produkte anlegen, bearbeiten und löschen.

Aktuell pflegbare Felder:

- Titel
- Untertitel
- Kategorie
- Beschreibung
- Barcode
- Zutaten
- Naehrwerte pro 100g
- Supply-Chain-Schritte

Die Produktpflege ist bewusst funktional gehalten. Felder wie Bild-Upload,
Zertifikatsmanagement oder vollstaendige Verpackungsdaten sind im aktuellen UI
noch nicht ausgebaut.

## Supply-Chain-Daten

Jeder Lieferketten-Schritt kann im aktuellen Stand mit strukturierten Daten
erfasst werden, zum Beispiel:

- Typ
- Label
- Ort
- Geo-Koordinaten
- optionaler Transportmodus

Diese Daten werden fuer die Produktdarstellung und die Footprint-Berechnung
verwendet.

## Alerts

Im Alerts-Bereich koennen Supplier produktbezogene Warnungen anlegen.

Aktuell relevante Felder:

- Produkt
- Charge oder Lot-Nummer
- optionale betroffene Supply-Chain-Stufe
- Fehlerbeschreibung
- Severity: `low`, `medium`, `high`

Nach dem Erstellen bleibt ein Alert offen, bis er explizit als gelöst markiert
wird.

## Was aktuell nicht im Web-Portal liegt

Im aktuellen Repo gibt es keinen voll ausgebauten Supplier-Chat im Web-Portal.
Chat-Sessions sind primar in der Mobile App sichtbar und backendseitig
vorhanden.
