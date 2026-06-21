import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/utils/format';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await registerApi({ nome, email, senha, telefone });
      await login(response.token);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao registrar.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>📦</span>
          <h1>Criar conta</h1>
          <p>Cadastro público disponível apenas para moradores.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error ? <div className="alert alert-error">{error}</div> : null}

          <label>
            Nome completo
            <input value={nome} onChange={(event) => setNome(event.target.value)} required />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Telefone
            <input value={telefone} onChange={(event) => setTelefone(event.target.value)} />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-footer">
          Já possui conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
