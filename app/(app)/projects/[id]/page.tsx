import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessDepartment } from "@/lib/rbac";
import { Role } from "@/lib/generated/prisma/client";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BudgetProgress } from "@/components/budget-progress";
import { ProjectStatusBadge } from "../project-status-badge";
import { ProjectDialog } from "../project-dialog";
import { DeleteProjectButton } from "../delete-project-button";
import { BudgetRevisionDialog } from "./budget-revision-dialog";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseButton } from "./delete-expense-button";
import { ProjectExportButtons } from "./project-export-buttons";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const [project, departments, vendors] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        department: true,
        budgetRevisions: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true } } },
        },
        expenses: {
          orderBy: { expenseDate: "desc" },
          include: { vendor: { select: { name: true } }, user: { select: { name: true } } },
        },
      },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!project || !canAccessDepartment(user, project.departmentId)) {
    notFound();
  }

  const totalRevisions = project.budgetRevisions.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );
  const totalBudget = Number(project.initialBudget) + totalRevisions;
  const totalSpent = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = totalBudget - totalSpent;

  const canManage =
    user.role === Role.ADMIN ||
    (user.role === Role.PM && user.departmentId === project.departmentId);
  const canRevise = canManage || user.role === Role.FINANCE;
  const canInputExpense = canManage;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Proyek
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-muted-foreground">
            {project.code} &middot; {project.department.name} &middot;{" "}
            {formatDate(project.startDate)} – {formatDate(project.endDate)}
          </p>
          {project.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          )}
        </div>
        {canManage && (
          <div className="flex gap-1">
            <ProjectDialog
              departments={departments}
              project={{
                id: project.id,
                name: project.name,
                code: project.code,
                description: project.description,
                status: project.status,
                departmentId: project.departmentId,
                startDate: project.startDate,
                endDate: project.endDate,
                initialBudget: project.initialBudget.toString(),
              }}
              lockDepartmentId={user.role === Role.PM ? user.departmentId ?? undefined : undefined}
            />
            {user.role === Role.ADMIN && (
              <DeleteProjectButton id={project.id} redirectTo="/projects" />
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Anggaran Awal</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(project.initialBudget.toString())}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revisi</CardDescription>
            <CardTitle
              className={totalRevisions >= 0 ? "text-xl text-primary" : "text-xl text-destructive"}
            >
              {totalRevisions >= 0 ? "+" : ""}
              {formatCurrency(totalRevisions)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Anggaran</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(totalBudget)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sisa Anggaran</CardDescription>
            <CardTitle className={remaining < 0 ? "text-xl text-destructive" : "text-xl"}>
              {formatCurrency(remaining)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Penggunaan Anggaran</CardTitle>
          <CardDescription>
            Total Pengeluaran {formatCurrency(totalSpent)} dari {formatCurrency(totalBudget)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetProgress spent={totalSpent} total={totalBudget} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Riwayat Revisi Anggaran</CardTitle>
            <CardDescription>
              Anggaran Awal + Total Revisi = Total Anggaran
            </CardDescription>
          </div>
          {canRevise && <BudgetRevisionDialog projectId={project.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Diinput oleh</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.budgetRevisions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Belum ada revisi anggaran.
                  </TableCell>
                </TableRow>
              )}
              {project.budgetRevisions.map((revision) => (
                <TableRow key={revision.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(revision.createdAt)}
                  </TableCell>
                  <TableCell>{revision.reason}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {revision.createdBy?.name ?? "-"}
                  </TableCell>
                  <TableCell
                    className={
                      Number(revision.amount) >= 0
                        ? "text-right font-medium text-primary"
                        : "text-right font-medium text-destructive"
                    }
                  >
                    {Number(revision.amount) >= 0 ? "+" : ""}
                    {formatCurrency(revision.amount.toString())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Pengeluaran</CardTitle>
            <CardDescription>{project.expenses.length} transaksi tercatat</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectExportButtons
              projectName={project.name}
              projectCode={project.code}
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              expenses={project.expenses.map((e) => ({
                expenseDate: e.expenseDate,
                vendorName: e.vendor.name,
                description: e.description,
                amount: e.amount.toString(),
              }))}
            />
            {canInputExpense && <ExpenseDialog projectId={project.id} vendors={vendors} />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Diinput oleh</TableHead>
                <TableHead>Struk</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                {canInputExpense && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.expenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canInputExpense ? 7 : 6}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada pengeluaran.
                  </TableCell>
                </TableRow>
              )}
              {project.expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.expenseDate)}
                  </TableCell>
                  <TableCell>{expense.vendor.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.user?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Lihat
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount.toString())}
                  </TableCell>
                  {canInputExpense && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ExpenseDialog
                          projectId={project.id}
                          vendors={vendors}
                          expense={{
                            id: expense.id,
                            vendorId: expense.vendorId,
                            amount: expense.amount.toString(),
                            description: expense.description,
                            expenseDate: expense.expenseDate,
                            receiptUrl: expense.receiptUrl,
                          }}
                        />
                        <DeleteExpenseButton projectId={project.id} expenseId={expense.id} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
