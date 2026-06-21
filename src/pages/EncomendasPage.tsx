import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listArmarios } from '@/api/armarios';
import {
  createEncomenda,
  deleteEncomenda,
  gerarCodigo,
  listEncomendas,
} from '@/api/encomendas';
import { listUsuarios } from '@/api/usuarios';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import type { EncomendaRequest } from '@/types';
import {
  formatDateTime,
  formatStatusRetirada,
  getApiErrorMessage,
} from '@/utils/format';

export function EncomendasPage() {
  const { hasRole } = useAuth();
  const isMorador = hasRole('MORADOR');
  const isStaff = hasRole('ADMIN', 'PORTEIRO');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState<EncomendaRequest>({
    idEncomenda: '',
    descricao: '',
    remetente: '',
    armarioId: '',
    usuarioId: '',
  });

  const encomendasQuery = useQuery({ queryKey: ['encomendas'], queryFn: listEncomendas });
  const armariosQuery = useQuery({
    queryKey: ['armarios'],
    queryFn: listArmarios,
    enabled: isStaff,
  });
  const usuariosQuery = useQuery({
    queryKey: ['usuarios'],
    queryFn: listUsuarios,
    enabled: isStaff,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['encomendas'] });
    void queryClient.invalidateQueries({ queryKey: ['armarios'] });
    void queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
  };

  const createMutation = useMutation({
    mutationFn: createEncomenda,
    onSuccess: () => {
      setFeedback('Encomenda registrada com sucesso.');
      setShowForm(false);
      setForm({ idEncomenda: '', descricao: '', remetente: '', armarioId: '', usuarioId: '' });
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const gerarCodigoMutation = useMutation({
    mutationFn: gerarCodigo,
    onSuccess: (data) => {
      setFeedback(`Código gerado: ${data.codigo} (expira em ${formatDateTime(data.dataExpiracao)})`);
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEncomenda,
    onSuccess: () => {
      setFeedback('Encomenda removida.');
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const moradores = useMemo(
    () => (usuariosQuery.data ?? []).filter((usuario) => usuario.tipo === 'MORADOR' && usuario.ativo),
    [usuariosQuery.data],
  );

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  if (encomendasQuery.isLoading) return <LoadingState />;
  if (encomendasQuery.error) return <ErrorAlert message="Erro ao carregar encomendas." />;

  const encomendas = encomendasQuery.data ?? [];
  const pendentes = encomendas.filter((item) => item.statusRetirada === 'PENDENTE').length;

  return (
    <section>
      <PageHeader
        title="Encomendas"
        description={
          isMorador
            ? 'Acompanhe suas encomendas e utilize o fluxo guiado para retirada.'
            : 'Controle de recebimento, códigos de acesso e retiradas.'
        }
        actions={
          isStaff ? (
            <button type="button" className="btn btn-primary" onClick={() => setShowForm((value) => !value)}>
              {showForm ? 'Fechar formulário' : 'Nova encomenda'}
            </button>
          ) : isMorador && pendentes > 0 ? (
            <Link to="/encomendas/retirar" className="btn btn-primary">
              Iniciar retirada
            </Link>
          ) : null
        }
      />

      {isMorador && pendentes > 0 ? (
        <div className="alert alert-info">
          Você possui {pendentes} encomenda(s) pendente(s).{' '}
          <Link to="/encomendas/retirar">Clique aqui para iniciar a retirada guiada.</Link>
        </div>
      ) : null}

      {feedback ? <div className="alert alert-info">{feedback}</div> : null}

      {showForm && isStaff ? (
        <form className="panel form-grid" onSubmit={handleCreate}>
          <label>
            ID da encomenda
            <input
              value={form.idEncomenda}
              onChange={(event) => setForm({ ...form, idEncomenda: event.target.value })}
              required
            />
          </label>
          <label>
            Descrição
            <input
              value={form.descricao}
              onChange={(event) => setForm({ ...form, descricao: event.target.value })}
              required
            />
          </label>
          <label>
            Remetente
            <input
              value={form.remetente}
              onChange={(event) => setForm({ ...form, remetente: event.target.value })}
              required
            />
          </label>
          <label>
            Armário
            <select
              value={form.armarioId}
              onChange={(event) => setForm({ ...form, armarioId: event.target.value })}
              required
            >
              <option value="">Selecione</option>
              {(armariosQuery.data ?? []).map((armario) => (
                <option key={armario.id} value={armario.id}>
                  {armario.numero} — {armario.localizacao}
                </option>
              ))}
            </select>
          </label>
          <label>
            Morador
            <select
              value={form.usuarioId}
              onChange={(event) => setForm({ ...form, usuarioId: event.target.value })}
              required
            >
              <option value="">Selecione</option>
              {moradores.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} ({usuario.email})
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              Registrar encomenda
            </button>
          </div>
        </form>
      ) : null}

      {encomendas.length === 0 ? (
        <EmptyState title="Nenhuma encomenda encontrada" description="Registros aparecerão aqui conforme forem criados." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th>Morador</th>
                <th>Armário</th>
                <th>Recebimento</th>
                <th>Status</th>
                {isStaff ? <th>Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {encomendas.map((encomenda) => (
                <tr key={encomenda.idEncomenda}>
                  <td>{encomenda.idEncomenda}</td>
                  <td>
                    <strong>{encomenda.descricao}</strong>
                    <small>{encomenda.remetente}</small>
                  </td>
                  <td>{encomenda.usuarioEmail ?? '—'}</td>
                  <td>{encomenda.armarioNumero ?? '—'}</td>
                  <td>{formatDateTime(encomenda.dataRecebimento)}</td>
                  <td>
                    <StatusBadge
                      label={formatStatusRetirada(encomenda.statusRetirada)}
                      tone={encomenda.statusRetirada === 'PENDENTE' ? 'warning' : 'success'}
                    />
                  </td>
                  {isStaff ? (
                    <td className="actions-cell">
                      {encomenda.statusRetirada === 'PENDENTE' ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => gerarCodigoMutation.mutate(encomenda.idEncomenda)}
                        >
                          Gerar código
                        </button>
                      ) : null}

                      {hasRole('ADMIN') ? (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteMutation.mutate(encomenda.idEncomenda)}
                        >
                          Excluir
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
