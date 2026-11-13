import { YoobicApiClient } from '@yoobic/api-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
};

const API_BASE_URL = getDefaultApiUrl();

export const getMobileToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem('yoobic_mobile_token') : null;
    }
    return await SecureStore.getItemAsync('yoobic_mobile_token');
  } catch {
    return null;
  }
};

export const setMobileToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem('yoobic_mobile_token', token);
      return;
    }
    await SecureStore.setItemAsync('yoobic_mobile_token', token);
  } catch (err) {
    console.warn('[SecureStore] Failed to save token:', err);
  }
};

export const getMobileOrgId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem('yoobic_mobile_org_id') : null;
    }
    return await SecureStore.getItemAsync('yoobic_mobile_org_id');
  } catch {
    return null;
  }
};

export const setMobileOrgId = async (orgId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem('yoobic_mobile_org_id', orgId);
      return;
    }
    await SecureStore.setItemAsync('yoobic_mobile_org_id', orgId);
  } catch (err) {
    console.warn('[SecureStore] Failed to save orgId:', err);
  }
};

export const getMobileUser = async (): Promise<any | null> => {
  try {
    if (Platform.OS === 'web') {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('yoobic_mobile_user') : null;
      return raw ? JSON.parse(raw) : null;
    }
    const raw = await SecureStore.getItemAsync('yoobic_mobile_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setMobileUser = async (user: any): Promise<void> => {
  try {
    const raw = JSON.stringify(user);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem('yoobic_mobile_user', raw);
      return;
    }
    await SecureStore.setItemAsync('yoobic_mobile_user', raw);
  } catch (err) {
    console.warn('[SecureStore] Failed to save user:', err);
  }
};

export const clearMobileAuth = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('yoobic_mobile_token');
        localStorage.removeItem('yoobic_mobile_org_id');
        localStorage.removeItem('yoobic_mobile_user');
      }
      return;
    }
    await SecureStore.deleteItemAsync('yoobic_mobile_token');
    await SecureStore.deleteItemAsync('yoobic_mobile_org_id');
    await SecureStore.deleteItemAsync('yoobic_mobile_user');
  } catch (err) {
    console.warn('[SecureStore] Clear auth error:', err);
  }
};

export const mobileApiClient = new YoobicApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => getMobileToken(),
  getOrganizationId: () => getMobileOrgId(),
  onUnauthorized: () => {
    clearMobileAuth();
  },
});
