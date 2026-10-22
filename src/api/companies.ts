import { api } from "./client";

export type Company = {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  shoe_count: number;
};

export type CompanyPayload = {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export async function listCompanies(): Promise<Company[]> {
  const { data } = await api.get("/shoes/companies/");
  return data.results ?? data;
}

export async function createCompany(payload: CompanyPayload) {
  const { data } = await api.post("/shoes/companies/", payload);
  return data as Company;
}

export async function updateCompany(id: number, payload: CompanyPayload) {
  const { data } = await api.put(`/shoes/companies/${id}/`, payload);
  return data as Company;
}

export async function deleteCompany(id: number) {
  await api.delete(`/shoes/companies/${id}/`);
}