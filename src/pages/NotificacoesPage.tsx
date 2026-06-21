import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotificacoes, marcarNotificacaoLida } from '@/api/notificacoes';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDateTime, getApiErrorMessage } from '@/utils/format';

export function NotificacoesPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');

  const notificacoesQuery = useQuery({ queryKey: ['notificacoes'], queryFn: listNotificacoes });

  const marcarLidaMutation = useMutation({
    mutationFn: marcarNotificacaoLida,
    onSuccess: () => {
      setFeedback('Notificação marcada como lida.');
      void queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  if (notificacoesQuery.isLoading) return <LoadingState />;
  if (notificacoesQuery.error) return <ErrorAlert message="Erro ao carregar notificações." />;

  const notificacoes = notificacoesQuery.data ?? [];

  return (
    <section>
      <PageHeader title="Notificações" description="Alertas de encomendas e avisos do sistema." />

      {feedback ? <div className="alert alert-info">{feedback}</div> : null}

      {notificacoes.length === 0 ? (
        <EmptyState title="Nenhuma notificação" description="Você será avisado quando houver novidades." />
      ) : (
        <div className="cards-grid">
          {notificacoes.map((notificacao) => (
            <article key={notificacao.idNotificacao} className="entity-card">
              <div className="entity-card-header">
                <h3>{notificacao.mensagem}</h3>
                <StatusBadge
                  label={notificacao.lida ? 'Lida' : 'Não lida'}
                  tone={notificacao.lida ? 'neutral' : 'info'}
                />
              </div>
              <p>{formatDateTime(notificacao.dataEnvio)}</p>
              {!notificacao.lida ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => marcarLidaMutation.mutate(notificacao.idNotificacao)}
                >
                  Marcar como lida
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
