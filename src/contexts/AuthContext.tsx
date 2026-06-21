import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMe } from '@/api/auth';
import type { TipoUsuario, Usuario } from '@/types';
import { isTokenExpired, TOKEN_STORAGE_KEY } from '@/utils/auth';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: TipoUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
  return token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<Usuario | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        if (active) setIsBootstrapping(false);
        return;
      }

      try {
        await loadCurrentUser();
      } catch {
        if (active) logout();
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [token, loadCurrentUser, logout]);

  const hasRole = useCallback(
    (...roles: TipoUsuario[]) => {
      if (!user) return false;
      return roles.includes(user.tipo);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      logout,
      hasRole,
    }),
    [user, token, isBootstrapping, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
