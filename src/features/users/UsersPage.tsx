import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, KeyRound, Power } from "lucide-react";
import { toast } from "sonner";

import {
  listUsers,
  createUser,
  updateUser,
  resetPassword,
  toggleActive,
  type UserRecord,
  type UserPayload,
} from "../../api/users";
import { useAuth } from "../../features/auth/AuthContext";
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
import UserForm from "./UserForm";
import ResetPasswordDialog from "./ResetPasswordDialog";

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRecord | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });

  const createMut = useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User created");
      invalidate();
    },
    onError: (err: any) => {
      const detail = err?.response?.data;
      const msg =
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Could not create user";
      toast.error(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) =>
      updateUser(id, payload),
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
    },
    onError: () => toast.error("Could not update user"),
  });

  const resetMut = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      resetPassword(id, password),
    onSuccess: () => toast.success("Password reset"),
    onError: () => toast.error("Could not reset password"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: number) => toggleActive(id),
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not update user");
    },
  });

  const displayName = (u: UserRecord) => {
    const full = `${u.first_name} ${u.last_name}`.trim();
    return full || u.username;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            Staff accounts and access levels.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New user</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
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
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {displayName(u)}
                    {isSelf && (
                      <Badge variant="outline" className="ml-2">
                        you
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? "default" : "destructive"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(u);
                        setFormOpen(true);
                      }}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setResetTarget(u);
                        setResetOpen(true);
                      }}
                      title="Reset password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMut.mutate(u.id)}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "You cannot deactivate yourself"
                          : u.is_active
                          ? "Deactivate"
                          : "Activate"
                      }
                    >
                      <Power
                        className={`h-4 w-4 ${
                          u.is_active ? "text-destructive" : "text-green-600"
                        }`}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
        {!isLoading && users.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No users yet.
          </p>
        )}
        {users.map((u) => {
          const isSelf = u.id === currentUser?.id;
          return (
            <div key={u.id} className="border rounded-lg p-3 bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate flex items-center gap-1">
                    <span className="truncate">{displayName(u)}</span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        you
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{u.username}
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing(u);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setResetTarget(u);
                      setResetOpen(true);
                    }}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleMut.mutate(u.id)}
                    disabled={isSelf}
                  >
                    <Power
                      className={`h-4 w-4 ${
                        u.is_active ? "text-destructive" : "text-green-600"
                      }`}
                    />
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  {u.role}
                </Badge>
                <Badge
                  variant={u.is_active ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {u.is_active ? "Active" : "Inactive"}
                </Badge>
                {u.phone && (
                  <span className="text-xs text-muted-foreground">
                    📞 {u.phone}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <UserForm
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

      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={resetTarget}
        onSubmit={async (password) => {
          if (resetTarget) {
            await resetMut.mutateAsync({ id: resetTarget.id, password });
          }
        }}
      />
    </div>
  );
}