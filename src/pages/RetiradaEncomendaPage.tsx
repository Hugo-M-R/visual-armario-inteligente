import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listEncomendas, retirarEncomenda, validarCodigo } from '@/api/encomendas';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Encomenda } from '@/types';
import { formatDateTime, formatStatusRetirada, getApiErrorMessage } from '@/utils/format';

type WizardStep = 'selecionar' | 'codigo' | 'confirmar' | 'sucesso';

const steps: Array<{ id: WizardStep; label: string }> = [
  { id: 'selecionar', label: 'Selecionar' },
  { id: 'codigo', label: 'Validar código' },
  { id: 'confirmar', label: 'Confirmar' },
  { id: 'sucesso', label: 'Concluído' },
];

export function RetiradaEncomendaPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WizardStep>('selecionar');
  const [selected, setSelected] = useState<Encomenda | null>(null);
  const [codigo, setCodigo] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [error, setError] = useState('');

  const encomendasQuery = useQuery({ queryKey: ['encomendas'], queryFn: listEncomendas });

  const pendentes = useMemo(
    () => (encomendasQuery.data ?? []).filter((item) => item.statusRetirada === 'PENDENTE'),
    [encomendasQuery.data],
  );

  const validarMutation = useMutation({
    mutationFn: () => validarCodigo(selected!.idEncomenda, codigo.trim()),
    onSuccess: () => {
      setCodigoValidado(true);
      setError('');
      setStep('confirmar');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Código inválido.')),
  });

  const retirarMutation = useMutation({
    mutationFn: () => retirarEncomenda(selected!.idEncomenda, codigo.trim()),
    onSuccess: () => {
      setError('');
      setStep('sucesso');
      void queryClient.invalidateQueries({ queryKey: ['encomendas'] });
      void queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      void queryClient.invalidateQueries({ queryKey: ['armarios'] });
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Não foi possível concluir a retirada.')),
  });

  function handleSelect(encomenda: Encomenda) {
    setSelected(encomenda);
    setCodigo('');
    setCodigoValidado(false);
    setError('');
    setStep('codigo');
  }

  function handleBack() {
    setError('');
    if (step === 'codigo') {
      setSelected(null);
      setStep('selecionar');
      return;
    }
    if (step === 'confirmar') {
      setCodigoValidado(false);
      setStep('codigo');
    }
  }

  function resetWizard() {
    setSelected(null);
    setCodigo('');
    setCodigoValidado(false);
    setError('');
    setStep('selecionar');
  }

  if (encomendasQuery.isLoading) return <LoadingState />;
  if (encomendasQuery.error) return <ErrorAlert message="Erro ao carregar encomendas pendentes." />;

  const currentStepIndex = steps.findIndex((item) => item.id === step);

  return (
    <section>
      <PageHeader
        title="Retirar encomenda"
        description="Siga os passos para validar o código e concluir a retirada com segurança."
      />

      <div className="wizard-steps">
        {steps.map((item, index) => (
          <div
            key={item.id}
            className={`wizard-step ${index <= currentStepIndex ? 'active' : ''} ${index === currentStepIndex ? 'current' : ''}`}
          >
            <span>{index + 1}</span>
            <small>{item.label}</small>
          </div>
        ))}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {step === 'selecionar' ? (
        pendentes.length === 0 ? (
          <EmptyState
            title="Nenhuma encomenda pendente"
            description="Quando uma encomenda chegar, ela aparecerá aqui para retirada."
          />
        ) : (
          <div className="cards-grid">
            {pendentes.map((encomenda) => (
              <button
                key={encomenda.idEncomenda}
                type="button"
                className="entity-card wizard-card"
                onClick={() => handleSelect(encomenda)}
              >
                <div className="entity-card-header">
                  <h3>{encomenda.descricao}</h3>
                  <StatusBadge label={formatStatusRetirada(encomenda.statusRetirada)} tone="warning" />
                </div>
                <p>
                  Remetente: {encomenda.remetente}
                  <br />
                  Armário: {encomenda.armarioNumero ?? '—'}
                  <br />
                  Recebida em: {formatDateTime(encomenda.dataRecebimento)}
                </p>
                <span className="wizard-card-cta">Selecionar para retirada →</span>
              </button>
            ))}
          </div>
        )
      ) : null}

      {step === 'codigo' && selected ? (
        <div className="panel wizard-panel">
          <h2>Validar código de acesso</h2>
          <p>
            Encomenda <strong>{selected.descricao}</strong> no armário{' '}
            <strong>{selected.armarioNumero ?? '—'}</strong>.
          </p>
          <label>
            Código recebido
            <input
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Digite o código de 6 dígitos"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>
          <div className="wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={handleBack}>
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!codigo.trim() || validarMutation.isPending}
              onClick={() => validarMutation.mutate()}
            >
              {validarMutation.isPending ? 'Validando...' : 'Validar código'}
            </button>
          </div>
        </div>
      ) : null}

      {step === 'confirmar' && selected ? (
        <div className="panel wizard-panel">
          <h2>Confirmar retirada</h2>
          <ul className="summary-list">
            <li>Encomenda: {selected.descricao}</li>
            <li>Remetente: {selected.remetente}</li>
            <li>Armário: {selected.armarioNumero ?? '—'}</li>
            <li>Código validado: {codigoValidado ? 'Sim' : 'Não'}</li>
          </ul>
          <div className="wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={handleBack}>
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!codigoValidado || retirarMutation.isPending}
              onClick={() => retirarMutation.mutate()}
            >
              {retirarMutation.isPending ? 'Concluindo...' : 'Confirmar retirada'}
            </button>
          </div>
        </div>
      ) : null}

      {step === 'sucesso' && selected ? (
        <div className="panel wizard-panel wizard-success">
          <h2>Retirada concluída</h2>
          <p>
            A encomenda <strong>{selected.descricao}</strong> foi retirada com sucesso em{' '}
            {formatDateTime(new Date().toISOString())}.
          </p>
          <div className="wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={resetWizard}>
              Retirar outra encomenda
            </button>
            <Link to="/encomendas" className="btn btn-primary">
              Ver minhas encomendas
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
