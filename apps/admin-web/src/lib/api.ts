import { YoobicApiClient } from '@yoobic/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yoobic_access_token');
};

export const getStoredOrgId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yoobic_org_id');
};

export const setStoredAuth = (token: string, orgId?: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yoobic_access_token', token);
  if (orgId) localStorage.setItem('yoobic_org_id', orgId);
  if (refreshToken) localStorage.setItem('yoobic_refresh_token', refreshToken);
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('yoobic_access_token');
  localStorage.removeItem('yoobic_org_id');
  localStorage.removeItem('yoobic_refresh_token');
  localStorage.removeItem('yoobic_user');
};

export const apiClient = new YoobicApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => getStoredToken(),
  getOrganizationId: () => getStoredOrgId(),
  onUnauthorized: () => {
    clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.location.hash = '#/noauth/login';
    }
  },
});
