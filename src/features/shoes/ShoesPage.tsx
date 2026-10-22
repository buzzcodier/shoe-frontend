import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import {
  listShoes,
  createShoe,
  updateShoe,
  deleteShoe,
  type Shoe,
  type ShoePayload,
} from "../../api/shoes";
import { listCategories } from "../../api/categories";
import { listCompanies } from "../../api/companies";
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
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatKsh } from "../../lib/format";
import ShoeForm from "./ShoesForm";

export default function ShoesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Shoe | null>(null);

  const { data: shoes = [], isLoading } = useQuery({
    queryKey: ["shoes"],
    queryFn: listShoes,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["shoes"] });

  const createMut = useMutation({
    mutationFn: (payload: ShoePayload) => createShoe(payload),
    onSuccess: () => {
      toast.success("Shoe created");
      invalidate();
    },
    onError: () => toast.error("Could not create shoe"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ShoePayload }) =>
      updateShoe(id, payload),
    onSuccess: () => {
      toast.success("Shoe updated");
      invalidate();
    },
    onError: () => toast.error("Could not update shoe"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteShoe(id),
    onSuccess: () => {
      toast.success("Shoe deleted");
      invalidate();
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Could not delete shoe");
    },
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shoes</h1>
          <p className="text-muted-foreground text-sm">
            Your catalog. Click a shoe to manage its sizes and stock.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New shoe</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="text-right">Buying</TableHead>
              <TableHead className="text-right">Selling</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && shoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No shoes yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {shoes.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => navigate(`/shoes/${s.id}`)}
              >
                <TableCell className="text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">
                  {s.name}
                  {s.model_number && (
                    <div className="text-xs text-muted-foreground">
                      {s.model_number}
                    </div>
                  )}
                </TableCell>
                <TableCell>{s.company_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{s.gender}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatKsh(s.buying_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatKsh(s.selling_price)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={s.total_stock > 0 ? "default" : "destructive"}
                  >
                    {s.total_stock}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/shoes/${s.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(s);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title={`Delete "${s.name}"?`}
                    description="This will also delete all size variants and stock for this shoe."
                    onConfirm={() => deleteMut.mutateAsync(s.id)}
                  >
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </ConfirmDialog>
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
        {!isLoading && shoes.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No shoes yet. Create one to get started.
          </p>
        )}
        {shoes.map((s) => (
          <div key={s.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => navigate(`/shoes/${s.id}`)}
              >
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.company_name} · {s.category_name}
                </div>
                {s.model_number && (
                  <div className="text-xs text-muted-foreground truncate">
                    {s.model_number}
                  </div>
                )}
              </button>
              <Badge
                variant={s.total_stock > 0 ? "default" : "destructive"}
                className="shrink-0"
              >
                {s.total_stock}
              </Badge>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-sm font-semibold">
                  {formatKsh(s.selling_price)}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {s.gender}
                </Badge>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/shoes/${s.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditing(s);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDialog
                  title={`Delete "${s.name}"?`}
                  description="This will also delete all size variants and stock for this shoe."
                  onConfirm={() => deleteMut.mutateAsync(s.id)}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ShoeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        categories={categories}
        companies={companies}
        onSubmit={async (payload) => {
          if (editing) {
            await updateMut.mutateAsync({ id: editing.id, payload });
          } else {
            await createMut.mutateAsync(payload);
          }
        }}
      />
    </div>
  );
}