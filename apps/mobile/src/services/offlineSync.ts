import * as SQLite from 'expo-sqlite';
import { SyncOperationType, SyncStatus } from '@yoobic/shared-types';

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

  async initDatabase(): Promise<void> {
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
    if (!this.db) await this.initDatabase();
    if (!this.db) return;
    await this.db.runAsync(
      `INSERT OR REPLACE INTO cached_tasks (id, organization_id, data, updated_at) VALUES (?, ?, ?, ?)`,
      [taskId, organizationId, JSON.stringify(taskData), new Date().toISOString()]
    );
  }

  async getCachedTasks(organizationId: string): Promise<any[]> {
    if (!this.db) await this.initDatabase();
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<{ data: string }>(
      `SELECT data FROM cached_tasks WHERE organization_id = ?`,
      [organizationId]
    );
    return rows.map((r) => JSON.parse(r.data));
  }

  async queueOperation(
    operationId: string,
    organizationId: string,
    operationType: SyncOperationType,
    entityId: string,
    payload: any
  ): Promise<void> {
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
    if (!this.db) await this.initDatabase();
    if (!this.db) return [];
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM sync_queue WHERE status IN ('PENDING', 'FAILED') ORDER BY created_at ASC`
    );
    return rows as QueueItem[];
  }

  async markOperationStatus(id: string, status: SyncStatus): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(`UPDATE sync_queue SET status = ? WHERE id = ?`, [status, id]);
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
