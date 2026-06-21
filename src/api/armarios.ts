import { apiClient } from '@/api/client';
import type { Armario, ArmarioStatus } from '@/types';

export async function listArmarios(): Promise<Armario[]> {
  const response = await apiClient.get<Armario[]>('/api/armarios');
  return response.data;
}

export async function createArmario(data: Pick<Armario, 'numero' | 'localizacao' | 'status'>): Promise<Armario> {
  const response = await apiClient.post<Armario>('/api/armarios', data);
  return response.data;
}

export async function updateArmarioStatus(id: string, novoStatus: ArmarioStatus): Promise<Armario> {
  const response = await apiClient.put<Armario>(`/api/armarios/${id}/status`, null, {
    params: { novoStatus },
  });
  return response.data;
}

export async function countArmariosByStatus(status: ArmarioStatus): Promise<number> {
  const response = await apiClient.get<number>(`/api/armarios/contar/${status}`);
  return response.data;
}
