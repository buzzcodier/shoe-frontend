import { api } from "./client";

// ---------- Suppliers ----------
export type Supplier = {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
  purchase_count: number;
};

export type SupplierPayload = {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
};

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get("/purchases/suppliers/");
  return data.results ?? data;
}

export async function createSupplier(payload: SupplierPayload) {
  const { data } = await api.post("/purchases/suppliers/", payload);
  return data as Supplier;
}

export async function updateSupplier(id: number, payload: SupplierPayload) {
  const { data } = await api.put(`/purchases/suppliers/${id}/`, payload);
  return data as Supplier;
}

export async function deleteSupplier(id: number) {
  await api.delete(`/purchases/suppliers/${id}/`);
}

// ---------- Pack templates ----------
export type PackTemplateItem = {
  id?: number;
  template?: number;
  variant: number;
  size?: number;
  shoe_id?: number;
  quantity: number;
};

export type PackTemplate = {
  id: number;
  shoe: number;
  shoe_name: string;
  company_name: string;
  name: string;
  notes: string;
  total_pairs: number;
  items: PackTemplateItem[];
  created_at: string;
};

export type PackTemplatePayload = {
  shoe: number;
  name: string;
  notes?: string;
  items: { variant: number; quantity: number }[];
};

export async function listPackTemplates(shoeId?: number): Promise<PackTemplate[]> {
  const params: Record<string, string> = {};
  if (shoeId) params.shoe = String(shoeId);
  const { data } = await api.get("/purchases/pack-templates/", { params });
  return data.results ?? data;
}

export async function createPackTemplate(payload: PackTemplatePayload) {
  const { data } = await api.post("/purchases/pack-templates/", payload);
  return data as PackTemplate;
}

export async function updatePackTemplate(id: number, payload: PackTemplatePayload) {
  const { data } = await api.put(`/purchases/pack-templates/${id}/`, payload);
  return data as PackTemplate;
}

export async function deletePackTemplate(id: number) {
  await api.delete(`/purchases/pack-templates/${id}/`);
}

// ---------- Purchases ----------
export type PurchaseItem = {
  id: number;
  shoe_variant: number;
  shoe_id: number;
  shoe_name: string;
  company_name: string;
  size: number;
  quantity: number;
  buying_price: string;
  subtotal: string;
};

export type Purchase = {
  id: number;
  supplier: number;
  supplier_name: string;
  received_by: number;
  received_by_username: string;
  total_cost: string;
  notes: string;
  created_at: string;
  item_count: number;
  items: PurchaseItem[];
};

export async function listPurchases(): Promise<Purchase[]> {
  const { data } = await api.get("/purchases/");
  return data.results ?? data;
}

export async function getPurchase(id: number): Promise<Purchase> {
  const { data } = await api.get(`/purchases/${id}/`);
  return data;
}

// ---------- Receive ----------
export type ReceiveLine = {
  shoe_variant_id?: number;
  quantity?: number;
  pack_template_id?: number;
  packs?: number;
  buying_price: string;
};

export type ReceivePayload = {
  supplier: number;
  notes?: string;
  items: ReceiveLine[];
};

export async function receiveStock(payload: ReceivePayload): Promise<Purchase> {
  const { data } = await api.post("/purchases/receive/", payload);
  return data;
}