import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "blue" | "amber" | "red";
  hint?: string;
}) {
  const toneClass = {
    primary: "bg-primary/15 text-primary",
    blue: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/15 text-red-600 dark:text-red-400",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
