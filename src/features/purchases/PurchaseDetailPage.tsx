import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getPurchase } from "../../api/purchases";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { formatKsh } from "../../lib/format";
import OfflineNotice from "../../components/OfflineNotice";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const purchaseId = Number(id);
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const { data: purchase, isLoading, isError } = useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: () => getPurchase(purchaseId),
    enabled: Number.isFinite(purchaseId) && online,
  });

  if (!online) return <OfflineNotice pageName="Purchase details" />;

  if (isLoading) {
    return <div className="p-4 md:p-8 text-muted-foreground">Loading…</div>;
  }

  if (isError || !purchase) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <p className="text-destructive">Could not load purchase.</p>
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Link
        to="/purchases"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to purchases
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Purchase #{purchase.id}</h1>
        <p className="text-muted-foreground text-sm">
          {new Date(purchase.created_at).toLocaleString("en-KE")} · by{" "}
          {purchase.received_by_username}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{purchase.supplier_name}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{purchase.item_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Total cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatKsh(purchase.total_cost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {purchase.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{purchase.notes}</CardContent>
        </Card>
      )}

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shoe</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Buying price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.items.map((item) => (
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
                  {formatKsh(item.buying_price)}
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