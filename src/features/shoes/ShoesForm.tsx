import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import type { Shoe, ShoePayload } from "../../api/shoes";
import type { Category } from "../../api/categories";
import type { Company } from "../../api/companies";

const GENDERS = ["MALE", "FEMALE", "UNISEX", "CHILDREN"] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  model_number: z.string().optional().or(z.literal("")),
  category: z.number().int().positive("Category is required"),
  company: z.number().int().positive("Company is required"),
  material: z.string().optional().or(z.literal("")),
  gender: z.enum(GENDERS),
  description: z.string().optional().or(z.literal("")),
  buying_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  selling_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Shoe | null;
  categories: Category[];
  companies: Company[];
  onSubmit: (payload: ShoePayload) => Promise<void>;
};

export default function ShoeForm({
  open,
  onOpenChange,
  initial,
  categories,
  companies,
  onSubmit,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      model_number: "",
      category: 0,
      company: 0,
      material: "",
      gender: "UNISEX",
      description: "",
      buying_price: "",
      selling_price: "",
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? "",
        model_number: initial?.model_number ?? "",
        category: initial?.category ?? 0,
        company: initial?.company ?? 0,
        material: initial?.material ?? "",
        gender: initial?.gender ?? "UNISEX",
        description: initial?.description ?? "",
        buying_price: initial?.buying_price ?? "",
        selling_price: initial?.selling_price ?? "",
        active: initial?.active ?? true,
      });
    }
  }, [open, initial, form]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      model_number: values.model_number ?? "",
      category: values.category,
      company: values.company,
      material: values.material ?? "",
      gender: values.gender,
      description: values.description ?? "",
      buying_price: values.buying_price,
      selling_price: values.selling_price,
      active: values.active,
    });
    onOpenChange(false);
  });

  const currentCategoryId = form.watch("category");
  const currentCompanyId = form.watch("company");

  const currentCategoryName =
    categories.find((c) => c.id === currentCategoryId)?.name ?? "";

  const currentCompanyName =
    companies.find((c) => c.id === currentCompanyId)?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit shoe" : "New shoe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} autoFocus />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_number">Model number</Label>
              <Input id="model_number" {...form.register("model_number")} />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(v) =>
                  form.setValue("gender", v as FormValues["gender"])
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {form.watch("gender")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={
                  currentCategoryId && currentCategoryId > 0
                    ? String(currentCategoryId)
                    : ""
                }
                onValueChange={(v) =>
                  form.setValue("category", Number(v), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category">
                    {currentCategoryName || "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={
                  currentCompanyId && currentCompanyId > 0
                    ? String(currentCompanyId)
                    : ""
                }
                onValueChange={(v) =>
                  form.setValue("company", Number(v), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company">
                    {currentCompanyName || "Select company"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.company && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.company.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input id="material" {...form.register("material")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buying_price">Buying price</Label>
              <Input
                id="buying_price"
                {...form.register("buying_price")}
                placeholder="2500.00"
              />
              {form.formState.errors.buying_price && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.buying_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling price</Label>
              <Input
                id="selling_price"
                {...form.register("selling_price")}
                placeholder="3500.00"
              />
              {form.formState.errors.selling_price && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.selling_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...form.register("description")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}