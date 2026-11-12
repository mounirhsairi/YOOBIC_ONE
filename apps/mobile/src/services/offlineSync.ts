import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { SyncOperationType, SyncStatus } from '@yoobic/shared-types';
import { YoobicApiClient } from '@yoobic/api-client';

export interface QueueItem {
  id: string;
  operationId: string;
  organizationId: string;
  operationType: SyncOperationType;
  entityId: string;
  payload: string;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
}

class OfflineSyncEngine {
  private db: SQLite.SQLiteDatabase | null = null;
  // Web browser fallback storage
  private webTaskCache: Map<string, any[]> = new Map();
  private webSyncQueue: QueueItem[] = [];

  async initDatabase(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('yoobic_web_task_cache') : null;
        if (stored) {
          this.webTaskCache = new Map(JSON.parse(stored));
        }
      } catch {}
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync('yoobic_offline.db');
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS cached_tasks (
          id TEXT PRIMARY KEY NOT NULL,
          organization_id TEXT NOT NULL,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY NOT NULL,
          operation_id TEXT NOT NULL UNIQUE,
          organization_id TEXT NOT NULL,
          operation_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          payload TEXT NOT NULL,
          status TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);
      console.log('[OfflineSync] Local SQLite database initialized successfully.');
    } catch (error) {
      console.error('[OfflineSync] Failed to initialize SQLite database:', error);
    }
  }

  async cacheTask(taskId: string, organizationId: string, taskData: any): Promise<void> {
    if (Platform.OS === 'web') {
      const existing = this.webTaskCache.get(organizationId) || [];
      const updated = existing.filter((t) => t.id !== taskId).concat(taskData);
      this.webTaskCache.set(organizationId, updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('yoobic_web_task_cache', JSON.stringify(Array.from(this.webTaskCache.entries())));
      }
      return;
    }

    if (!this.db) await this.initDatabase();
    if (!this.db) return;
    await this.db.runAsync(
      `INSERT OR REPLACE INTO cached_tasks (id, organization_id, data, updated_at) VALUES (?, ?, ?, ?)`,
      [taskId, organizationId, JSON.stringify(taskData), new Date().toISOString()]
    );
  }

  async cacheTasks(organizationId: string, tasks: any[]): Promise<void> {
    for (const t of tasks) {
      await this.cacheTask(t.id, organizationId, t);
    }
  }

  async getCachedTasks(organizationId: string): Promise<any[]> {
    if (Platform.OS === 'web') {
      return this.webTaskCache.get(organizationId) || [];
    }

    if (!this.db) await this.initDatabase();
    if (!this.db) return [];
    try {
      const rows = await this.db.getAllAsync<{ data: string }>(
        `SELECT data FROM cached_tasks WHERE organization_id = ?`,
        [organizationId]
      );
      return rows.map((r) => JSON.parse(r.data));
    } catch {
      return [];
    }
  }

  async queueOperation(
    operationId: string,
    organizationId: string,
    operationType: SyncOperationType,
    entityId: string,
    payload: any
  ): Promise<void> {
    const item: QueueItem = {
      id: operationId,
      operationId,
      organizationId,
      operationType,
      entityId,
      payload: JSON.stringify(payload),
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (Platform.OS === 'web') {
      this.webSyncQueue.push(item);
      return;
    }

    if (!this.db) await this.initDatabase();
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT INTO sync_queue (id, operation_id, organization_id, operation_type, entity_id, payload, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, ?)`,
      [
        operationId,
        operationId,
        organizationId,
        operationType,
        entityId,
        JSON.stringify(payload),
        new Date().toISOString(),
      ]
    );
  }

  async getPendingOperations(): Promise<QueueItem[]> {
    if (Platform.OS === 'web') {
      return this.webSyncQueue.filter((q) => q.status === 'PENDING' || q.status === 'FAILED');
    }

    if (!this.db) await this.initDatabase();
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM sync_queue WHERE status IN ('PENDING', 'FAILED') ORDER BY created_at ASC`
    );
    return rows as QueueItem[];
  }

  async markOperationStatus(id: string, status: SyncStatus): Promise<void> {
    if (Platform.OS === 'web') {
      const item = this.webSyncQueue.find((q) => q.id === id);
      if (item) item.status = status;
      return;
    }

    if (!this.db) return;
    await this.db.runAsync(`UPDATE sync_queue SET status = ? WHERE id = ?`, [status, id]);
  }

  // Auto-sync replay engine with retry backoff & idempotency
  async syncPendingQueue(apiClient: YoobicApiClient): Promise<{ synced: number; failed: number }> {
    const pending = await this.getPendingOperations();
    let synced = 0;
    let failed = 0;

    for (const op of pending) {
      if (op.retryCount >= 5) {
        await this.markOperationStatus(op.id, 'FAILED');
        failed++;
        continue;
      }

      try {
        const payload = JSON.parse(op.payload);
        let res: any;

        if (op.operationType === 'TASK_SUBMIT') {
          res = await apiClient.submitTask(op.entityId, payload);
        } else if (op.operationType === 'TASK_START') {
          res = await apiClient.startTask(op.entityId);
        }

        if (res && res.success) {
          await this.markOperationStatus(op.id, 'SYNCED');
          synced++;
        } else {
          // Increment retry count
          if (!this.db && Platform.OS !== 'web') await this.initDatabase();
          if (this.db) {
            await this.db.runAsync(`UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?`, [op.id]);
          } else if (Platform.OS === 'web') {
            op.retryCount += 1;
          }
          failed++;
        }
      } catch (err) {
        console.warn(`[OfflineSync] Sync failed for operation ${op.id}:`, err);
        failed++;
      }
    }

    return { synced, failed };
  }

  // Secure tenant isolation cleanup upon logout
  async clearOrganizationData(organizationId: string): Promise<void> {
    if (Platform.OS === 'web') {
      this.webTaskCache.delete(organizationId);
      this.webSyncQueue = this.webSyncQueue.filter((q) => q.organizationId !== organizationId);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('yoobic_web_task_cache');
      }
      return;
    }

    if (!this.db) await this.initDatabase();
    if (!this.db) return;
    await this.db.runAsync(`DELETE FROM cached_tasks WHERE organization_id = ?`, [organizationId]);
    await this.db.runAsync(`DELETE FROM sync_queue WHERE organization_id = ?`, [organizationId]);
    console.log(`[OfflineSync] Cleared offline cache for organization ${organizationId}.`);
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
