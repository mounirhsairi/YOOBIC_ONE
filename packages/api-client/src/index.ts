import { ApiResponse, AuthSessionResponse, Task, User, Organization } from '@yoobic/shared-types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  getOrganizationId?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => void;
}

export class YoobicApiClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null> | string | null;
  private getOrganizationId?: () => Promise<string | null> | string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAccessToken = config.getAccessToken;
    this.getOrganizationId = config.getOrganizationId;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});
    
    headers.set('Content-Type', 'application/json');

    if (this.getAccessToken) {
      const token = await this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (this.getOrganizationId) {
      const orgId = await this.getOrganizationId();
      if (orgId) {
        headers.set('X-Organization-Id', orgId);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Network request failed',
        },
      };
    }
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; uptime: number; timestamp: string }>('/health');
  }

  // Auth
  async login(payload: { email: string; password: string }) {
    return this.request<AuthSessionResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(payload: { email: string; password: string; firstName: string; lastName: string; organizationName?: string }) {
    return this.request<AuthSessionResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<AuthSessionResponse>('/api/v1/auth/me');
  }

  // Tasks
  async getTasks(params?: { status?: string; storeId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Task[]>(`/api/v1/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id: string) {
    return this.request<Task>(`/api/v1/tasks/${id}`);
  }

  async createTask(payload: Partial<Task>) {
    return this.request<Task>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async startTask(id: string) {
    return this.request<Task>(`/api/v1/tasks/${id}/start`, { method: 'POST' });
  }

  async submitTask(id: string, payload: { comment?: string; checklistResponses: any; evidence: any[] }) {
    return this.request<Task>(`/api/v1/tasks/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async validateTask(id: string, payload: { decision: 'APPROVED' | 'REJECTED'; reason?: string }) {
    return this.request<Task>(`/api/v1/tasks/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
