# YOOBIC ONE Enterprise Frontline Operations SaaS Platform

An enterprise-grade, multi-tenant SaaS platform inspired by **YOOBIC ONE**, engineered for frontline employees, operations management, internal communication, compliance audits, and learning management.

## 🚀 Architectural Pillars

1. **Operations & Task Management**:
   - Dynamic checklists, recurrence engines, photo evidence requirements, manager approval/rejection workflows with mandatory audit notes.
2. **Multi-Tenant SaaS Logical Isolation**:
   - Strict organization-scoped repositories, centralized tenant context middleware, RBAC with custom roles and permissions.
3. **Offline-First Frontline Mobile Experience**:
   - Expo SQLite local database cache, persistent FIFO sync queue with idempotency and retry handling.
4. **Learning & Communication**:
   - Integrated LMS (modules, quizzes, certificates) and targeted announcements / communities.

## 🛠 Tech Stack

- **Backend**: Node.js v22, Express.js, TypeScript, Sequelize ORM (MySQL 8 / SQLite for local tests), Zod validation, JWT with refresh token rotation, Socket.IO.
- **Web Admin**: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query, Lucide icons.
- **Mobile Application**: Expo 51, React Native, TypeScript, Expo Router, Expo SQLite, Zustand.
- **Infrastructure**: Docker, Docker Compose, Redis 7, MySQL 8.

## 📦 Monorepo Structure

```
c:\YOOBIC_ONE\
├── apps\
│   ├── backend\        # Modular Express REST API with Sequelize
│   ├── admin-web\      # Next.js 14 Web Administration Dashboard
│   └── mobile\         # Expo React Native Frontline Mobile Application
├── packages\
│   ├── shared-types\   # Universal TypeScript interfaces and DTOs
│   ├── validation\     # Centralized Zod schemas
│   └── api-client\     # Type-safe API client
├── infrastructure\
│   └── docker\         # Docker Compose and Dockerfiles
└── package.json
```

## 🧪 Testing

```bash
# Run all backend and tenant-isolation integration tests:
npm run test --workspace=@yoobic/backend
```
