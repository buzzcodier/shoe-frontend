import { api } from "./client";

export type PaymentMethod = "CASH" | "MPESA";

export type SaleItem = {
  id: number;
  shoe_variant: number;
  shoe_id: number;
  shoe_name: string;
  company_name: string;
  size: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type Sale = {
  id: number;
  cashier: number;
  cashier_username: string;
  total_amount: string;
  payment_method: PaymentMethod;
  created_at: string;
  item_count: number;
  items: SaleItem[];
};

export type CheckoutItem = {
  shoe_variant_id: number;
  quantity: number;
  unit_price: string;
};

export type CheckoutPayload = {
  payment_method: PaymentMethod;
  items: CheckoutItem[];
};

export async function checkout(payload: CheckoutPayload): Promise<Sale> {
  const { data } = await api.post("/sales/checkout/", payload);
  return data;
}

export async function listSales(): Promise<Sale[]> {
  const { data } = await api.get("/sales/");
  return data.results ?? data;
}

export async function getSale(id: number): Promise<Sale> {
  const { data } = await api.get(`/sales/${id}/`);
  return data;
}