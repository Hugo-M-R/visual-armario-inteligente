import { useQuery } from '@tanstack/react-query';
import { listCompartimentos } from '@/api/compartimentos';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function CompartimentosPage() {
  const compartimentosQuery = useQuery({ queryKey: ['compartimentos'], queryFn: listCompartimentos });

  if (compartimentosQuery.isLoading) return <LoadingState />;
  if (compartimentosQuery.error) return <ErrorAlert message="Erro ao carregar compartimentos." />;

  const compartimentos = compartimentosQuery.data ?? [];

  return (
    <section>
      <PageHeader
        title="Compartimentos"
        description="Visualização dos compartimentos vinculados aos armários."
      />

      {compartimentos.length === 0 ? (
        <EmptyState title="Nenhum compartimento cadastrado" />
      ) : (
        <div className="cards-grid">
          {compartimentos.map((compartimento) => (
            <article key={compartimento.idCompartimento} className="entity-card">
              <div className="entity-card-header">
                <h3>Compartimento</h3>
                <StatusBadge
                  label={compartimento.ocupado ? 'Ocupado' : 'Livre'}
                  tone={compartimento.ocupado ? 'warning' : 'success'}
                />
              </div>
              <p>
                Armário: {compartimento.armario?.numero ?? '—'}
                <br />
                Local: {compartimento.armario?.localizacao ?? '—'}
              </p>
              {compartimento.encomendaAtual ? (
                <small>Encomenda atual: {compartimento.encomendaAtual.idEncomenda}</small>
              ) : (
                <small>Sem encomenda vinculada</small>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
