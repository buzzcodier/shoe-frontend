import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { ShoeVariant } from "../../api/shoes";
import type { PackTemplate } from "../../api/purchases";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  notes: z.string().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        variant: z.number().int().positive("Pick a size"),
        quantity: z.number().int().positive("Qty must be > 0"),
      })
    )
    .min(1, "Add at least one size"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoeId: number;
  variants: ShoeVariant[];
  initial?: PackTemplate | null;
  onSubmit: (data: {
    shoe: number;
    name: string;
    notes: string;
    items: { variant: number; quantity: number }[];
  }) => Promise<void>;
};

export default function PackTemplateForm({
  open,
  onOpenChange,
  shoeId,
  variants,
  initial,
  onSubmit,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", notes: "", items: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? "",
        notes: initial?.notes ?? "",
        items:
          initial?.items?.map((it) => ({
            variant: it.variant,
            quantity: it.quantity,
          })) ?? [],
      });
    }
  }, [open, initial, form]);

  // Helper — find the real size label for a variant id
  const sizeLabelFor = (variantId: number): string => {
    const v = variants.find((x) => x.id === variantId);
    return v ? `Size ${v.size}` : `(unknown ${variantId})`;
  };

  const usedElsewhere = (idx: number): Set<number> => {
    const used = new Set<number>();
    (watchedItems ?? []).forEach((it, i) => {
      if (i !== idx) used.add(it.variant);
    });
    return used;
  };

  const addRow = () => {
    const used = new Set((watchedItems ?? []).map((it) => it.variant));
    const next = variants.find((v) => !used.has(v.id));
    if (!next) return;
    append({ variant: next.id, quantity: 1 });
  };

  const allSizesUsed =
    variants.length > 0 &&
    (watchedItems ?? []).every((it) =>
      variants.some((v) => v.id === it.variant)
    ) &&
    (watchedItems ?? []).length >= variants.length;

  const submit = form.handleSubmit(async (values) => {
    // Guard against duplicates before hitting the API
    const ids = values.items.map((it) => it.variant);
    if (new Set(ids).size !== ids.length) {
      form.setError("items", { message: "Each size can only appear once" });
      return;
    }
    await onSubmit({
      shoe: shoeId,
      name: values.name,
      notes: values.notes ?? "",
      items: values.items,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit pack template" : "New pack template"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Template name</Label>
            <Input
              {...form.register("name")}
              placeholder='e.g. "Pack of 5 sizes × 6 pairs"'
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input {...form.register("notes")} />
          </div>

          <div className="space-y-2">
            <Label>Sizes in one pack</Label>

            <div className="space-y-2">
              {fields.map((field, idx) => {
                const currentId = watchedItems?.[idx]?.variant;
                const disabledIds = usedElsewhere(idx);

                return (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={currentId ? String(currentId) : ""}
                        onValueChange={(v) =>
                          form.setValue(
                            `items.${idx}.variant`,
                            Number(v),
                            { shouldValidate: true }
                          )
                        }
                      >
                        <SelectTrigger>
                          {/* Explicitly show the size label — not the raw id */}
                          <SelectValue placeholder="Pick a size">
                            {currentId ? sizeLabelFor(currentId) : "Pick a size"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((v) => {
                            const isDisabled = disabledIds.has(v.id);
                            return (
                              <SelectItem
                                key={v.id}
                                value={String(v.id)}
                                disabled={isDisabled}
                              >
                                Size {v.size}
                                {isDisabled ? " (already added)" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      className="w-24"
                      {...form.register(`items.${idx}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={variants.length === 0 || allSizesUsed}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add size
            </Button>

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Click "Add size" to add a row. Each row is one size in the pack.
              </p>
            )}

            {form.formState.errors.items && (
              <p className="text-xs text-destructive">
                {form.formState.errors.items.message ??
                  form.formState.errors.items.root?.message ??
                  "Fix the size rows"}
              </p>
            )}
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