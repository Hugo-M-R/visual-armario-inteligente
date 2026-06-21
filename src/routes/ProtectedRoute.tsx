import { Navigate, Outlet } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoUsuario } from '@/types';

interface ProtectedRouteProps {
  roles?: TipoUsuario[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrapping, hasRole } = useAuth();

  if (isBootstrapping) {
    return <LoadingState message="Restaurando sessão..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState message="Verificando sessão..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
