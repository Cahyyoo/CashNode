import Link from "next/link";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getBudgetThreshold, THRESHOLD_COLOR, type BudgetThreshold } from "@/components/budget-progress";

type ProjectAlert = {
  id: string;
  code: string;
  name: string;
  spent: number;
  budget: number;
};

const THRESHOLD_LABEL: Record<BudgetThreshold, string> = {
  healthy: "Aman",
  warning: "Perhatian",
  critical: "Mendekati Batas",
  over: "Melebihi Anggaran",
};

const THRESHOLD_ICON = {
  healthy: CheckCircle2,
  warning: TrendingUp,
  critical: AlertTriangle,
  over: AlertTriangle,
};

export function ThresholdAlerts({ projects }: { projects: ProjectAlert[] }) {
  const alerts = projects
    .map((p) => ({
      ...p,
      percentage: p.budget > 0 ? (p.spent / p.budget) * 100 : 0,
    }))
    .filter((p) => getBudgetThreshold(p.percentage) !== "healthy")
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peringatan Ambang Batas</CardTitle>
        <CardDescription>
          Proyek dengan pemakaian anggaran ≥ 60% dari total anggaran.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {alerts.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Semua proyek dalam kondisi aman.
          </p>
        )}
        {alerts.map((p) => {
          const threshold = getBudgetThreshold(p.percentage);
          const Icon = THRESHOLD_ICON[threshold];
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${THRESHOLD_COLOR[threshold]} 15%, transparent)`,
                    color: THRESHOLD_COLOR[threshold],
                  }}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.code} &middot; {formatCurrency(p.spent)} / {formatCurrency(p.budget)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold tabular-nums" style={{ color: THRESHOLD_COLOR[threshold] }}>
                  {p.percentage.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">{THRESHOLD_LABEL[threshold]}</p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
