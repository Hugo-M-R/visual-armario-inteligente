import { apiClient } from '@/api/client';
import type { Usuario, UsuarioCreateRequest } from '@/types';

export async function listUsuarios(): Promise<Usuario[]> {
  const response = await apiClient.get<Usuario[]>('/api/usuarios');
  return response.data;
}

export async function createUsuario(data: UsuarioCreateRequest): Promise<Usuario> {
  const response = await apiClient.post<Usuario>('/api/usuarios', data);
  return response.data;
}

export async function updateUsuarioAtivo(id: string, ativo: boolean): Promise<Usuario> {
  const response = await apiClient.patch<Usuario>(`/api/usuarios/${id}/ativo`, { ativo });
  return response.data;
}

export async function deleteUsuario(id: string): Promise<void> {
  await apiClient.delete(`/api/usuarios/${id}`);
}

export async function getUsuario(id: string): Promise<Usuario> {
  const response = await apiClient.get<Usuario>(`/api/usuarios/${id}`);
  return response.data;
}
