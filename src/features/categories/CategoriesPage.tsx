import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryPayload,
} from "../../api/categories";
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
import CategoryForm from "./CategoryForm";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["categories"] });

  const createMut = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Category created");
      invalidate();
    },
    onError: () => toast.error("Could not create category"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
    },
    onError: () => toast.error("Could not update category"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Could not delete category");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Group shoes by type (Men, Women, Sports, …)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New category</span>
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
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right">Shoes</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No categories yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-muted-foreground">{c.id}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.description || "—"}
                </TableCell>
                <TableCell className="text-right">{c.shoe_count}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title={`Delete "${c.name}"?`}
                    description="This cannot be undone. Categories in use by shoes can't be deleted."
                    onConfirm={() => deleteMut.mutateAsync(c.id)}
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
        {!isLoading && categories.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No categories yet. Create one to get started.
          </p>
        )}
        {categories.map((c) => (
          <div key={c.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{c.name}</div>
                {c.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {c.description}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDialog
                  title={`Delete "${c.name}"?`}
                  description="This cannot be undone. Categories in use by shoes can't be deleted."
                  onConfirm={() => deleteMut.mutateAsync(c.id)}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmDialog>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {c.shoe_count} shoe{c.shoe_count === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
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