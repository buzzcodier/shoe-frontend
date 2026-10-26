import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

import {
  getShoe,
  createVariant,
  updateVariant,
  deleteVariant,
  type ShoeVariant,
  type VariantPayload,
} from "../../api/shoes";
import {
  listPackTemplates,
  createPackTemplate,
  updatePackTemplate,
  deletePackTemplate,
  type PackTemplate,
} from "../../api/purchases";
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
import { Separator } from "../../components/ui/separator";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatKsh } from "../../lib/format";
import VariantForm from "./VariantForm";
import PackTemplateForm from "./PackTemplateForm";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function ShoeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const shoeId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const online = useOnlineStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShoeVariant | null>(null);

  const [packFormOpen, setPackFormOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<PackTemplate | null>(null);

  const { data: shoe, isLoading, isError } = useQuery({
    queryKey: ["shoe", shoeId],
    queryFn: () => getShoe(shoeId),
    enabled: Number.isFinite(shoeId),
  });

  const { data: packTemplates = [] } = useQuery({
    queryKey: ["pack-templates", shoeId],
    queryFn: () => listPackTemplates(shoeId),
    enabled: Number.isFinite(shoeId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["shoe", shoeId] });
    qc.invalidateQueries({ queryKey: ["shoes"] });
  };

  const invalidatePacks = () => {
    qc.invalidateQueries({ queryKey: ["pack-templates", shoeId] });
  };

  const createMut = useMutation({
    mutationFn: (payload: VariantPayload) => createVariant(payload),
    onSuccess: () => {
      toast.success("Variant added");
      invalidate();
    },
    onError: (err: any) => {
      const detail = err?.response?.data;
      toast.error(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Could not add variant"
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VariantPayload }) =>
      updateVariant(id, payload),
    onSuccess: () => {
      toast.success("Variant updated");
      invalidate();
    },
    onError: () => toast.error("Could not update variant"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteVariant(id),
    onSuccess: () => {
      toast.success("Variant deleted");
      invalidate();
    },
    onError: () => toast.error("Could not delete variant"),
  });

  const createPackMut = useMutation({
    mutationFn: createPackTemplate,
    onSuccess: () => {
      toast.success("Pack template created");
      invalidatePacks();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not create template");
    },
  });

  const updatePackMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updatePackTemplate(id, payload),
    onSuccess: () => {
      toast.success("Pack template updated");
      invalidatePacks();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not update template");
    },
  });

  const deletePackMut = useMutation({
    mutationFn: deletePackTemplate,
    onSuccess: () => {
      toast.success("Pack template deleted");
      invalidatePacks();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not delete template");
    },
  });

  if (isLoading) {
    return <div className="p-4 md:p-8 text-muted-foreground">Loading…</div>;
  }

  if (isError || !shoe) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <p className="text-destructive">Could not load shoe.</p>
        <Button variant="outline" onClick={() => navigate("/shoes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to shoes
        </Button>
      </div>
    );
  }

  const variants = shoe.variants ?? [];
  const totalStock = shoe.total_stock ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Link
        to="/shoes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to shoes
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 flex-wrap">
            {shoe.name}
            {!online && (
              <span className="text-xs font-normal text-amber-700 bg-amber-100 border border-amber-200 rounded px-2 py-0.5">
                Read-only
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            {shoe.company_name} · {shoe.category_name}
            {shoe.model_number ? ` · ${shoe.model_number}` : ""}
          </p>
        </div>
        <Badge variant={shoe.active ? "default" : "secondary"}>
          {shoe.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Buying price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatKsh(shoe.buying_price)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Selling price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatKsh(shoe.selling_price)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Total stock
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div className="text-xl font-semibold">{totalStock}</div>
          </CardContent>
        </Card>
      </div>

      {shoe.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{shoe.description}</CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sizes & stock</h2>
          <p className="text-muted-foreground text-sm">
            Each size has its own quantity. Selling a pair reduces this count.
          </p>
        </div>
        {online && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add size
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Size</TableHead>
              <TableHead className="w-32 text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Override?</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No sizes yet. Add one to start tracking stock.
                </TableCell>
              </TableRow>
            )}
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.size}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={v.quantity > 0 ? "secondary" : "destructive"}>
                    {v.quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatKsh(v.effective_price)}
                </TableCell>
                <TableCell className="text-right">
                  {v.selling_price ? (
                    <Badge variant="outline">Custom</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Default</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {online ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(v);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete size ${v.size}?`}
                        description="This removes the size and its stock count."
                        onConfirm={() => deleteMut.mutateAsync(v.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </ConfirmDialog>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VariantForm
        open={formOpen}
        onOpenChange={setFormOpen}
        shoeId={shoeId}
        initial={editing}
        onSubmit={async (payload) => {
          if (editing) {
            await updateMut.mutateAsync({ id: editing.id, payload });
          } else {
            await createMut.mutateAsync(payload);
          }
        }}
      />

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pack templates</h2>
          <p className="text-muted-foreground text-sm">
            Define how this shoe arrives in bulk (cartons, sacks, bags).
          </p>
        </div>
        {online && (
          <Button
            onClick={() => {
              setEditingPack(null);
              setPackFormOpen(true);
            }}
            disabled={variants.length === 0}
            title={
              variants.length === 0
                ? "Add at least one size before creating a pack template"
                : undefined
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            New template
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Total pairs</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packTemplates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No pack templates yet.
                </TableCell>
              </TableRow>
            )}
            {packTemplates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.items.map((it) => `Sz ${it.size}×${it.quantity}`).join(", ")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.notes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{t.total_pairs}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {online ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPack(t);
                          setPackFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete "${t.name}"?`}
                        description="This template can no longer be used for stock receiving."
                        onConfirm={() => deletePackMut.mutateAsync(t.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </ConfirmDialog>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PackTemplateForm
        open={packFormOpen}
        onOpenChange={setPackFormOpen}
        shoeId={shoeId}
        variants={variants}
        initial={editingPack}
        onSubmit={async (payload) => {
          if (editingPack) {
            await updatePackMut.mutateAsync({ id: editingPack.id, payload });
          } else {
            await createPackMut.mutateAsync(payload);
          }
        }}
      />
    </div>
  );
}