import { api } from "./client";

export type Gender = "MALE" | "FEMALE" | "UNISEX" | "CHILDREN";

export type ShoeVariant = {
  id: number;
  shoe: number;
  size: number;
  quantity: number;
  selling_price: string | null;
  effective_price: string;
};

export type Shoe = {
  id: number;
  name: string;
  model_number: string;
  category: number;
  category_name: string;
  company: number;
  company_name: string;
  material: string;
  gender: Gender;
  description: string;
  buying_price: string;
  selling_price: string;
  image: string | null;
  active: boolean;
  total_stock: number;
  created_at: string;
  updated_at: string;
  variants: ShoeVariant[];
};

export type ShoePayload = {
  name: string;
  model_number?: string;
  category: number;
  company: number;
  material?: string;
  gender: Gender;
  description?: string;
  buying_price: string;
  selling_price: string;
  active?: boolean;
};

export async function listShoes(): Promise<Shoe[]> {
  const { data } = await api.get("/shoes/shoes/");
  return data.results ?? data;
}

export async function getShoe(id: number): Promise<Shoe> {
  const { data } = await api.get(`/shoes/shoes/${id}/`);
  return data;
}

export async function createShoe(payload: ShoePayload) {
  const { data } = await api.post("/shoes/shoes/", payload);
  return data as Shoe;
}

export async function updateShoe(id: number, payload: ShoePayload) {
  const { data } = await api.put(`/shoes/shoes/${id}/`, payload);
  return data as Shoe;
}

export async function deleteShoe(id: number) {
  await api.delete(`/shoes/shoes/${id}/`);
}

// Variants
export type VariantPayload = {
  shoe: number;
  size: number;
  quantity: number;
  selling_price?: string | null;
};

export async function createVariant(payload: VariantPayload) {
  const { data } = await api.post("/shoes/variants/", payload);
  return data as ShoeVariant;
}

export async function updateVariant(id: number, payload: VariantPayload) {
  const { data } = await api.put(`/shoes/variants/${id}/`, payload);
  return data as ShoeVariant;
}

export async function deleteVariant(id: number) {
  await api.delete(`/shoes/variants/${id}/`);
}