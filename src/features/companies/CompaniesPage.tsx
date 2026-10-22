import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  type Company,
  type CompanyPayload,
} from "../../api/companies";
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
import CompanyForm from "./CompanyForm";

export default function CompaniesPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["companies"] });

  const createMut = useMutation({
    mutationFn: (payload: CompanyPayload) => createCompany(payload),
    onSuccess: () => {
      toast.success("Company created");
      invalidate();
    },
    onError: () => toast.error("Could not create company"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CompanyPayload }) =>
      updateCompany(id, payload),
    onSuccess: () => {
      toast.success("Company updated");
      invalidate();
    },
    onError: () => toast.error("Could not update company"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteCompany(id),
    onSuccess: () => {
      toast.success("Company deleted");
      invalidate();
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Could not delete company");
    },
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground text-sm">
            Brands and manufacturers you stock.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New company</span>
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
              <TableHead>Email</TableHead>
              <TableHead className="w-24 text-right">Shoes</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
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
            {!isLoading && companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No companies yet.
                </TableCell>
              </TableRow>
            )}
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-muted-foreground">{c.id}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.contact_person || "—"}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell>{c.email || "—"}</TableCell>
                <TableCell className="text-right">{c.shoe_count}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title={`Delete "${c.name}"?`}
                    description="This cannot be undone. Companies in use by shoes can't be deleted."
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
        {!isLoading && companies.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No companies yet.
          </p>
        )}
        {companies.map((c) => (
          <div key={c.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{c.name}</div>
                {c.contact_person && (
                  <div className="text-xs text-muted-foreground truncate">
                    {c.contact_person}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditing(c);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDialog
                  title={`Delete "${c.name}"?`}
                  description="This cannot be undone. Companies in use by shoes can't be deleted."
                  onConfirm={() => deleteMut.mutateAsync(c.id)}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmDialog>
              </div>
            </div>
            {(c.phone || c.email) && (
              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                {c.phone && <div>📞 {c.phone}</div>}
                {c.email && <div>✉️ {c.email}</div>}
              </div>
            )}
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {c.shoe_count} shoe{c.shoe_count === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      <CompanyForm
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