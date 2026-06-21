import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/utils/format';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi({ email, senha });
      await login(response.token);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao autenticar.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>📦</span>
          <h1>Armário Inteligente</h1>
          <p>Acesse sua conta para gerenciar encomendas.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error ? <div className="alert alert-error">{error}</div> : null}

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta? <Link to="/register">Cadastre-se como morador</Link>
        </p>
      </div>
    </div>
  );
}
