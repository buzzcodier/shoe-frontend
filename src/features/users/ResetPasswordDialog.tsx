import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { UserRecord } from "../../api/users";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRecord | null;
  onSubmit: (newPassword: string) => Promise<void>;
};

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: Props) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;
    setBusy(true);
    try {
      await onSubmit(password);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password for {user?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newpass">New password</Label>
            <Input
              id="newpass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              At least 6 characters. Share it with the user privately.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || password.length < 6}>
              {busy ? "Saving…" : "Reset password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}