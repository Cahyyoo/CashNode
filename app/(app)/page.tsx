import { Wallet, Receipt, FolderKanban, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Role, ProjectStatus } from "@/lib/generated/prisma/client";
import { formatCurrency } from "@/lib/format";
import { StatTile } from "@/components/stat-tile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBudgetThreshold } from "@/components/budget-progress";
import { DashboardBudgetChart } from "./dashboard-budget-chart";
import { ThresholdAlerts } from "./threshold-alerts";
import { BurnRateForecast } from "./burn-rate-forecast";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isScoped = user.role === Role.PM;

  const projects = await prisma.project.findMany({
    where: isScoped ? { departmentId: user.departmentId ?? "__none__" } : undefined,
    include: {
      budgetRevisions: { select: { amount: true } },
      expenses: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withTotals = projects.map((p) => {
    const totalBudget =
      Number(p.initialBudget) + p.budgetRevisions.reduce((s, r) => s + Number(r.amount), 0);
    const totalSpent = p.expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { ...p, totalBudget, totalSpent };
  });

  const ONGOING_STATUSES: ProjectStatus[] = [
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.PLANNING,
  ];

  const activeProjects = withTotals.filter((p) => p.status === ProjectStatus.ACTIVE);
  const ongoingProjects = withTotals.filter((p) => ONGOING_STATUSES.includes(p.status));

  const totalActiveBudget = activeProjects.reduce((s, p) => s + p.totalBudget, 0);
  const totalSpentCompany = withTotals.reduce((s, p) => s + p.totalSpent, 0);
  const atRiskCount = ongoingProjects.filter(
    (p) => getBudgetThreshold(p.totalBudget > 0 ? (p.totalSpent / p.totalBudget) * 100 : 0) !== "healthy"
  ).length;

  const chartData = ongoingProjects
    .slice(0, 12)
    .map((p) => ({ code: p.code, name: p.name, budget: p.totalBudget, spent: p.totalSpent }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {isScoped
            ? "Ringkasan anggaran dan pengeluaran departemen Anda."
            : "Ringkasan anggaran dan pengeluaran perusahaan."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total Anggaran Aktif"
          value={formatCurrency(totalActiveBudget)}
          icon={Wallet}
          tone="primary"
          hint={`${activeProjects.length} proyek berjalan`}
        />
        <StatTile
          label="Total Pengeluaran"
          value={formatCurrency(totalSpentCompany)}
          icon={Receipt}
          tone="blue"
          hint="Akumulasi seluruh proyek"
        />
        <StatTile
          label="Proyek Berjalan"
          value={String(ongoingProjects.length)}
          icon={FolderKanban}
          tone="blue"
          hint={`dari ${withTotals.length} total proyek`}
        />
        <StatTile
          label="Proyek Berisiko"
          value={String(atRiskCount)}
          icon={AlertTriangle}
          tone={atRiskCount > 0 ? "red" : "primary"}
          hint="Pemakaian anggaran ≥ 60%"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anggaran vs Pengeluaran per Proyek</CardTitle>
          <CardDescription>Proyek dengan status berjalan, ditunda, atau perencanaan.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada proyek untuk ditampilkan.
            </p>
          ) : (
            <DashboardBudgetChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ThresholdAlerts
          projects={ongoingProjects.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            spent: p.totalSpent,
            budget: p.totalBudget,
          }))}
        />
        <BurnRateForecast
          projects={activeProjects.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            startDate: p.startDate,
            endDate: p.endDate,
            spent: p.totalSpent,
            budget: p.totalBudget,
          }))}
        />
      </div>
    </div>
  );
}
