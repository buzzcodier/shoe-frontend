import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

import { listSales } from "../../api/sales";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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

export default function SalesPage() {
  const navigate = useNavigate();
  const online = useOnlineStatus();

  if (!online) return <OfflineNotice pageName="Sales" />;

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: listSales,
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sales</h1>
        <p className="text-muted-foreground text-sm">
          Every sale, newest first.
        </p>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No sales yet. Ring one up from the POS.
                </TableCell>
              </TableRow>
            )}
            {sales.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => navigate(`/sales/${s.id}`)}
              >
                <TableCell className="text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">{s.cashier_username}</TableCell>
                <TableCell>{s.item_count}</TableCell>
                <TableCell>
                  <Badge variant="outline">{s.payment_method}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatKsh(s.total_amount)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(s.created_at).toLocaleString("en-KE")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/sales/${s.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <div className="md:hidden space-y-2">
        {isLoading && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            Loading…
          </p>
        )}
        {!isLoading && sales.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No sales yet. Ring one up from the POS.
          </p>
        )}
        {sales.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate(`/sales/${s.id}`)}
            className="w-full text-left border rounded-lg p-3 bg-card active:bg-muted/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium">Sale #{s.id}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.cashier_username} · {s.item_count} item
                  {s.item_count === 1 ? "" : "s"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">
                  {formatKsh(s.total_amount)}
                </div>
                <Badge variant="outline" className="text-[10px] mt-0.5">
                  {s.payment_method}
                </Badge>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(s.created_at).toLocaleString("en-KE")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}