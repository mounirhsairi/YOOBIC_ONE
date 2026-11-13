# Phase 2 — Core Feature Completion

Implemented on top of the MySQL foundation.

## 1. Task Templates & Recurrence
- **Model:** `TaskTemplate` with checklist, priority, photo/signature flags, recurrence rule/time/days.
- **Task fields:** `templateId`, `recurrenceRule`, `recurrenceParentId`, `isRecurringInstance`.
- **API:**
  - `GET/POST /api/v1/task-templates`
  - `PATCH/DELETE /api/v1/task-templates/:id`
  - `POST /api/v1/task-templates/:id/instantiate` — create one-off tasks from template
  - `POST /api/v1/task-templates/run-recurrence` — materialize today's instances for all active stores (idempotent)

## 2. File / Photo Upload
- Multer middleware (local `uploads/evidence/`, 15 MB, jpeg/png/webp/gif/pdf/mp4).
- `POST /api/v1/uploads` (multipart field `file`) → returns public URL under `/uploads/evidence/...`
- Static serving via Express.

## 3. Certificates (LMS)
- **Model:** `Certificate` with unique `certificateCode`, score, course link.
- Issued automatically when a quiz is passed (`POST .../quiz`).
- **API:**
  - `GET /api/v1/me/certificates`
  - `GET /api/v1/certificates` (org, paginated)
  - `GET /api/v1/certificates/:id`

## 4. Auto Notifications
- Service creates in-app notifications on:
  - Task assigned
  - Task submitted (to creator/manager)
  - Task approved / rejected
  - Certificate issued

## 5. Store Visits
- **Model:** `StoreVisit` (scheduled / ad-hoc / audit / coaching) with GPS optional fields.
- **API:**
  - `GET /api/v1/store-visits` (paginated, filters)
  - `POST /api/v1/store-visits`
  - `PATCH /api/v1/store-visits/:id`

## 6. Pagination
- `GET /api/v1/tasks` now returns `meta: { page, limit, total, totalPages }`
- Same pattern on store-visits and org certificates.

## Install note
After pull, run:
```bash
npm install
# multer was added to backend dependencies
npm run build --workspace=@yoobic/shared-types
npm run build --workspace=@yoobic/validation
```

Then start MySQL and the backend as documented in the root README.
