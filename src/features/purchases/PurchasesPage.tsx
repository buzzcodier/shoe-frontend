import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, PackagePlus } from "lucide-react";

import { listPurchases } from "../../api/purchases";
import { Button } from "../../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { formatKsh } from "../../lib/format";

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: listPurchases,
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchases</h1>
          <p className="text-muted-foreground text-sm">
            Stock that came into the shop.
          </p>
        </div>
        <Button onClick={() => navigate("/purchases/receive")}>
          <PackagePlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Receive stock</span>
          <span className="sm:hidden">Receive</span>
        </Button>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Received by</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total cost</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16"></TableHead>
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
            {!isLoading && purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No purchases yet. Receive stock to get started.
                </TableCell>
              </TableRow>
            )}
            {purchases.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => navigate(`/purchases/${p.id}`)}
              >
                <TableCell className="text-muted-foreground">{p.id}</TableCell>
                <TableCell className="font-medium">{p.supplier_name}</TableCell>
                <TableCell>{p.received_by_username}</TableCell>
                <TableCell>{p.item_count}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatKsh(p.total_cost)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(p.created_at).toLocaleString("en-KE")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/purchases/${p.id}`)}>
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
        {!isLoading && purchases.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No purchases yet. Receive stock to get started.
          </p>
        )}
        {purchases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(`/purchases/${p.id}`)}
            className="w-full text-left border rounded-lg p-3 bg-card active:bg-muted/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">
                  Purchase #{p.id}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.supplier_name}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">
                  {formatKsh(p.total_cost)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.item_count} item{p.item_count === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(p.created_at).toLocaleString("en-KE")}</span>
              <span>by {p.received_by_username}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}