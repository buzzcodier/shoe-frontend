import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Tag,
  Building2,
  Footprints,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { useAuth } from "../../features/auth/AuthContext";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/shoes", label: "Shoes", icon: Footprints },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r bg-card flex flex-col">
        <div className="px-4 py-5">
          <h1 className="text-lg font-semibold">Shop Manager</h1>
        </div>
        <Separator />
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="p-3">
          <div className="flex items-center gap-2 px-2 py-2 text-sm">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 truncate">
              <div className="font-medium truncate">{user?.username}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-muted/20">
        <Outlet />
      </main>
    </div>
  );
}