import { apiClient } from '@/api/client';
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
  Usuario,
} from '@/types';

export async function login(data: AuthenticationRequest): Promise<AuthenticationResponse> {
  const response = await apiClient.post<AuthenticationResponse>('/api/v1/auth/authenticate', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthenticationResponse> {
  const response = await apiClient.post<AuthenticationResponse>('/api/v1/auth/register', data);
  return response.data;
}

export async function getMe(): Promise<Usuario> {
  const response = await apiClient.get<Usuario>('/api/v1/auth/me');
  return response.data;
}
