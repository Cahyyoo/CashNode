import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
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
import { ProjectDialog } from "./project-dialog";
import { DeleteProjectButton } from "./delete-project-button";
import { ProjectStatusBadge } from "./project-status-badge";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isScoped = user.role === Role.PM;

  const [projects, departments] = await Promise.all([
    prisma.project.findMany({
      where: isScoped ? { departmentId: user.departmentId ?? "__none__" } : undefined,
      orderBy: { createdAt: "desc" },
      include: { department: true, budgetRevisions: true, expenses: { select: { amount: true } } },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  const canManage = user.role === Role.ADMIN || user.role === Role.PM;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proyek</h1>
          <p className="text-muted-foreground">
            {isScoped
              ? "Proyek di departemen Anda."
              : "Seluruh proyek perusahaan."}
          </p>
        </div>
        {canManage && (
          <ProjectDialog
            departments={departments}
            lockDepartmentId={user.role === Role.PM ? user.departmentId ?? undefined : undefined}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Proyek</CardTitle>
          <CardDescription>{projects.length} proyek</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Proyek</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Total Anggaran</TableHead>
                <TableHead className="w-40">Penggunaan</TableHead>
                {canManage && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 8 : 7}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada proyek.
                  </TableCell>
                </TableRow>
              )}
              {projects.map((project) => {
                const totalBudget =
                  Number(project.initialBudget) +
                  project.budgetRevisions.reduce((sum, r) => sum + Number(r.amount), 0);
                const totalSpent = project.expenses.reduce(
                  (sum, e) => sum + Number(e.amount),
                  0
                );

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/projects/${project.id}`}
                        className="block hover:underline"
                      >
                        {project.code}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${project.id}`}
                        className="block hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {project.department.name}
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(project.startDate)} – {formatDate(project.endDate)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalBudget)}
                    </TableCell>
                    <TableCell>
                      <BudgetProgress spent={totalSpent} total={totalBudget} />
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                            lockDepartmentId={
                              user.role === Role.PM ? user.departmentId ?? undefined : undefined
                            }
                          />
                          {user.role === Role.ADMIN && <DeleteProjectButton id={project.id} />}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
