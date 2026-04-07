import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/auth.service';
import { setSessionExpiredHandler } from '@/services/api';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

interface JwtPayload {
  sub?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<string | null>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSessionExpired = useCallback(() => {
    setUserId(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    authService.restoreSession()
      .then((token) => {
        setUserId(token ? extractUserIdFromToken(token) : null);
      })
      .catch(() => setUserId(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<string | null> => {
    const res = await authService.login(payload);
    const extractedUserId = extractUserIdFromToken(res.access_token);
    if (extractedUserId) {
      setUserId(extractedUserId);
    }
    return extractedUserId;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUserId(null);
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await authService.forgotPassword({ email });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isAuthenticated: !!userId,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
