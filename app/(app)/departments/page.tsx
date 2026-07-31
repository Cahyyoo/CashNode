import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Role } from "@/lib/generated/prisma/client";
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
import { DepartmentDialog } from "./department-dialog";
import { DeleteDepartmentButton } from "./delete-department-button";

export default async function DepartmentsPage() {
  const [user, departments] = await Promise.all([
    getCurrentUser(),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true } } },
    }),
  ]);

  const canManage = user?.role === Role.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Departemen</h1>
          <p className="text-muted-foreground">
            Master data divisi perusahaan.
          </p>
        </div>
        {canManage && <DepartmentDialog />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Departemen</CardTitle>
          <CardDescription>{departments.length} departemen terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah User</TableHead>
                {canManage && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 5 : 4}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada departemen.
                  </TableCell>
                </TableRow>
              )}
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-mono">{department.code}</TableCell>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {department.description || "-"}
                  </TableCell>
                  <TableCell>{department._count.users}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <DepartmentDialog department={department} />
                        <DeleteDepartmentButton id={department.id} />
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
