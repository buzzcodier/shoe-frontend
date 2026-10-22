import { api, TOKEN_KEY, REFRESH_KEY } from "./client";

export type Role = "OWNER" | "MANAGER" | "CASHIER" | "STOCK_MANAGER";

export type Me = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone: string;
  is_active: boolean;
};

export async function login(username: string, password: string) {
  const { data } = await api.post("/auth/token/", { username, password });
  localStorage.setItem(TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  return data;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get("/auth/users/me/");
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function canManage(user: Me | null): boolean {
  return user?.role === "OWNER" || user?.role === "MANAGER";
}

export function isOwner(user: Me | null): boolean {
  return user?.role === "OWNER";
}

export function canStock(user: Me | null): boolean {
  return (
    user?.role === "OWNER" ||
    user?.role === "MANAGER" ||
    user?.role === "STOCK_MANAGER"
  );
}