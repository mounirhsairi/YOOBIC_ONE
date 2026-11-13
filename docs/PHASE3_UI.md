# Phase 3 — Admin Web & Mobile polish

## API client
- `@yoobic/api-client` extended with:
  - Task templates CRUD + instantiate + run-recurrence
  - Store visits list/create/update
  - Certificates (me + org)
  - File upload (`uploadFile`)

## Admin Web (`apps/admin-web`)
- New sidebar tabs:
  - **Modèles de missions** — list templates, recurrence status, “Lancer la récurrence du jour”
  - **Certificats** — table of issued certificates (user, course, score, code, date)
- Data loading includes templates + certificates from the live API

## Mobile (`apps/mobile`)
- Learning tab:
  - Loads `listMyCertificates()`
  - Shows “Mes certificats” above the course list (code, score, issue date)
- Uses shared `YoobicApiClient` so all Phase 2 endpoints are available after package rebuild

## Rebuild shared packages after pull
```bash
npm run build --workspace=@yoobic/shared-types
npm run build --workspace=@yoobic/validation
npm run build --workspace=@yoobic/api-client
```

## Continuation updates

### Seed
- Two recurring **TaskTemplate**s are created for demo org:
  - Checklist Ouverture Magasin (daily 07:30, Mon–Sat)
  - Relevé température meubles froids (daily 10:00, every day)
- Also created when re-seeding an existing org that has no templates.
- Permission `tasks.manage` added for ORG_OWNER.

### Mobile tasks
- On mission submit, local camera/gallery photos are uploaded via `POST /api/v1/uploads` when online.
- Remote sample URLs are kept as-is; failures fall back to offline queue with local URIs.

### API client
- `uploadFile` accepts React Native `{ uri, name, type }` descriptors.
