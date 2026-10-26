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
import { CACHE_KEYS, getCache, setCache } from "@/lib/cache";

// ... existing types ...

export async function listCompanies(): Promise<Company[]> {
  try {
    const { data } = await api.get("/shoes/companies/");
    const companies = data.results ?? data;
    setCache(CACHE_KEYS.companies, companies);
    return companies;
  } catch (err: any) {
    if (!err.response) {
      const cached = getCache<Company[]>(CACHE_KEYS.companies);
      if (cached) return cached;
    }
    throw err;
  }
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