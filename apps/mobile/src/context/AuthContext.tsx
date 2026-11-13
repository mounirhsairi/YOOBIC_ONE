import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  mobileApiClient,
  getMobileToken,
  setMobileToken,
  getMobileOrgId,
  setMobileOrgId,
  getMobileUser,
  setMobileUser,
  clearMobileAuth,
} from '../services/api';
import { offlineSyncEngine } from '../services/offlineSync';

export interface AuthContextType {
  user: any | null;
  orgId: string | null;
  currentOrg: any | null;
  organizations: any[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [currentOrg, setCurrentOrg] = useState<any | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function initSession() {
      try {
        const token = await getMobileToken();
        const storedOrgId = await getMobileOrgId();
        const storedUser = await getMobileUser();

        if (token) {
          if (storedUser) setUser(storedUser);
          if (storedOrgId) setOrgId(storedOrgId);

          // Verify token against /me
          const meRes = await mobileApiClient.getMe();
          if (meRes.success && meRes.data) {
            setUser(meRes.data.user);
            await setMobileUser(meRes.data.user);

            const activeOrg = meRes.data.activeOrganization || null;
            if (activeOrg) {
              setOrgId(activeOrg.id);
              setCurrentOrg(activeOrg);
              await setMobileOrgId(activeOrg.id);
            }

            // Fetch available orgs
            const orgsRes = await mobileApiClient.listOrganizations();
            if (orgsRes.success && Array.isArray(orgsRes.data)) {
              setOrganizations(orgsRes.data);
            } else if (activeOrg) {
              setOrganizations([activeOrg]);
            }
          } else {
            // Token expired or invalid
            await clearMobileAuth();
            setUser(null);
            setOrgId(null);
            setCurrentOrg(null);
          }
        }
      } catch (err) {
        console.warn('[AuthProvider] Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await mobileApiClient.login({ email, password });
      if (!res.success || !res.data) {
        return {
          success: false,
          error: (res.error?.message || 'Authentication failed') + ` (API: ${API_BASE_URL})`,
        };
      }

      const { tokens, user: authUser, activeOrganization } = res.data;

      await setMobileToken(tokens.accessToken);
      setUser(authUser);
      await setMobileUser(authUser);

      if (activeOrganization) {
        setOrgId(activeOrganization.id);
        setCurrentOrg(activeOrganization);
        await setMobileOrgId(activeOrganization.id);
        setOrganizations([activeOrganization]);
      }

      // Fetch organizations
      try {
        const orgsRes = await mobileApiClient.listOrganizations();
        if (orgsRes.success && Array.isArray(orgsRes.data)) {
          setOrganizations(orgsRes.data);
        }
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: (err.message || 'Network error') + ` — cannot reach ${API_BASE_URL}. Start backend and check EXPO_PUBLIC_API_URL.` };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      if (orgId) {
        await offlineSyncEngine.clearOrganizationData(orgId);
      }
      try {
        await mobileApiClient.logout();
      } catch {}
      await clearMobileAuth();
      setUser(null);
      setOrgId(null);
      setCurrentOrg(null);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (newOrgId: string) => {
    setOrgId(newOrgId);
    await setMobileOrgId(newOrgId);
    const org = organizations.find((o) => o.id === newOrgId) || null;
    setCurrentOrg(org);
  };

  const refreshUserProfile = async () => {
    try {
      const meRes = await mobileApiClient.getMe();
      if (meRes.success && meRes.data) {
        setUser(meRes.data.user);
        await setMobileUser(meRes.data.user);
      }
    } catch (err) {
      console.warn('[AuthProvider] Refresh error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orgId,
        currentOrg,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchOrganization,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
