import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Tag,
  Building2,
  Footprints,
  Truck,
  PackagePlus,
  BarChart3,
  Users,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { useAuth } from "../../features/auth/AuthContext";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

type Role = "OWNER" | "MANAGER" | "CASHIER" | "STOCK_MANAGER";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  roles: Role[];
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ["OWNER", "MANAGER"] },
  { to: "/pos", label: "POS", icon: ShoppingCart, roles: ["OWNER", "MANAGER", "CASHIER"] },
  { to: "/sales", label: "Sales", icon: Receipt, roles: ["OWNER", "MANAGER", "CASHIER"] },
  { to: "/categories", label: "Categories", icon: Tag, roles: ["OWNER", "MANAGER"] },
  { to: "/companies", label: "Companies", icon: Building2, roles: ["OWNER", "MANAGER"] },
  { to: "/shoes", label: "Shoes", icon: Footprints, roles: ["OWNER", "MANAGER", "STOCK_MANAGER"] },
  { to: "/suppliers", label: "Suppliers", icon: Truck, roles: ["OWNER", "MANAGER", "STOCK_MANAGER"] },
  { to: "/purchases", label: "Purchases", icon: PackagePlus, roles: ["OWNER", "MANAGER", "STOCK_MANAGER"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["OWNER", "MANAGER"] },
  { to: "/users", label: "Users", icon: Users, roles: ["OWNER"] },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleNav = NAV.filter((item) =>
    user ? item.roles.includes(user.role as Role) : false
  );

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <div className="px-4 py-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Shop Manager</h1>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={closeMobile}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeMobile}
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
            <div className="font-medium truncate">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ""}`.trim()
                : user?.username}
            </div>
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
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r bg-card flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r z-50 flex flex-col md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-2 border-b bg-card px-4 py-3 sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold">Shop Manager</h1>
        </div>

        <main className="flex-1 bg-muted/20 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}