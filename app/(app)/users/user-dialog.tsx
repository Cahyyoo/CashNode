"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createUser, updateUser, type UserFormState } from "./actions";
import { ROLE_LABEL } from "@/components/role-badge";
import type { Role } from "@/lib/generated/prisma/client";

type Department = { id: string; name: string };

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
};

const initialState: UserFormState = { error: null };
const NO_DEPARTMENT = "__none__";

export function UserDialog({
  departments,
  user,
}: {
  departments: Department[];
  user?: UserRecord;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<UserFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!user;
  const action = isEdit ? updateUser.bind(null, user.id) : createUser;

  function formAction(formData: FormData) {
    const departmentId = formData.get("departmentId");
    if (departmentId === NO_DEPARTMENT) formData.set("departmentId", "");

    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success(isEdit ? "Pengguna diperbarui." : "Pengguna ditambahkan.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setState(initialState);
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit pengguna">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Tambah Pengguna
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
            <DialogDescription>
              Akun yang dibuat dapat langsung digunakan untuk masuk ke CashNode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" defaultValue={user?.name} required />
                {state.fieldErrors?.name && (
                  <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  required
                />
                {state.fieldErrors?.email && (
                  <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={user?.role ?? "PM"}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departemen</Label>
                <Select name="departmentId" defaultValue={user?.departmentId ?? NO_DEPARTMENT}>
                  <SelectTrigger id="departmentId" className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPARTMENT}>Tidak ada</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEdit ? "Password Baru (opsional)" : "Password"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={isEdit ? "Kosongkan jika tidak diubah" : undefined}
                required={!isEdit}
              />
              {state.fieldErrors?.password && (
                <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
