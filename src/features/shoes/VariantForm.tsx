import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import type { ShoeVariant, VariantPayload } from "../../api/shoes";

const schema = z.object({
  size: z.number().int().min(1, "Size must be positive").max(60),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  selling_price: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoeId: number;
  initial?: ShoeVariant | null;
  onSubmit: (payload: VariantPayload) => Promise<void>;
};

export default function VariantForm({
  open,
  onOpenChange,
  shoeId,
  initial,
  onSubmit,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { size: 0, quantity: 0, selling_price: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        size: initial?.size ?? 0,
        quantity: initial?.quantity ?? 0,
        selling_price: initial?.selling_price ?? "",
      });
    }
  }, [open, initial, form]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      shoe: shoeId,
      size: values.size,
      quantity: values.quantity,
      selling_price: values.selling_price ? values.selling_price : null,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? `Edit size ${initial.size}` : "Add size"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                type="number"
                {...form.register("size", { valueAsNumber: true })}
                autoFocus
                disabled={!!initial}
              />
              {form.formState.errors.size && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.size.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selling_price">
              Price override (optional)
            </Label>
            <Input
              id="selling_price"
              {...form.register("selling_price")}
              placeholder="Leave blank to use the shoe's default price"
            />
            <p className="text-xs text-muted-foreground">
              Useful when a size is priced differently (e.g. larger sizes).
            </p>
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