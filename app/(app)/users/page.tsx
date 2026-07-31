import { notFound } from "next/navigation";
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
import { RoleBadge } from "@/components/role-badge";
import { UserDialog } from "./user-dialog";
import { UserActiveSwitch, DeleteUserButton } from "./user-row-actions";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;
  if (currentUser.role !== Role.ADMIN) notFound();

  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun dan hak akses pengguna CashNode.
          </p>
        </div>
        <UserDialog departments={departments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>{users.length} pengguna terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada pengguna.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => {
                const isSelf = user.id === currentUser.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(Anda)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.department?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <UserActiveSwitch id={user.id} isActive={user.isActive} disabled={isSelf} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <UserDialog
                          departments={departments}
                          user={{
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            departmentId: user.departmentId,
                          }}
                        />
                        <DeleteUserButton id={user.id} disabled={isSelf} />
                      </div>
                    </TableCell>
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
