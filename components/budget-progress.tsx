import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function getBudgetThreshold(percentage: number) {
  if (percentage >= 100) return "over" as const;
  if (percentage >= 85) return "critical" as const;
  if (percentage >= 60) return "warning" as const;
  return "healthy" as const;
}

export type BudgetThreshold = ReturnType<typeof getBudgetThreshold>;

/** Fixed status roles — mirrors the validated dataviz status palette (never themed). */
export const THRESHOLD_COLOR: Record<BudgetThreshold, string> = {
  healthy: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-serious)",
  over: "var(--status-critical)",
};

const THRESHOLD_LABEL: Record<BudgetThreshold, string> = {
  healthy: "Aman",
  warning: "Perhatian",
  critical: "Mendekati batas",
  over: "Melebihi anggaran",
};

const THRESHOLD_ICON: Record<BudgetThreshold, typeof CheckCircle2> = {
  healthy: CheckCircle2,
  warning: TrendingUp,
  critical: AlertTriangle,
  over: AlertTriangle,
};

export function BudgetProgress({
  spent,
  total,
  className,
  showLabel = true,
}: {
  spent: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}) {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const threshold = getBudgetThreshold(percentage);
  const Icon = THRESHOLD_ICON[threshold];

  return (
    <div className={cn("space-y-1.5", className)}>
      <Progress
        value={Math.min(percentage, 100)}
        className="h-2 bg-muted"
        indicatorStyle={{ backgroundColor: THRESHOLD_COLOR[threshold] }}
      />
      {showLabel && (
        <p
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: THRESHOLD_COLOR[threshold] }}
        >
          <Icon className="size-3.5" />
          {percentage.toFixed(1)}% terpakai
          {threshold !== "healthy" && ` · ${THRESHOLD_LABEL[threshold]}`}
        </p>
      )}
    </div>
  );
}
