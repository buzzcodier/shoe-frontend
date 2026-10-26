import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Banknote,
  TrendingUp,
  ShoppingBag,
  Package,
  ArrowRight,
  AlertTriangle,
  WifiOff,
} from "lucide-react";

import { getDashboard } from "../../api/reports";
import { useAuth } from "../../features/auth/AuthContext";
import MetricCard from "../../components/MetricCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
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
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { formatLastSync } from "../../lib/cache";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const { data, isLoading } = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: getDashboard,
    refetchInterval: 30_000,
    enabled: online,
  });

  // Offline notice — dashboard metrics aren't meaningful offline
  if (!online) {
    return (
      <div className="p-4 md:p-8">
        <div className="border rounded-lg p-6 bg-amber-50 border-amber-200 text-center space-y-3 max-w-md mx-auto mt-12">
          <WifiOff className="h-10 w-10 text-amber-600 mx-auto" />
          <h2 className="font-semibold text-amber-900 text-lg">
            Dashboard is unavailable offline
          </h2>
          <p className="text-sm text-amber-800">
            Sales metrics and reports require a live connection.
          </p>
          <p className="text-xs text-amber-700">
            Last synced: {formatLastSync()}
          </p>
          <div className="pt-3 flex gap-2 justify-center">
            <Button onClick={() => navigate("/pos")}>
              Open POS (browse only)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/shoes")}
            >
              Browse shoes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {user?.username}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's how the shop is doing today.
          </p>
        </div>
        <Button onClick={() => navigate("/pos")}>
          Open POS
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Today's sales"
          value={formatKsh(data.today_sales_total)}
          icon={Banknote}
          hint={`${data.today_transaction_count} transaction${
            data.today_transaction_count === 1 ? "" : "s"
          }`}
          tone="positive"
        />
        <MetricCard
          label="Today's profit"
          value={formatKsh(data.today_profit)}
          icon={TrendingUp}
          tone="positive"
        />
        <MetricCard
          label="Stock value"
          value={formatKsh(data.stock_value)}
          icon={Package}
          hint="Cost of everything on the shelf"
        />
        <MetricCard
          label="Items sold today"
          value={String(
            data.recent_sales.reduce((sum, s) => sum + s.item_count, 0)
          )}
          icon={ShoppingBag}
          hint="From today's sales"
        />
      </div>

      {/* Two-column area */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Low stock
                </CardTitle>
                <CardDescription>
                  Sizes running low. Restock soon.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.low_stock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All sizes are well stocked.
              </p>
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
                  {data.low_stock.map((item) => (
                    <TableRow
                      key={item.variant_id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => navigate(`/shoes/${item.shoe_id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{item.shoe_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.company_name}
                        </div>
                      </TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            item.quantity === 0 ? "destructive" : "secondary"
                          }
                        >
                          {item.quantity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top sellers this week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top sellers this week</CardTitle>
            <CardDescription>Best-performing shoes, last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.top_sellers_week.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sales yet this week.
              </p>
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
                  {data.top_sellers_week.map((item) => (
                    <TableRow key={item.shoe_id}>
                      <TableCell>
                        <div className="font-medium">{item.shoe_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.company_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatKsh(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent sales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent sales</CardTitle>
              <CardDescription>The last 10 transactions.</CardDescription>
            </div>
            <Link to="/sales">
              <Button variant="outline" size="sm">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.recent_sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sales yet. Open the POS to ring one up.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_sales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => navigate(`/sales/${sale.id}`)}
                  >
                    <TableCell className="text-muted-foreground">
                      {sale.id}
                    </TableCell>
                    <TableCell>{sale.cashier}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.item_count}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatKsh(sale.total_amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleString("en-KE")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}