import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
  type SupplierPayload,
} from "../../api/purchases";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ConfirmDialog from "../../components/ConfirmDialog";
import SupplierForm from "./SupplierForm";

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["suppliers"] });

  const createMut = useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      toast.success("Supplier created");
      invalidate();
    },
    onError: () => toast.error("Could not create supplier"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupplierPayload }) =>
      updateSupplier(id, payload),
    onSuccess: () => {
      toast.success("Supplier updated");
      invalidate();
    },
    onError: () => toast.error("Could not update supplier"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      toast.success("Supplier deleted");
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not delete supplier");
    },
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="text-muted-foreground text-sm">
            Who you buy stock from.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New supplier</span>
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
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Purchases</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No suppliers yet.
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_person || "—"}</TableCell>
                <TableCell>{s.phone || "—"}</TableCell>
                <TableCell className="text-right">{s.purchase_count}</TableCell>
                <TableCell className="text-right">
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
                    description="Suppliers with purchase history can't be deleted."
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
        {!isLoading && suppliers.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No suppliers yet.
          </p>
        )}
        {suppliers.map((s) => (
          <div key={s.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{s.name}</div>
                {s.contact_person && (
                  <div className="text-xs text-muted-foreground truncate">
                    {s.contact_person}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
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
                  description="Suppliers with purchase history can't be deleted."
                  onConfirm={() => deleteMut.mutateAsync(s.id)}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmDialog>
              </div>
            </div>

            {(s.phone || s.email) && (
              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                {s.phone && <div>📞 {s.phone}</div>}
                {s.email && <div>✉️ {s.email}</div>}
              </div>
            )}

            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {s.purchase_count} purchase
              {s.purchase_count === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      <SupplierForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={async (payload) => {
          if (editing) await updateMut.mutateAsync({ id: editing.id, payload });
          else await createMut.mutateAsync(payload);
        }}
      />
    </div>
  );
}