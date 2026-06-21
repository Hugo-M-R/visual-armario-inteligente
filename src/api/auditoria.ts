import { apiClient } from '@/api/client';
import type { RegistroAuditoria } from '@/types';

export async function listAuditoria(): Promise<RegistroAuditoria[]> {
  const response = await apiClient.get<RegistroAuditoria[]>('/api/auditoria');
  return response.data;
}
