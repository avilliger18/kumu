# Technik und Betrieb

## Monorepo-Struktur

Der aktuelle Repo-Stand ist als Bun-Workspace mit Turborepo organisiert.

```text
kumu/
|- apps/
|  |- docs/
|  |- mobile/
|  `- web/
|- packages/
|  `- backend/
|- docs/
|- media/
|- package.json
`- turbo.json
```

## Frontends

### Web

- Framework: Next.js 16
- Einsatz: Supplier-Portal und veröffentlichte Web-Demo
- Hosting: Vercel

### Mobile

- Framework: Expo / React Native
- Navigation: Expo Router
- Scan: `expo-camera`

## Backend

- Ort im Repo: `packages/backend`
- Plattform: Convex
- Aufgaben:
  - Auth
  - Products
  - Suppliers
  - Notifications
  - Chats

## Aktuelle CI-Realität

Die GitHub-CI prüft aktuell parallel:

- `bun run format:check`
- `bun run lint`
- `bun run test:run`

Im aktuellen Workflow sind `build` und `typecheck` nicht Teil der Root-CI und
sollten daher in der Doku nicht als bereits aktive Pflichtchecks dargestellt
werden.

## Deployment

| Komponente | Aktueller Stand                         |
| ---------- | --------------------------------------- |
| Web-App    | Vercel Deployment vorhanden             |
| Backend    | Convex-Deployment vorhanden             |
| Mobile App | lokaler und Expo-basierter Demo-Betrieb |

## Technische Stärken

- ein gemeinsames Datenmodell für Web und Mobile
- TypeScript über alle Hauptteile hinweg
- echter Backend-Kern statt reinem Mock-Frontend
- Alerts, Notifications und Chat als echte Produktlogik

## Wichtige Grenzen

- Barcode-Ergebnisse sind Demo- und Testdaten
- nicht jeder Produktfluss ist bereits produktionsreif
- einzelne Funktionen, etwa Chat-Antworten oder tiefe Mobile-Produktionsansicht,
  sind noch als MVP beziehungsweise Platzhalter einzuordnen
