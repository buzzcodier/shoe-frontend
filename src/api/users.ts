import { api } from "./client";
import type { Role } from "./auth";

export type UserRecord = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
};

export type UserPayload = {
  username: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  phone?: string;
  is_active?: boolean;
};

export async function listUsers(): Promise<UserRecord[]> {
  const { data } = await api.get("/auth/users/");
  return data.results ?? data;
}

export async function createUser(payload: UserPayload) {
  const { data } = await api.post("/auth/users/", payload);
  return data as UserRecord;
}

export async function updateUser(id: number, payload: Partial<UserPayload>) {
  const { data } = await api.patch(`/auth/users/${id}/`, payload);
  return data as UserRecord;
}

export async function resetPassword(id: number, newPassword: string) {
  const { data } = await api.post(`/auth/users/${id}/reset-password/`, {
    new_password: newPassword,
  });
  return data;
}

export async function toggleActive(id: number) {
  const { data } = await api.post(`/auth/users/${id}/toggle-active/`);
  return data as UserRecord;
}