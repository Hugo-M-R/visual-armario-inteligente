import { apiClient } from '@/api/client';
import type { Notificacao } from '@/types';

export async function listNotificacoes(): Promise<Notificacao[]> {
  const response = await apiClient.get<Notificacao[]>('/api/notificacoes');
  return response.data;
}

export async function marcarNotificacaoLida(id: string): Promise<Notificacao> {
  const response = await apiClient.patch<Notificacao>(`/api/notificacoes/${id}/lida`);
  return response.data;
}
