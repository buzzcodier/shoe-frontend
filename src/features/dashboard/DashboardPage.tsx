import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../features/auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground">
          Phase 1 — catalog management. Sales & reports coming soon.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["Categories", "Companies", "Shoes"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming next.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}