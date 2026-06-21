import type { FormEvent } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUsuario, deleteUsuario, listUsuarios, updateUsuarioAtivo } from '@/api/usuarios';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoUsuario, UsuarioCreateRequest } from '@/types';
import { formatDateTime, formatTipoUsuario, getApiErrorMessage } from '@/utils/format';

const defaultForm: UsuarioCreateRequest = {
  nome: '',
  email: '',
  senha: '',
  telefone: '',
  tipo: 'MORADOR',
};

export function UsuariosPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState<UsuarioCreateRequest>(defaultForm);

  const usuariosQuery = useQuery({ queryKey: ['usuarios'], queryFn: listUsuarios });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['usuarios'] });

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      setFeedback('Usuário criado com sucesso.');
      setShowForm(false);
      setForm(defaultForm);
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const ativoMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => updateUsuarioAtivo(id, ativo),
    onSuccess: () => {
      setFeedback('Status do usuário atualizado.');
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      setFeedback('Usuário removido.');
      invalidate();
    },
    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  if (usuariosQuery.isLoading) return <LoadingState />;
  if (usuariosQuery.error) return <ErrorAlert message="Erro ao carregar usuários." />;

  const usuarios = usuariosQuery.data ?? [];
  const tiposPermitidos: TipoUsuario[] = hasRole('ADMIN') ? ['MORADOR', 'PORTEIRO', 'ADMIN'] : ['MORADOR'];

  return (
    <section>
      <PageHeader
        title="Usuários"
        description="Cadastro e gestão de moradores, porteiros e administradores."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Fechar formulário' : 'Novo usuário'}
          </button>
        }
      />

      {feedback ? <div className="alert alert-info">{feedback}</div> : null}

      {showForm ? (
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Telefone
            <input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={form.senha}
              onChange={(event) => setForm({ ...form, senha: event.target.value })}
              required
            />
          </label>
          <label>
            Tipo
            <select
              value={form.tipo}
              onChange={(event) => setForm({ ...form, tipo: event.target.value as TipoUsuario })}
            >
              {tiposPermitidos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {formatTipoUsuario(tipo)}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              Criar usuário
            </button>
          </div>
        </form>
      ) : null}

      {usuarios.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{formatTipoUsuario(usuario.tipo)}</td>
                  <td>
                    <StatusBadge
                      label={usuario.ativo ? 'Ativo' : 'Inativo'}
                      tone={usuario.ativo ? 'success' : 'danger'}
                    />
                  </td>
                  <td>{formatDateTime(usuario.dataCriacao)}</td>
                  <td className="actions-cell">
                    {hasRole('ADMIN') ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => ativoMutation.mutate({ id: usuario.id, ativo: !usuario.ativo })}
                        >
                          {usuario.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteMutation.mutate(usuario.id)}
                        >
                          Excluir
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
