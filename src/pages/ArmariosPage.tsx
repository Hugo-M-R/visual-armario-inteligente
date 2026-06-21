import type { FormEvent } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createArmario, listArmarios, updateArmarioStatus } from '@/api/armarios';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import type { ArmarioStatus } from '@/types';
import { formatStatusArmario, getApiErrorMessage } from '@/utils/format';

const statusTone: Record<ArmarioStatus, 'success' | 'warning' | 'danger'> = {
  DISPONIVEL: 'success',
  OCUPADO: 'warning',
  MANUTENCAO: 'danger',
};

export function ArmariosPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [numero, setNumero] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [status, setStatus] = useState<ArmarioStatus>('DISPONIVEL');

  const armariosQuery = useQuery({ queryKey: ['armarios'], queryFn: listArmarios });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['armarios'] });

  const createMutation = useMutation({
    mutationFn: createArmario,
    onSuccess: () => {
      setFeedback('Armário criado com sucesso.');
      setShowForm(false);
      setNumero('');
      setLocalizacao('');
      setStatus('DISPONIVEL');
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: ArmarioStatus }) =>
      updateArmarioStatus(id, novoStatus),
    onSuccess: () => {
      setFeedback('Status atualizado.');
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate({ numero, localizacao, status });
  }

  if (armariosQuery.isLoading) return <LoadingState />;
  if (armariosQuery.error) return <ErrorAlert message="Erro ao carregar armários." />;

  const armarios = armariosQuery.data ?? [];

  return (
    <section>
      <PageHeader
        title="Armários"
        description="Visualize e gerencie os armários do condomínio."
        actions={
          hasRole('ADMIN') ? (
            <button type="button" className="btn btn-primary" onClick={() => setShowForm((value) => !value)}>
              {showForm ? 'Fechar formulário' : 'Novo armário'}
            </button>
          ) : null
        }
      />

      {feedback ? <div className="alert alert-info">{feedback}</div> : null}

      {showForm && hasRole('ADMIN') ? (
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <label>
            Número
            <input value={numero} onChange={(event) => setNumero(event.target.value)} required />
          </label>
          <label>
            Localização
            <input value={localizacao} onChange={(event) => setLocalizacao(event.target.value)} required />
          </label>
          <label>
            Status inicial
            <select value={status} onChange={(event) => setStatus(event.target.value as ArmarioStatus)}>
              <option value="DISPONIVEL">Disponível</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              Salvar armário
            </button>
          </div>
        </form>
      ) : null}

      {armarios.length === 0 ? (
        <EmptyState title="Nenhum armário cadastrado" />
      ) : (
        <div className="cards-grid">
          {armarios.map((armario) => (
            <article key={armario.id} className="entity-card">
              <div className="entity-card-header">
                <h3>Armário {armario.numero}</h3>
                <StatusBadge label={formatStatusArmario(armario.status)} tone={statusTone[armario.status]} />
              </div>
              <p>{armario.localizacao}</p>
              {hasRole('ADMIN') ? (
                <div className="entity-card-actions">
                  {(['DISPONIVEL', 'OCUPADO', 'MANUTENCAO'] as ArmarioStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={armario.status === option}
                      onClick={() => statusMutation.mutate({ id: armario.id, novoStatus: option })}
                    >
                      {formatStatusArmario(option)}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
