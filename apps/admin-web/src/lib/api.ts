import { YoobicApiClient } from '@yoobic/api-client';

const resolveApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Localhost development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }

    // In production in the browser:
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl && envUrl.includes('.')) {
      if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
        return envUrl.replace(/\/$/, '');
      }
      return `https://${envUrl}`.replace(/\/$/, '');
    }

    // Default live cloud backend on Render
    return 'https://yoobic-backend.onrender.com';
  }

  // Server-side
  const serverUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://yoobic-backend.onrender.com';
  if (serverUrl.startsWith('http://') || serverUrl.startsWith('https://')) {
    return serverUrl.replace(/\/$/, '');
  }
  return `https://${serverUrl}`.replace(/\/$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

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
