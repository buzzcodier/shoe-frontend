import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../lib/utils";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "negative";
};

const TONE_CLASSES: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-green-600",
  warning: "text-amber-600",
  negative: "text-red-600",
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={cn("text-2xl font-semibold", TONE_CLASSES[tone])}>
              {value}
            </div>
            {hint && (
              <div className="text-xs text-muted-foreground">{hint}</div>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}