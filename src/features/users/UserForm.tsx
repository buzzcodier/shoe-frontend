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
import type { Role } from "../../api/auth";
import type { UserRecord, UserPayload } from "../../api/users";

const ROLES: { value: Role; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "MANAGER", label: "Manager" },
  { value: "CASHIER", label: "Cashier" },
  { value: "STOCK_MANAGER", label: "Stock Manager" },
];

const baseSchema = z.object({
  username: z.string().min(3, "At least 3 characters").max(150),
  password: z.string().optional(),
  first_name: z.string().optional().or(z.literal("")),
  last_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["OWNER", "MANAGER", "CASHIER", "STOCK_MANAGER"]),
});

type FormValues = z.infer<typeof baseSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: UserRecord | null;
  onSubmit: (payload: UserPayload) => Promise<void>;
};

export default function UserForm({ open, onOpenChange, initial, onSubmit }: Props) {
  const isEdit = !!initial;

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "CASHIER",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: initial?.username ?? "",
        password: "",
        first_name: initial?.first_name ?? "",
        last_name: initial?.last_name ?? "",
        email: initial?.email ?? "",
        phone: initial?.phone ?? "",
        role: (initial?.role as Role) ?? "CASHIER",
      });
    }
  }, [open, initial, form]);

  const submit = form.handleSubmit(async (values) => {
    // Password required only when creating
    if (!isEdit && (!values.password || values.password.length < 6)) {
      form.setError("password", {
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const payload: UserPayload = {
      username: values.username,
      first_name: values.first_name ?? "",
      last_name: values.last_name ?? "",
      email: values.email ?? "",
      phone: values.phone ?? "",
      role: values.role,
    };

    if (values.password) payload.password = values.password;

    await onSubmit(payload);
    onOpenChange(false);
  });

  const currentRole = form.watch("role");
  const currentRoleLabel =
    ROLES.find((r) => r.value === currentRole)?.label ?? "Select role";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "New user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                disabled={isEdit}
                autoFocus={!isEdit}
              />
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEdit ? "New password (leave blank to keep)" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                autoComplete="new-password"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...form.register("first_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...form.register("last_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Role</Label>
              <Select
                value={currentRole}
                onValueChange={(v) => form.setValue("role", v as Role)}
              >
                <SelectTrigger>
                  <SelectValue>{currentRoleLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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