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

  setAccessTokenGetter(fn: () => Promise<string | null> | string | null) {
    this.getAccessToken = fn;
  }

  setOrganizationIdGetter(fn: () => Promise<string | null> | string | null) {
    this.getOrganizationId = fn;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Health & Search
  // ─────────────────────────────────────────────────────────────────────────────
  async getHealth() {
    return this.request<{ status: string; uptime: number; timestamp: string }>('/health');
  }

  async globalSearch(query: string) {
    return this.request<{ tasks: any[]; stores: any[]; announcements: any[]; courses: any[] }>(
      `/api/v1/search?q=${encodeURIComponent(query)}`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Auth
  // ─────────────────────────────────────────────────────────────────────────────
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

  async refreshToken(refreshToken: string) {
    return this.request<{ tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/api/v1/auth/logout', { method: 'POST' });
  }

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<AuthSessionResponse>('/api/v1/auth/me');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Organizations & Hierarchy
  // ─────────────────────────────────────────────────────────────────────────────
  async listOrganizations() {
    return this.request<Organization[]>('/api/v1/organizations');
  }

  async getOrganization(id: string) {
    return this.request<Organization>(`/api/v1/organizations/${id}`);
  }

  async createOrganization(payload: Partial<Organization>) {
    return this.request<Organization>('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateOrganization(id: string, payload: Partial<Organization>) {
    return this.request<Organization>(`/api/v1/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getHierarchy() {
    return this.request<any[]>('/api/v1/hierarchy');
  }

  // Regions
  async listRegions() {
    return this.request<any[]>('/api/v1/regions');
  }

  async createRegion(payload: { name: string; code: string }) {
    return this.request<any>('/api/v1/regions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateRegion(id: string, payload: { name?: string; code?: string }) {
    return this.request<any>(`/api/v1/regions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteRegion(id: string) {
    return this.request<{ message: string }>(`/api/v1/regions/${id}`, { method: 'DELETE' });
  }

  // Stores
  async getStores() {
    return this.request<any[]>('/api/v1/stores');
  }

  async getStore(id: string) {
    return this.request<any>(`/api/v1/stores/${id}`);
  }

  async createStore(payload: any) {
    return this.request<any>('/api/v1/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateStore(id: string, payload: any) {
    return this.request<any>(`/api/v1/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteStore(id: string) {
    return this.request<{ message: string }>(`/api/v1/stores/${id}`, { method: 'DELETE' });
  }

  // Teams
  async listTeams(params?: { storeId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/api/v1/teams${query ? `?${query}` : ''}`);
  }

  async createTeam(payload: any) {
    return this.request<any>('/api/v1/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTeam(id: string, payload: any) {
    return this.request<any>(`/api/v1/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteTeam(id: string) {
    return this.request<{ message: string }>(`/api/v1/teams/${id}`, { method: 'DELETE' });
  }

  // Employees
  async getEmployees() {
    return this.request<any[]>('/api/v1/employees');
  }

  async inviteEmployee(payload: {
    email: string;
    firstName: string;
    lastName: string;
    roleCode: string;
    storeId?: string;
    teamId?: string;
    jobTitle?: string;
    employeeNumber?: string;
  }) {
    return this.request<any>('/api/v1/employees/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEmployee(membershipId: string, payload: any) {
    return this.request<any>(`/api/v1/employees/${membershipId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async removeEmployee(membershipId: string) {
    return this.request<{ message: string }>(`/api/v1/employees/${membershipId}`, { method: 'DELETE' });
  }

  // Roles & Permissions
  async listRoles() {
    return this.request<any[]>('/api/v1/roles');
  }

  async getRole(id: string) {
    return this.request<any>(`/api/v1/roles/${id}`);
  }

  async createRole(payload: { name: string; code: string; description?: string; permissionCodes: string[] }) {
    return this.request<any>('/api/v1/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateRole(id: string, payload: { name?: string; description?: string; permissionCodes?: string[] }) {
    return this.request<any>(`/api/v1/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteRole(id: string) {
    return this.request<{ message: string }>(`/api/v1/roles/${id}`, { method: 'DELETE' });
  }

  async listPermissions() {
    return this.request<any[]>('/api/v1/permissions');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tasks & Analytics
  // ─────────────────────────────────────────────────────────────────────────────
  async getTasks(params?: { status?: string; storeId?: string; assignedUserId?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.storeId) q.set('storeId', params.storeId);
    if (params?.assignedUserId) q.set('assignedUserId', params.assignedUserId);
    q.set('page', String(params?.page || 1));
    q.set('limit', String(params?.limit || 100));
    return this.request<Task[]>(`/api/v1/tasks?${q.toString()}`);
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

  async updateTask(id: string, payload: Partial<Task>) {
    return this.request<Task>(`/api/v1/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ message: string }>(`/api/v1/tasks/${id}`, { method: 'DELETE' });
  }

  async startTask(id: string) {
    return this.request<Task>(`/api/v1/tasks/${id}/start`, { method: 'POST' });
  }

  async submitTask(id: string, payload: { comment?: string; checklistResponses: any; evidence: any[] }) {
    return this.request<{ task: Task; submission: any }>(`/api/v1/tasks/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async validateTask(id: string, payload: { decision: 'APPROVED' | 'REJECTED'; reason?: string }) {
    return this.request<{ task: Task; validation: any }>(`/api/v1/tasks/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTaskAnalytics() {
    return this.request<{
      total: number;
      todo: number;
      inProgress: number;
      submitted: number;
      approved: number;
      rejected: number;
      completionRate: number;
    }>('/api/v1/tasks/analytics');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Forms & Audits
  // ─────────────────────────────────────────────────────────────────────────────
  async listAuditTemplates() {
    return this.request<any[]>('/api/v1/audit-templates');
  }

  async createAuditTemplate(payload: any) {
    return this.request<any>('/api/v1/audit-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAuditTemplate(id: string, payload: any) {
    return this.request<any>(`/api/v1/audit-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteAuditTemplate(id: string) {
    return this.request<{ message: string }>(`/api/v1/audit-templates/${id}`, { method: 'DELETE' });
  }

  async listAudits() {
    return this.request<any[]>('/api/v1/audits');
  }

  async getAudit(id: string) {
    return this.request<any>(`/api/v1/audits/${id}`);
  }

  async scheduleAudit(payload: any) {
    return this.request<any>('/api/v1/audits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitAudit(id: string, payload: { score: number; findings?: string; correctiveActions?: any[] }) {
    return this.request<any>(`/api/v1/audits/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Communication
  // ─────────────────────────────────────────────────────────────────────────────
  async listAnnouncements() {
    return this.request<any[]>('/api/v1/announcements');
  }

  async createAnnouncement(payload: { title: string; content: string; isPinned?: boolean; priority?: string; targetRole?: string }) {
    return this.request<any>('/api/v1/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAnnouncement(id: string, payload: any) {
    return this.request<any>(`/api/v1/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.request<{ message: string }>(`/api/v1/announcements/${id}`, { method: 'DELETE' });
  }

  async listCommunities() {
    return this.request<any[]>('/api/v1/communities');
  }

  async createCommunity(payload: { name: string; description?: string }) {
    return this.request<any>('/api/v1/communities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listPosts(communityId: string) {
    return this.request<any[]>(`/api/v1/communities/${communityId}/posts`);
  }

  async createPost(communityId: string, payload: { title: string; content: string; mediaUrls?: string[] }) {
    return this.request<any>(`/api/v1/communities/${communityId}/posts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createComment(postId: string, payload: { content: string }) {
    return this.request<any>(`/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Learning (LMS)
  // ─────────────────────────────────────────────────────────────────────────────
  async listCourses() {
    return this.request<any[]>('/api/v1/courses');
  }

  async getCourse(id: string) {
    return this.request<any>(`/api/v1/courses/${id}`);
  }

  async createCourse(payload: any) {
    return this.request<any>('/api/v1/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCourse(id: string, payload: any) {
    return this.request<any>(`/api/v1/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteCourse(id: string) {
    return this.request<{ message: string }>(`/api/v1/courses/${id}`, { method: 'DELETE' });
  }

  async submitQuiz(courseId: string, lessonId: string, payload: { answers: Record<string, number> }) {
    return this.request<any>(`/api/v1/courses/${courseId}/lessons/${lessonId}/quiz`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyProgress() {
    return this.request<any[]>('/api/v1/me/learning');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────────────────────────────────────
  async listNotifications() {
    return this.request<any[]>('/api/v1/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.request<any>(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ message: string }>('/api/v1/notifications/read-all', { method: 'PATCH' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Super Admin
  // ─────────────────────────────────────────────────────────────────────────────
  async getPlatformStats() {
    return this.request<{ totalOrgs: number; activeOrgs: number; suspendedOrgs: number; totalUsers: number }>(
      '/api/v1/admin/platform/stats'
    );
  }

  async suspendOrganization(id: string) {
    return this.request<any>(`/api/v1/admin/organizations/${id}/suspend`, { method: 'PATCH' });
  }

  async activateOrganization(id: string) {
    return this.request<any>(`/api/v1/admin/organizations/${id}/activate`, { method: 'PATCH' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Task Templates & Recurrence
  // ─────────────────────────────────────────────────────────────────────────────
  async listTaskTemplates() {
    return this.request<any[]>('/api/v1/task-templates');
  }

  async createTaskTemplate(payload: any) {
    return this.request<any>('/api/v1/task-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTaskTemplate(id: string, payload: any) {
    return this.request<any>(`/api/v1/task-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteTaskTemplate(id: string) {
    return this.request<{ message: string }>(`/api/v1/task-templates/${id}`, { method: 'DELETE' });
  }

  async instantiateTaskTemplate(id: string, payload: { storeIds?: string[]; assignedUserId?: string; dueDate?: string }) {
    return this.request<any[]>(`/api/v1/task-templates/${id}/instantiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async runTaskRecurrence() {
    return this.request<{ created: number }>('/api/v1/task-templates/run-recurrence', { method: 'POST' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Store Visits
  // ─────────────────────────────────────────────────────────────────────────────
  async listStoreVisits(params?: { storeId?: string; status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.storeId) q.set('storeId', params.storeId);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return this.request<any[]>(`/api/v1/store-visits${qs ? `?${qs}` : ''}`);
  }

  async createStoreVisit(payload: any) {
    return this.request<any>('/api/v1/store-visits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateStoreVisit(id: string, payload: any) {
    return this.request<any>(`/api/v1/store-visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Certificates
  // ─────────────────────────────────────────────────────────────────────────────
  async listMyCertificates() {
    return this.request<any[]>('/api/v1/me/certificates');
  }

  async listOrgCertificates(params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return this.request<any[]>(`/api/v1/certificates${qs ? `?${qs}` : ''}`);
  }

  async getCertificate(id: string) {
    return this.request<any>(`/api/v1/certificates/${id}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // File Upload
  // ─────────────────────────────────────────────────────────────────────────────
  async uploadFile(file: Blob | File | { uri: string; name?: string; type?: string }, filename?: string) {
    const form = new FormData();
    // Support browser File/Blob and React Native { uri, name, type }
    if (file && typeof file === 'object' && 'uri' in (file as any)) {
      form.append('file', file as any);
    } else {
      form.append('file', file as any, filename || (file as any).name || 'upload.bin');
    }
    return this.request<{
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
    }>('/api/v1/uploads', {
      method: 'POST',
      body: form,
    });
  }
  // ── Forms & Missions ──
  async getForms() {
    return this.request<any[]>('/api/v1/forms');
  }
  async getForm(id: string) {
    return this.request<any>(`/api/v1/forms/${id}`);
  }
  async createForm(payload: any) {
    return this.request<any>('/api/v1/forms', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateForm(id: string, payload: any) {
    return this.request<any>(`/api/v1/forms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  }
  async deleteForm(id: string) {
    return this.request<any>(`/api/v1/forms/${id}`, { method: 'DELETE' });
  }
  async getMission(taskId: string) {
    return this.request<any>(`/api/v1/missions/${taskId}`);
  }
  async startMission(taskId: string) {
    return this.request<any>(`/api/v1/missions/${taskId}/start`, { method: 'POST', body: '{}' });
  }
  async abandonMission(taskId: string) {
    return this.request<any>(`/api/v1/missions/${taskId}/abandon`, { method: 'POST', body: '{}' });
  }
  async saveMissionProgress(taskId: string, payload: any) {
    return this.request<any>(`/api/v1/missions/${taskId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

}


export const createYoobicApiClient = (config: ApiClientConfig) => new YoobicApiClient(config);