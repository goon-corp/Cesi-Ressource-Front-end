import { api, getAccessToken, setAccessToken, clearAccessToken } from './api';
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/web', payload, false);
    setAccessToken(response.access_token);
    return response;
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    await api.post<void>('/auth/register', payload, false, true);
  },

  forgotPassword: (payload: ForgotPasswordPayload): Promise<void> =>
    api.post<void>('/auth/forgot-password', payload, false),

  /** Checks if the current in-memory token is still valid via /auth/check */
  restoreSession: async (): Promise<string | null> => {
    const token = getAccessToken();
    if (!token) return null;
    try {
      await api.get<void>('/auth/check', true);
      return token;
    } catch {
      clearAccessToken();
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post<void>('/auth/logout', {}, true);
    } catch {
      // silently ignore logout errors
    } finally {
      clearAccessToken();
    }
  },
};
