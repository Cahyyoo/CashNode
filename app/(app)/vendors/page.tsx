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
import { VendorDialog } from "./vendor-dialog";
import { VendorActiveSwitch, DeleteVendorButton } from "./vendor-row-actions";

export default async function VendorsPage() {
  const [user, vendors] = await Promise.all([
    getCurrentUser(),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.FINANCE;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendor</h1>
          <p className="text-muted-foreground">
            Master data pihak ketiga / rekanan.
          </p>
        </div>
        {canManage && <VendorDialog />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Vendor</CardTitle>
          <CardDescription>{vendors.length} vendor terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Aktif</TableHead>
                {canManage && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 6 : 5}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada vendor.
                  </TableCell>
                </TableRow>
              )}
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {vendor.contactName || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vendor.email || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vendor.phone || "-"}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <VendorActiveSwitch id={vendor.id} isActive={vendor.isActive} />
                    ) : vendor.isActive ? (
                      "Ya"
                    ) : (
                      "Tidak"
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <VendorDialog vendor={vendor} />
                        <DeleteVendorButton id={vendor.id} />
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
