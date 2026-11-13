# YOOBIC ONE — Enterprise Frontline Operations Platform

Multi-tenant SaaS platform inspired by **YOOBIC ONE** for frontline operations, task management, communication, audits and mobile learning.

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Backend      | Node.js 22, Express, TypeScript, Sequelize      |
| Database     | **MySQL 8** (primary) · SQLite (tests only)     |
| Cache / Queue| Redis 7                                         |
| Admin Web    | Next.js 14, Tailwind, TanStack Query            |
| Mobile       | Expo 51, Expo Router, Expo SQLite, offline queue|
| Real-time    | Socket.IO (JWT-authenticated)                   |

## Quick Start (MySQL via Docker — recommended)

### 1. Prerequisites
- Docker + Docker Compose
- Node.js 20+ / 22
- npm 10+

### 2. Start infrastructure
```bash
# From the monorepo root
docker compose up -d mysql redis
```

Wait until MySQL is healthy (≈ 20–40 s):
```bash
docker compose ps
# or
docker logs yoobic_mysql
```

### 3. Environment
```bash
cp .env.example .env
# The default .env already matches docker-compose credentials:
#   DB_USER=yoobic  DB_PASSWORD=yoobic_secret  DB_NAME=yoobic_one
```

### 4. Install & build shared packages
```bash
npm install
npm run build --workspace=@yoobic/shared-types
npm run build --workspace=@yoobic/validation
npm run build --workspace=@yoobic/api-client
```

### 5. Run the backend
```bash
npm run dev:backend
```

You should see:
```
[Database] Using MySQL → yoobic@localhost:3306/yoobic_one
[Database] Connection established successfully via mysql.
[Database] Schema synchronized (sync without alter).
[Seed] ...
[Server] Yoobic Backend running on http://localhost:4000
```

Health check: `curl http://localhost:4000/health`

### 6. Run Admin Web & Mobile (optional)
```bash
npm run dev:admin    # http://localhost:3000
npm run dev:mobile   # Expo
```

## Demo accounts (created by seed)

| Role              | Email                              | Password     |
|-------------------|------------------------------------|--------------|
| Store Manager     | sarah.manager@globalretail.com     | Password123! |
| Frontline         | alex.frontline@globalretail.com    | Password123! |
| Org Owner         | (created on first register)        | —            |

## Database behaviour

| Environment              | Dialect | Notes                                      |
|--------------------------|---------|--------------------------------------------|
| `NODE_ENV=test`          | SQLite  | In-memory, isolated, fast tests            |
| `DB_DIALECT=sqlite`      | SQLite  | Explicit local file fallback               |
| Default / production     | **MySQL** | Requires MySQL running (Docker or local) |

If the backend cannot reach MySQL it will print a clear error and exit.  
Fix: `docker compose up -d mysql` then restart the backend.

## Useful commands

```bash
# Backend only
npm run dev:backend

# All workspaces typecheck
npm run typecheck

# Backend tests (always use SQLite)
npm run test --workspace=@yoobic/backend

# Full Docker stack (backend + admin + MySQL + Redis)
docker compose up --build
```

## Project structure

```
YOOBIC_ONE/
├── apps/
│   ├── backend/          # Express REST API + Socket.IO
│   ├── admin-web/        # Next.js administration portal
│   └── mobile/           # Expo frontline app (offline-first)
├── packages/
│   ├── shared-types/     # Shared TypeScript interfaces
│   ├── validation/       # Zod schemas
│   └── api-client/       # Typed HTTP client
├── infrastructure/docker/
├── docker-compose.yml
├── .env.example
└── package.json
```

## Next steps after foundation

1. Task templates + recurrence engine  
2. File / photo upload pipeline  
3. Certificate issuance on quiz pass  
4. Admin UI routing improvements  
5. Mobile mission stepper polish  

See `docs/` for gap analysis and integration reports.
