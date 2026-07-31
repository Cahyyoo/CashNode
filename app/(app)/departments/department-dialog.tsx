"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createDepartment,
  updateDepartment,
  type DepartmentFormState,
} from "./actions";

type Department = {
  id: string;
  name: string;
  code: string;
  description: string | null;
};

const initialState: DepartmentFormState = { error: null };

export function DepartmentDialog({ department }: { department?: Department }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DepartmentFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!department;
  const action = isEdit
    ? updateDepartment.bind(null, department.id)
    : createDepartment;

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success(isEdit ? "Departemen diperbarui." : "Departemen ditambahkan.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit departemen">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Tambah Departemen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Departemen" : "Tambah Departemen"}
            </DialogTitle>
            <DialogDescription>
              Master data divisi perusahaan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Departemen</Label>
              <Input
                id="name"
                name="name"
                defaultValue={department?.name}
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                name="code"
                defaultValue={department?.code}
                required
                className="uppercase"
              />
              {state.fieldErrors?.code && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.code[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input
                id="description"
                name="description"
                defaultValue={department?.description ?? ""}
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
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
