import { api, setAccessToken, clearAccessToken } from './api';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
  WebAuthResponse,
} from '@/types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<WebAuthResponse> => {
    const response = await api.post<WebAuthResponse>('/auth/login/web', payload, false, true);
    setAccessToken(response.access_token);
    return response;
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    await api.post<void>('/auth/register', payload, false, true);
  },

  forgotPassword: (payload: ForgotPasswordPayload): Promise<void> =>
    api.post<void>('/auth/forgot-password', payload, false),

  getMe: (): Promise<User> => api.get<User>('/auth/me'),

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
