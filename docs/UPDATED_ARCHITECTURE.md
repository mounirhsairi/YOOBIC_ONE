# YOOBIC ONE — Updated Technical Architecture

**Architecture Version:** 2.0  
**Last Updated:** November 2026  
**Status:** Integrated Production Architecture  

---

## 1. System Overview & Monorepo Topology

```
c:\YOOBIC_ONE
├── apps/
│   ├── backend/          # Express, Sequelize ORM, SQLite/PostgreSQL, Socket.IO, JWT Auth
│   ├── admin-web/        # Next.js 14 App Router, TanStack Query, TailwindCSS, Web Admin
│   └── mobile/           # Expo SDK 51, Expo Router, SQLite (WAL mode), Offline Sync Engine
├── packages/
│   ├── shared-types/     # Shared domain contracts, roles, permissions, sync types
│   ├── api-client/       # Typed REST client with automatic token injection & tenant scoping
│   └── validation/       # Zod schemas for input validation
└── docs/                 # Architectural specifications, gap analysis, and test reports
```

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Frontend Clients Layer"]
        WEB["Next.js 14 Web Admin Portal\n(localhost:3000)"]
        MOB["Expo Mobile App\n(iOS / Android / Web)"]
        SQLITE["Local SQLite DB\n(WAL mode + sync_queue)"]
        MOB <--> SQLITE
    end

    subgraph ClientPackage["Shared Client SDK"]
        APICLIENT["@yoobic/api-client\nBearer Token + X-Organization-Id"]
    end

    WEB --> APICLIENT
    MOB --> APICLIENT

    subgraph Gateway["Backend Application Layer (localhost:4000)"]
        CORS["CORS & Rate Limiter\n(express-rate-limit)"]
        AUTH_MW["Auth Middleware\n(JWT Verification)"]
        TENANT_MW["Multi-Tenant Isolation Guard\n(X-Organization-Id Validation)"]
        RBAC_MW["Permission Guard\n(RBAC & Ownership Check)"]
        
        CORS --> AUTH_MW --> TENANT_MW --> RBAC_MW
    end

    APICLIENT --> CORS

    subgraph Modules["Business Logic Modules"]
        AUTH_MOD["Auth & Security Engine\n(Refresh Token Rotation)"]
        TASK_MOD["Task Management & Validation Engine"]
        AUDIT_MOD["Audits & Store Inspections Engine"]
        COMM_MOD["Announcements & Communities Engine"]
        LMS_MOD["Learning & Quiz Engine"]
        ANALYTICS_MOD["Real-Time Task Analytics Aggregator"]
    end

    RBAC_MW --> AUTH_MOD
    RBAC_MW --> TASK_MOD
    RBAC_MW --> AUDIT_MOD
    RBAC_MW --> COMM_MOD
    RBAC_MW --> LMS_MOD
    RBAC_MW --> ANALYTICS_MOD

    subgraph DataLayer["Persistence Layer"]
        DB[(Sequelize ORM\nSQLite dev / PostgreSQL prod)]
        REALTIME["Socket.IO Server\n(Authenticated Real-time Events)"]
    end

    Modules --> DB
    Modules --> REALTIME
```

---

## 3. Multi-Tenant Isolation Model

Tenant isolation is strictly enforced at every layer of the application:
1. **Tenant Identification**: Every authenticated request passes the target organization ID via the `X-Organization-Id` HTTP header.
2. **Membership Verification**: The tenant middleware queries the database to guarantee the user holds an active membership within that organization.
3. **Database Query Scoping**: Every query automatically appends `{ where: { organizationId } }`. Cross-tenant queries are blocked with HTTP 403 Forbidden.
4. **Client-Side Cache Purge**: When a user logs out of the mobile client or switches organizations, `offlineSyncEngine.clearOrganizationData(orgId)` purges local SQLite cache tables to ensure complete data sanitization.

---

## 4. Offline-First Synchronization Architecture

The mobile application operates seamlessly in offline and low-connectivity environments (e.g., store basements, remote retail warehouses):

```mermaid
sequenceDiagram
    participant User as Frontline Associate
    participant App as Mobile UI Screen
    participant Sync as OfflineSyncEngine
    participant SQLite as Local SQLite DB
    participant API as Backend REST API

    User->>App: Executes Checklist / Submits Photo
    App->>API: Attempt direct network submission
    alt Online
        API-->>App: HTTP 200 Success
        App->>SQLite: Cache updated task status
        App-->>User: Mission completed confirmed
    else Offline / Network Failure
        App->>Sync: queueOperation('TASK_SUBMIT', payload)
        Sync->>SQLite: INSERT INTO sync_queue (status: PENDING)
        Sync->>SQLite: Update local cached_tasks optimistically
        App-->>User: Saved locally in SQLite (Offline Active)
    end

    Note over Sync,API: Network connectivity restored / User triggers manual sync
    Sync->>SQLite: SELECT * FROM sync_queue WHERE status='PENDING'
    loop For each pending item
        Sync->>API: Replay API request with idempotency token
        alt Replay Success
            API-->>Sync: 200 OK
            Sync->>SQLite: UPDATE sync_queue SET status='SYNCED'
        else Transient Error
            Sync->>SQLite: Increment retry_count (Exponential backoff)
        end
    end
```

---

## 5. Security & Authentication Architecture

1. **Access Tokens**: Short-lived JSON Web Tokens (JWT) signed with HMAC-SHA256 containing `userId`, `email`, and active `organizationId`.
2. **Refresh Token Rotation**:
   - Refresh tokens are issued with a cryptographically secure UUID `jti` claim.
   - The token hash is computed via SHA-256 (`crypto.createHash('sha256')`) and stored in the database.
   - Upon refresh (`POST /api/v1/auth/refresh`), the old token hash is immediately invalidated and a new pair is issued, preventing token replay attacks.
3. **Password Security**: Bcrypt with a salt factor of 10. Passwords must meet enterprise complexity criteria (minimum 8 characters, uppercase, lowercase, numbers, and symbols).
4. **WebSocket Security**: Socket.IO connection handshake validates the JWT Bearer token before accepting subscriptions to organization-specific rooms (`org_${organizationId}`).
