import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EncomendasPage } from '@/pages/EncomendasPage';
import { ArmariosPage } from '@/pages/ArmariosPage';
import { UsuariosPage } from '@/pages/UsuariosPage';
import { NotificacoesPage } from '@/pages/NotificacoesPage';
import { AuditoriaPage } from '@/pages/AuditoriaPage';
import { CompartimentosPage } from '@/pages/CompartimentosPage';
import { RetiradaEncomendaPage } from '@/pages/RetiradaEncomendaPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="encomendas" element={<EncomendasPage />} />

                <Route element={<ProtectedRoute roles={['MORADOR']} />}>
                  <Route path="encomendas/retirar" element={<RetiradaEncomendaPage />} />
                </Route>

                <Route path="armarios" element={<ArmariosPage />} />
                <Route path="compartimentos" element={<CompartimentosPage />} />

                <Route element={<ProtectedRoute roles={['ADMIN', 'PORTEIRO']} />}>
                  <Route path="usuarios" element={<UsuariosPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['ADMIN', 'MORADOR']} />}>
                  <Route path="notificacoes" element={<NotificacoesPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="auditoria" element={<AuditoriaPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
