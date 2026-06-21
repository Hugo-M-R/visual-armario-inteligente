import { apiClient } from '@/api/client';
import type { Compartimento } from '@/types';

export async function listCompartimentos(): Promise<Compartimento[]> {
  const response = await apiClient.get<Compartimento[]>('/api/compartimentos');
  return response.data;
}
