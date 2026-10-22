
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


import {
  getBestSellers,
  getBestSizes,
  getByCashier,
  getByPayment,
  getSalesSummary,
  getStockValue,
  getLowStock,
} from "../../api/reports";
import MetricCard from "../../components/MetricCard";
import { Badge } from "../..//components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { formatKsh } from "../../lib/format";
import { Banknote, TrendingUp, ShoppingBag, Coins } from "lucide-react";

type Tab = "sales" | "products" | "cashiers" | "stock";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("sales");

  // Date range — defaults to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const [start, setStart] = useState(
    thirtyDaysAgo.toISOString().slice(0, 10)
  );
  const [end, setEnd] = useState(today.toISOString().slice(0, 10));

  const summaryQuery = useQuery({
    queryKey: ["reports-summary", start, end],
    queryFn: () => getSalesSummary(start, end),
  });

  const bestSellersQuery = useQuery({
    queryKey: ["reports-best-sellers", start, end],
    queryFn: () => getBestSellers(start, end, 10),
  });

  const bestSizesQuery = useQuery({
    queryKey: ["reports-best-sizes", start, end],
    queryFn: () => getBestSizes(start, end, 10),
  });

  const byCashierQuery = useQuery({
    queryKey: ["reports-by-cashier", start, end],
    queryFn: () => getByCashier(start, end),
  });

  const byPaymentQuery = useQuery({
    queryKey: ["reports-by-payment", start, end],
    queryFn: () => getByPayment(start, end),
  });

  const stockValueQuery = useQuery({
    queryKey: ["reports-stock-value"],
    queryFn: getStockValue,
  });

  const lowStockQuery = useQuery({
    queryKey: ["reports-low-stock"],
    queryFn: () => getLowStock(50),
  });

  const summary = summaryQuery.data;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground text-sm">
          Sales, products, cashiers, and stock at a glance.
        </p>
      </div>

      {/* Date range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="start">From</Label>
              <Input
                id="start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end">To</Label>
              <Input
                id="end"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const t = new Date();
                const m = new Date();
                m.setDate(t.getDate() - 29);
                setStart(m.toISOString().slice(0, 10));
                setEnd(t.toISOString().slice(0, 10));
              }}
            >
              Last 30 days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary metrics */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={formatKsh(summary.total_revenue)}
            icon={Banknote}
            hint={`${summary.transaction_count} transactions`}
            tone="positive"
          />
          <MetricCard
            label="Profit"
            value={formatKsh(summary.total_profit)}
            icon={TrendingUp}
            tone="positive"
          />
          <MetricCard
            label="Cost of goods sold"
            value={formatKsh(summary.total_cost)}
            icon={Coins}
          />
          <MetricCard
            label="Units sold"
            value={String(summary.units_sold)}
            icon={ShoppingBag}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: "sales", label: "Sales" },
          { key: "products", label: "Products" },
          { key: "cashiers", label: "Cashiers" },
          { key: "stock", label: "Stock" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "sales" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By payment method</CardTitle>
            </CardHeader>
            <CardContent>
              {!byPaymentQuery.data || byPaymentQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byPaymentQuery.data.map((row) => (
                      <TableRow key={row.payment_method}>
                        <TableCell>
                          <Badge variant="outline">{row.payment_method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatKsh(row.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "products" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best-selling shoes</CardTitle>
              <CardDescription>Top 10 by units sold.</CardDescription>
            </CardHeader>
            <CardContent>
              {!bestSellersQuery.data || bestSellersQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales in range.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shoe</TableHead>
                      <TableHead className="text-right">Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bestSellersQuery.data.map((row) => (
                      <TableRow key={row.shoe_id}>
                        <TableCell>
                          <div className="font-medium">{row.shoe_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.company_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatKsh(row.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best-selling sizes</CardTitle>
              <CardDescription>Top 10 sizes by units sold.</CardDescription>
            </CardHeader>
            <CardContent>
              {!bestSizesQuery.data || bestSizesQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales in range.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bestSizesQuery.data.map((row) => (
                      <TableRow key={row.size}>
                        <TableCell className="font-medium">{row.size}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "cashiers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by cashier</CardTitle>
          </CardHeader>
          <CardContent>
            {!byCashierQuery.data || byCashierQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales in range.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCashierQuery.data.map((row) => (
                    <TableRow key={row.cashier}>
                      <TableCell className="font-medium">{row.cashier}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">
                        {formatKsh(row.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "stock" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock value</CardTitle>
              <CardDescription>Current value of everything on the shelf.</CardDescription>
            </CardHeader>
            <CardContent>
              {stockValueQuery.data && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total pairs</span>
                    <span className="font-medium">
                      {stockValueQuery.data.total_pairs}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost value</span>
                    <span className="font-medium">
                      {formatKsh(stockValueQuery.data.total_cost_value)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retail value</span>
                    <span className="font-medium">
                      {formatKsh(stockValueQuery.data.total_retail_value)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Potential profit</span>
                    <span className="font-semibold text-green-600">
                      {formatKsh(
                        (
                          parseFloat(stockValueQuery.data.total_retail_value) -
                          parseFloat(stockValueQuery.data.total_cost_value)
                        ).toFixed(2)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Low stock items</CardTitle>
              <CardDescription>
                Sizes below the threshold. Restock soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!lowStockQuery.data || lowStockQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">All well stocked.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shoe</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockQuery.data.map((row) => (
                      <TableRow key={row.variant_id}>
                        <TableCell>
                          <div className="font-medium">{row.shoe_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.company_name}
                          </div>
                        </TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              row.quantity === 0 ? "destructive" : "secondary"
                            }
                          >
                            {row.quantity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}