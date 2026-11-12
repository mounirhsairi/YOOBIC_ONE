# YOOBIC ONE — Remaining Gaps & Future Roadmap

**Assessment Date:** November 2026  
**Integration Status:** Functional Integration Complete  

This document outlines architectural optimizations, infrastructure scaling requirements, and secondary feature enhancements identified during the comprehensive gap analysis and platform integration. None of these items block primary business workflows.

---

## 1. Infrastructure & Production Scaling Gaps

| Area | Current Implementation | Production Requirement | Priority |
| :--- | :--- | :--- | :--- |
| **Object Storage** | Static image URLs / base64 payloads | Direct S3 / Cloud Storage presigned URL upload pipeline for multi-megabyte photos and videos | P2 |
| **Background Jobs** | In-memory asynchronous promise execution | Distributed queue (BullMQ + Redis) for scheduled recurring tasks, email dispatches, and periodic report generation | P2 |
| **Push Notifications** | Socket.IO real-time events + in-app database feed | Firebase Cloud Messaging (FCM) & Apple Push Notification Service (APNS) native push notifications | P2 |
| **Database Engine** | Development SQLite database (`dev_database.sqlite`) | PostgreSQL 16+ with connection pooling (PgBouncer) and read replicas for high-throughput enterprise multi-tenancy | P1 (Pre-prod) |
| **Cache Layer** | In-memory cache + client-side TanStack Query | Redis cluster for session token revocation lists and fast analytics aggregation | P2 |

---

## 2. Advanced Feature Roadmaps

### A. Advanced Task Scheduling & Recurrence Engine
- **Current:** Tasks are created either manually or triggered per store with set due dates. Recurrence fields exist in the database model.
- **Enhancement:** A dedicated cron recurrence worker to materialize recurring task instances (e.g., daily opening checklist at 07:00 AM) automatically based on store operating hours.

### B. Dynamic Form Builder UI (Visual Drag-and-Drop)
- **Current:** Forms and checklists are parsed and rendered dynamically based on JSON schema definitions.
- **Enhancement:** A visual drag-and-drop schema designer in the Web Admin portal for non-technical operations managers to assemble complex forms with conditional skip-logic.

### C. Advanced Audit Geofencing & Biometrics
- **Current:** Audit and task submissions validate photo evidence and text observations.
- **Enhancement:** Mobile GPS geofencing verification ensuring auditor is physically within a 50-meter radius of the store coordinates during checklist execution.

### D. SCORM / xAPI E-Learning Integration
- **Current:** Micro-learning LMS supports course modules, lessons, and interactive scored quizzes.
- **Enhancement:** Support for third-party SCORM 1.2 / 2004 packages and xAPI statements for external LMS interoperability.

---

## 3. Security Hardening Recommendations

1. **mTLS / Certificate Pinning**: Implement SSL certificate pinning within the Expo mobile app for native iOS/Android binary builds.
2. **Device Jailbreak / Root Detection**: Add runtime jailbreak/root detection on mobile to prevent inspection of SQLite files on rooted devices.
3. **Web Content Security Policy (CSP)**: Configure strict CSP headers on Next.js `apps/admin-web` for iframe and script injection protection.
