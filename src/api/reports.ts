import { api } from "./client";

export type DashboardData = {
  today_sales_total: string;
  today_profit: string;
  today_transaction_count: number;
  stock_value: string;
  low_stock: {
    variant_id: number;
    shoe_id: number;
    shoe_name: string;
    company_name: string;
    size: number;
    quantity: number;
  }[];
  recent_sales: {
    id: number;
    cashier: string;
    total_amount: string;
    payment_method: string;
    created_at: string;
    item_count: number;
  }[];
  top_sellers_week: {
    shoe_id: number;
    shoe_name: string;
    company_name: string;
    quantity: number;
    revenue: string;
  }[];
};

export type SalesSummary = {
  start: string;
  end: string;
  total_revenue: string;
  total_cost: string;
  total_profit: string;
  transaction_count: number;
  units_sold: number;
};

export type BestSeller = {
  shoe_id: number;
  shoe_name: string;
  company_name: string;
  quantity: number;
  revenue: string;
};

export type BestSize = {
  size: number;
  quantity: number;
};

export type ByCashier = {
  cashier: string;
  count: number;
  total: string;
};

export type ByPayment = {
  payment_method: string;
  count: number;
  total: string;
};

export type StockValue = {
  total_pairs: number;
  total_cost_value: string;
  total_retail_value: string;
};

export type LowStockItem = {
  variant_id: number;
  shoe_id: number;
  shoe_name: string;
  company_name: string;
  size: number;
  quantity: number;
};

function rangeParams(start?: string, end?: string) {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  return params;
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get("/reports/dashboard/");
  return data;
}

export async function getSalesSummary(start?: string, end?: string): Promise<SalesSummary> {
  const { data } = await api.get("/reports/sales-summary/", {
    params: rangeParams(start, end),
  });
  return data;
}

export async function getBestSellers(
  start?: string,
  end?: string,
  limit = 10
): Promise<BestSeller[]> {
  const { data } = await api.get("/reports/best-sellers/", {
    params: { ...rangeParams(start, end), limit },
  });
  return data;
}

export async function getBestSizes(
  start?: string,
  end?: string,
  limit = 10
): Promise<BestSize[]> {
  const { data } = await api.get("/reports/best-sizes/", {
    params: { ...rangeParams(start, end), limit },
  });
  return data;
}

export async function getByCashier(start?: string, end?: string): Promise<ByCashier[]> {
  const { data } = await api.get("/reports/by-cashier/", {
    params: rangeParams(start, end),
  });
  return data;
}

export async function getByPayment(start?: string, end?: string): Promise<ByPayment[]> {
  const { data } = await api.get("/reports/by-payment/", {
    params: rangeParams(start, end),
  });
  return data;
}

export async function getStockValue(): Promise<StockValue> {
  const { data } = await api.get("/reports/stock-value/");
  return data;
}

export async function getLowStock(limit = 50): Promise<LowStockItem[]> {
  const { data } = await api.get("/reports/low-stock/", { params: { limit } });
  return data;
}