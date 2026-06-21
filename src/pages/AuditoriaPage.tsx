import { useQuery } from '@tanstack/react-query';
import { listAuditoria } from '@/api/auditoria';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';

export function AuditoriaPage() {
  const auditoriaQuery = useQuery({ queryKey: ['auditoria'], queryFn: listAuditoria });

  if (auditoriaQuery.isLoading) return <LoadingState />;
  if (auditoriaQuery.error) return <ErrorAlert message="Erro ao carregar registros de auditoria." />;

  const registros = auditoriaQuery.data ?? [];

  return (
    <section>
      <PageHeader
        title="Auditoria"
        description="Histórico automático de ações registradas no sistema."
      />

      {registros.length === 0 ? (
        <EmptyState title="Nenhum registro encontrado" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ação</th>
                <th>Detalhes</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.idRegistro}>
                  <td>{registro.idRegistro}</td>
                  <td>{registro.acao}</td>
                  <td>{registro.detalhes}</td>
                  <td>{formatDateTime(registro.dataHora)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
