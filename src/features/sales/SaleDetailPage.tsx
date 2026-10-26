import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getSale } from "../../api/sales";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
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
import OfflineNotice from "../../components/OfflineNotice";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const saleId = Number(id);
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const { data: sale, isLoading, isError } = useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => getSale(saleId),
    enabled: Number.isFinite(saleId) && online,
  });

  if (!online) return <OfflineNotice pageName="Sale details" />;

  if (isLoading) {
    return <div className="p-4 md:p-8 text-muted-foreground">Loading…</div>;
  }

  if (isError || !sale) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <p className="text-destructive">Could not load sale.</p>
        <Button variant="outline" onClick={() => navigate("/sales")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sales
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Link
        to="/sales"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to sales
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Sale #{sale.id}</h1>
          <p className="text-muted-foreground text-sm">
            {new Date(sale.created_at).toLocaleString("en-KE")} · by{" "}
            {sale.cashier_username}
          </p>
        </div>
        <Badge variant="outline">{sale.payment_method}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Items sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{sale.item_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatKsh(sale.total_amount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Cashier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{sale.cashier_username}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shoe</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.shoe_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.company_name}
                  </div>
                </TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatKsh(item.unit_price)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatKsh(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}