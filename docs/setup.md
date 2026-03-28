# Setup-Guide

Dieser Guide führt durch die vollständige lokale Einrichtung des Kumu-Monorepos.

---

## Vorbedingungen

| Tool                                           | Mindestversion | Prüfen                 |
| ---------------------------------------------- | -------------- | ---------------------- |
| [Bun](https://bun.sh)                          | 1.2+           | `bun --version`        |
| Node.js                                        | 18+            | `node --version`       |
| Git                                            | beliebig       | `git --version`        |
| [Convex-Account](https://dashboard.convex.dev) | –              | kostenlos registrieren |
| [Resend-Account](https://resend.com)           | –              | kostenlos registrieren |

Bun installieren (falls noch nicht vorhanden):

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 1. Repo klonen und Abhängigkeiten installieren

```bash
git clone https://github.com/avilliger18/kumu.git
cd kumu
bun install
```

---

## 2. Convex-Projekt einrichten

### 2a. Convex CLI einmalig anmelden

```bash
cd packages/backend
npx convex login
```

Der Browser öffnet sich für den Convex-Login.

### 2b. Entwicklungs-Deployment erstellen

```bash
npx convex dev
```

Beim ersten Aufruf fragt die CLI:

- **Neues Projekt erstellen** oder bestehendes verknüpfen
- Projektnamen vergeben (z. B. `kumu`)

Nach dem Start gibt die CLI zwei wichtige Werte aus:

```
✔  Convex functions ready!
   Deployment: dev:dein-deployment-name
   URL:        https://dein-deployment-name.convex.cloud
   Site URL:   https://dein-deployment-name.convex.site
```

Diese Werte werden in den nächsten Schritten benötigt. Terminal offen lassen – `npx convex dev` muss während der Entwicklung laufen.

---

## 3. Env-Dateien anlegen

### 3a. Backend – `packages/backend/.env.local`

Wird automatisch von `npx convex dev` erzeugt. Aussehen:

```env
CONVEX_DEPLOYMENT=dev:dein-deployment-name
CONVEX_URL=https://dein-deployment-name.convex.cloud
CONVEX_SITE_URL=https://dein-deployment-name.convex.site
```

Diese Datei nicht manuell anlegen – sie wird von der CLI verwaltet.

### 3b. Web – `apps/web/.env.local`

Datei anlegen (Vorlage: `apps/web/.env.example`):

```env
NEXT_PUBLIC_CONVEX_URL=https://dein-deployment-name.convex.cloud
```

### 3c. Mobile – `apps/mobile/.env.local`

Datei anlegen (Vorlage: `apps/mobile/.env.example`):

```env
EXPO_PUBLIC_CONVEX_URL=https://dein-deployment-name.convex.cloud
CONVEX_SITE_URL=https://dein-deployment-name.convex.site
```

---

## 4. Convex Dashboard – Environment Variables setzen

Die folgenden Variablen müssen im **Convex Dashboard** hinterlegt werden, nicht in einer lokalen `.env`-Datei. Sie laufen auf dem Convex-Server und sind für den Auth-Flow zwingend.

Dashboard öffnen: [dashboard.convex.dev](https://dashboard.convex.dev) → Projekt auswählen → **Settings → Environment Variables**

### Pflichtfelder

| Variable          | Wert                                                                            | Woher                       |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------- |
| `SITE_URL`        | `http://localhost:3000` (lokal) oder `https://kumu-web.vercel.app` (Produktion) | eigene App-URL              |
| `RESEND_API_KEY`  | `re_xxxxxxxxxxxxxxxxxxxx`                                                       | Resend Dashboard → API Keys |
| `JWT_PRIVATE_KEY` | generierter RSA-Private-Key                                                     | siehe unten                 |
| `JWKS`            | passender Public-Key als JWKS-JSON                                              | siehe unten                 |

### Optionale Felder

| Variable          | Standardwert                   | Beschreibung                  |
| ----------------- | ------------------------------ | ----------------------------- |
| `AUTH_EMAIL_FROM` | `Kumu <onboarding@resend.dev>` | Absenderadresse für OTP-Mails |

### JWT-Schlüsselpaar generieren

Convex Auth benötigt ein RSA-Schlüsselpaar für die Token-Signierung. Schlüssel einmalig generieren:

```bash
npx convex auth generate-keys
```

Die CLI gibt zwei Werte aus – `JWT_PRIVATE_KEY` und `JWKS` – direkt ins Dashboard einfügen.

Alternativ über die Convex CLI in einem Schritt:

```bash
npx @convex-dev/auth generate-keys
```

---

## 5. Resend einrichten

1. [resend.com](https://resend.com) → Account erstellen
2. **API Keys → Create API Key** → Schlüssel kopieren
3. Den Schlüssel als `RESEND_API_KEY` ins Convex Dashboard eintragen (Schritt 4)
4. Optional: eigene Absender-Domain unter **Domains** verifizieren, dann `AUTH_EMAIL_FROM` entsprechend setzen

Ohne eigene Domain funktioniert der Versand über `onboarding@resend.dev` nur an verifizierte Test-E-Mail-Adressen.

---

## 6. Projekt lokal starten

Drei Terminals öffnen:

**Terminal 1 – Backend (muss zuerst laufen)**

```bash
cd packages/backend
npx convex dev
```

**Terminal 2 – Web-App**

```bash
cd apps/web
bun dev
```

Web-App läuft auf [http://localhost:3000](http://localhost:3000).

**Terminal 3 – Mobile App**

```bash
cd apps/mobile
bun run start
```

Danach entweder:

- **Expo Go App** auf dem Handy öffnen und QR-Code scannen
- `i` drücken für iOS-Simulator (Mac erforderlich)
- `a` drücken für Android-Emulator

---

## 7. Alles auf einmal starten (optional)

Vom Repo-Root aus alle Apps parallel starten:

```bash
bun dev
```

Turborepo startet dann Backend, Web und Mobile gleichzeitig. Backend muss trotzdem separat mit `npx convex dev` laufen, da Convex eine eigene CLI-Session braucht.

---

## Übersicht aller Variablen

| Variable                 | Datei / Ort                          | Pflicht |
| ------------------------ | ------------------------------------ | ------- |
| `CONVEX_DEPLOYMENT`      | `packages/backend/.env.local` (auto) | ja      |
| `CONVEX_URL`             | `packages/backend/.env.local` (auto) | ja      |
| `CONVEX_SITE_URL`        | `packages/backend/.env.local` (auto) | ja      |
| `NEXT_PUBLIC_CONVEX_URL` | `apps/web/.env.local`                | ja      |
| `EXPO_PUBLIC_CONVEX_URL` | `apps/mobile/.env.local`             | ja      |
| `CONVEX_SITE_URL`        | `apps/mobile/.env.local`             | ja      |
| `SITE_URL`               | Convex Dashboard                     | ja      |
| `RESEND_API_KEY`         | Convex Dashboard                     | ja      |
| `JWT_PRIVATE_KEY`        | Convex Dashboard                     | ja      |
| `JWKS`                   | Convex Dashboard                     | ja      |
| `AUTH_EMAIL_FROM`        | Convex Dashboard                     | nein    |

---

## Häufige Fehler

**„Missing environment variable SITE_URL"**
→ `SITE_URL` im Convex Dashboard fehlt oder ist falsch gesetzt.

**OTP-E-Mail kommt nicht an**
→ `RESEND_API_KEY` prüfen. Bei Verwendung von `onboarding@resend.dev` muss die Empfängeradresse im Resend-Account verifiziert sein.

**„Could not find Convex deployment"**
→ `npx convex dev` im Verzeichnis `packages/backend` ausführen, nicht im Repo-Root.

**Expo startet, aber Daten laden nicht**
→ `EXPO_PUBLIC_CONVEX_URL` in `apps/mobile/.env.local` prüfen – muss exakt die URL aus dem Convex-Dashboard sein.
