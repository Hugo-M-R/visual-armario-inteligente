import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { countArmariosByStatus, listArmarios } from '@/api/armarios';
import { listEncomendas } from '@/api/encomendas';
import { listNotificacoes } from '@/api/notificacoes';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/contexts/AuthContext';
import { formatTipoUsuario } from '@/utils/format';

export function DashboardPage() {
  const { user, hasRole } = useAuth();

  const encomendasQuery = useQuery({ queryKey: ['encomendas'], queryFn: listEncomendas });
  const armariosQuery = useQuery({ queryKey: ['armarios'], queryFn: listArmarios });
  const disponiveisQuery = useQuery({
    queryKey: ['armarios-count', 'DISPONIVEL'],
    queryFn: () => countArmariosByStatus('DISPONIVEL'),
  });
  const notificacoesQuery = useQuery({
    queryKey: ['notificacoes'],
    queryFn: listNotificacoes,
    enabled: hasRole('ADMIN', 'MORADOR'),
  });

  const isLoading =
    encomendasQuery.isLoading ||
    armariosQuery.isLoading ||
    disponiveisQuery.isLoading ||
    (hasRole('ADMIN', 'MORADOR') && notificacoesQuery.isLoading);

  const error =
    encomendasQuery.error ??
    armariosQuery.error ??
    disponiveisQuery.error ??
    notificacoesQuery.error;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorAlert message="Não foi possível carregar o dashboard." />;

  const encomendas = encomendasQuery.data ?? [];
  const pendentes = encomendas.filter((item) => item.statusRetirada === 'PENDENTE').length;
  const notificacoesNaoLidas = (notificacoesQuery.data ?? []).filter((item) => !item.lida).length;

  return (
    <section>
      <PageHeader
        title="Dashboard"
        description={`Bem-vindo, ${user?.nome ?? user?.email}. Perfil: ${user ? formatTipoUsuario(user.tipo) : ''}.`}
      />

      <div className="stats-grid">
        <article className="stat-card">
          <span>Encomendas</span>
          <strong>{encomendas.length}</strong>
          <small>{pendentes} pendentes de retirada</small>
        </article>

        <article className="stat-card">
          <span>Armários cadastrados</span>
          <strong>{armariosQuery.data?.length ?? 0}</strong>
          <small>{disponiveisQuery.data ?? 0} disponíveis</small>
        </article>

        {hasRole('ADMIN', 'MORADOR') ? (
          <article className="stat-card">
            <span>Notificações não lidas</span>
            <strong>{notificacoesNaoLidas}</strong>
            <small>Acompanhe alertas de entrega</small>
          </article>
        ) : null}
      </div>

      <div className="panel">
        <h2>Resumo rápido</h2>
        <ul className="summary-list">
          {hasRole('ADMIN', 'PORTEIRO') ? (
            <li>Registre novas encomendas e gere códigos de retirada para moradores.</li>
          ) : null}
          {hasRole('MORADOR') ? (
            <li>
              {pendentes > 0 ? (
                <>
                  Você tem {pendentes} encomenda(s) aguardando retirada.{' '}
                  <Link to="/encomendas/retirar">Iniciar retirada guiada</Link>.
                </>
              ) : (
                'Quando houver encomendas pendentes, use o fluxo guiado de retirada.'
              )}
            </li>
          ) : null}
          {hasRole('ADMIN') ? (
            <li>Gerencie armários, usuários e consulte o histórico de auditoria.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
