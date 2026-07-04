import { apiFetch, setToken, clearToken, getToken } from './client';

export type Role = 'student' | 'teacher';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'profesor' | 'estudiante';
  role: Role | 'admin';
  carrera?: { nombre: string } | null;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(id: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  });
  await setToken(data.token);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/users/me');
}

export async function logout(): Promise<void> {
  await clearToken();
}

export async function hasSession(): Promise<boolean> {
  return (await getToken()) != null;
}
