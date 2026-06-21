import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatTipoUsuario } from '@/utils/format';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['ADMIN', 'PORTEIRO', 'MORADOR'] as const },
  { to: '/encomendas', label: 'Encomendas', roles: ['ADMIN', 'PORTEIRO', 'MORADOR'] as const },
  { to: '/encomendas/retirar', label: 'Retirar encomenda', roles: ['MORADOR'] as const },
  { to: '/armarios', label: 'Armários', roles: ['ADMIN', 'PORTEIRO', 'MORADOR'] as const },
  { to: '/compartimentos', label: 'Compartimentos', roles: ['ADMIN', 'PORTEIRO', 'MORADOR'] as const },
  { to: '/usuarios', label: 'Usuários', roles: ['ADMIN', 'PORTEIRO'] as const },
  { to: '/notificacoes', label: 'Notificações', roles: ['ADMIN', 'MORADOR'] as const },
  { to: '/auditoria', label: 'Auditoria', roles: ['ADMIN'] as const },
];

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();

  const visibleItems = navItems.filter((item) => hasRole(...item.roles));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📦</span>
          <div>
            <strong>Armário Inteligente</strong>
            <small>Gestão de encomendas</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user?.nome ?? user?.email}</span>
            <small>{user ? formatTipoUsuario(user.tipo) : ''}</small>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
