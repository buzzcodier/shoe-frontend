import { api } from "./client";

export type Category = {
  id: number;
  name: string;
  description: string;
  shoe_count: number;
};

export type CategoryPayload = {
  name: string;
  description?: string;
};

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories/");
  return data.results ?? data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post("/categories/", payload);
  return data as Category;
}

export async function updateCategory(id: number, payload: CategoryPayload) {
  const { data } = await api.put(`/categories/${id}/`, payload);
  return data as Category;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}/`);
}