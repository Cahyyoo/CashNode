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
import { createProject, updateProject, type ProjectFormState } from "./actions";
import { formatDateInput } from "@/lib/format";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Perencanaan",
  ACTIVE: "Berjalan",
  ON_HOLD: "Ditunda",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

type Department = { id: string; name: string };

type Project = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ProjectStatus;
  departmentId: string;
  startDate: Date;
  endDate: Date;
  initialBudget: { toString(): string };
};

const initialState: ProjectFormState = { error: null };

export function ProjectDialog({
  departments,
  project,
  lockDepartmentId,
}: {
  departments: Department[];
  project?: Project;
  /** For PMs: force the department field to their own department. */
  lockDepartmentId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ProjectFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!project;
  const action = isEdit ? updateProject.bind(null, project.id) : createProject;

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success(isEdit ? "Proyek diperbarui." : "Proyek dibuat.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit proyek">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Tambah Proyek
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Proyek" : "Tambah Proyek"}</DialogTitle>
            <DialogDescription>
              Proyek ditautkan ke departemen dan memiliki batas waktu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Proyek</Label>
                <Input id="name" name="name" defaultValue={project?.name} required />
                {state.fieldErrors?.name && (
                  <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Kode Proyek</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={project?.code}
                  required
                  className="uppercase"
                />
                {state.fieldErrors?.code && (
                  <p className="text-sm text-destructive">{state.fieldErrors.code[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input id="description" name="description" defaultValue={project?.description ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departemen</Label>
                <Select
                  name={lockDepartmentId ? undefined : "departmentId"}
                  defaultValue={lockDepartmentId ?? project?.departmentId}
                  disabled={!!lockDepartmentId}
                >
                  <SelectTrigger id="departmentId" className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lockDepartmentId && (
                  <input type="hidden" name="departmentId" value={lockDepartmentId} />
                )}
                {state.fieldErrors?.departmentId && (
                  <p className="text-sm text-destructive">{state.fieldErrors.departmentId[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={project?.status ?? "PLANNING"}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={project ? formatDateInput(project.startDate) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={project ? formatDateInput(project.endDate) : ""}
                  required
                />
                {state.fieldErrors?.endDate && (
                  <p className="text-sm text-destructive">{state.fieldErrors.endDate[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialBudget">Anggaran Awal (Rp)</Label>
              <Input
                id="initialBudget"
                name="initialBudget"
                type="number"
                min="0"
                step="1"
                defaultValue={project?.initialBudget?.toString()}
                required
              />
              {state.fieldErrors?.initialBudget && (
                <p className="text-sm text-destructive">{state.fieldErrors.initialBudget[0]}</p>
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
