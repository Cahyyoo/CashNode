import Link from "next/link";
import { Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { calculateBurnRate } from "@/lib/forecast";

type ActiveProject = {
  id: string;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  spent: number;
  budget: number;
};

export function BurnRateForecast({ projects }: { projects: ActiveProject[] }) {
  const today = new Date();

  const forecasts = projects.map((p) => ({
    project: p,
    forecast: calculateBurnRate({
      startDate: p.startDate,
      endDate: p.endDate,
      totalSpent: p.spent,
      totalBudget: p.budget,
      today,
    }),
  }));

  forecasts.sort((a, b) => Number(b.forecast.willExceedBudget) - Number(a.forecast.willExceedBudget));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecasting Burn-Rate</CardTitle>
        <CardDescription>
          Proyeksi linear berdasarkan laju pengeluaran harian proyek yang sedang berjalan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {forecasts.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Tidak ada proyek berstatus berjalan.
          </p>
        )}
        {forecasts.map(({ project, forecast }) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block rounded-md border px-3 py-3 text-sm transition-colors hover:bg-muted/60"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {project.name} <span className="text-muted-foreground">({project.code})</span>
              </p>
              <Gauge
                className={
                  forecast.willExceedBudget
                    ? "size-4 text-destructive"
                    : "size-4 text-primary"
                }
              />
            </div>
            <p className="mt-1 text-muted-foreground">
              Laju pengeluaran{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(forecast.dailyBurnRate)}
              </span>
              /hari &middot; proyeksi total{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(forecast.projectedTotalSpend)}
              </span>{" "}
              dari anggaran {formatCurrency(project.budget)}
            </p>
            {forecast.willExceedBudget ? (
              <p className="mt-1 font-medium text-destructive">
                ⚠ Diprediksi melebihi anggaran
                {forecast.daysUntilOverBudget !== null &&
                  forecast.daysUntilOverBudget > 0 &&
                  ` dalam ±${forecast.daysUntilOverBudget} hari (sekitar ${formatDate(
                    new Date(today.getTime() + forecast.daysUntilOverBudget * 86400000)
                  )})`}
                {forecast.daysUntilOverBudget === 0 && " — sudah melebihi anggaran saat ini"}
                {" "}sebelum proyek berakhir pada {formatDate(project.endDate)}.
              </p>
            ) : (
              <p className="mt-1 font-medium text-primary">
                ✓ Sesuai jalur, diproyeksikan tidak melebihi anggaran hingga{" "}
                {formatDate(project.endDate)}.
              </p>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
