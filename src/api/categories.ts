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

import { CACHE_KEYS, getCache, setCache } from "@/lib/cache";

// ... existing types ...

export async function listCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get("/categories/");
    const categories = data.results ?? data;
    setCache(CACHE_KEYS.categories, categories);
    return categories;
  } catch (err: any) {
    if (!err.response) {
      const cached = getCache<Category[]>(CACHE_KEYS.categories);
      if (cached) return cached;
    }
    throw err;
  }
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