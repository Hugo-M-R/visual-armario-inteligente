import { apiClient } from '@/api/client';
import type {
  CodigoAcessoResponse,
  Encomenda,
  EncomendaRequest,
} from '@/types';

export async function listEncomendas(): Promise<Encomenda[]> {
  const response = await apiClient.get<Encomenda[]>('/api/encomendas');
  return response.data;
}

export async function createEncomenda(data: EncomendaRequest): Promise<Encomenda> {
  const response = await apiClient.post<Encomenda>('/api/encomendas', data);
  return response.data;
}

export async function gerarCodigo(id: string): Promise<CodigoAcessoResponse> {
  const response = await apiClient.post<CodigoAcessoResponse>(`/api/encomendas/${id}/gerar-codigo`);
  return response.data;
}

export async function validarCodigo(id: string, codigo: string): Promise<boolean> {
  const response = await apiClient.post<{ valido: boolean }>(`/api/encomendas/${id}/validar-codigo`, { codigo });
  return response.data.valido;
}

export async function retirarEncomenda(id: string, codigo?: string): Promise<Encomenda> {
  const response = await apiClient.post<Encomenda>(`/api/encomendas/${id}/retirar`, codigo ? { codigo } : undefined);
  return response.data;
}

export async function deleteEncomenda(id: string): Promise<void> {
  await apiClient.delete(`/api/encomendas/${id}`);
}
