"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addBudgetRevision, type RevisionFormState } from "../actions";

const initialState: RevisionFormState = { error: null };

export function BudgetRevisionDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<RevisionFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const action = addBudgetRevision.bind(null, projectId);

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success("Revisi anggaran ditambahkan.");
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
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          Revisi Anggaran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Tambah Revisi Anggaran</DialogTitle>
            <DialogDescription>
              Gunakan angka positif untuk penambahan, negatif untuk pengurangan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Nilai Revisi (Rp)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1"
                placeholder="mis. 20000000 atau -5000000"
                required
              />
              {state.fieldErrors?.amount && (
                <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan / Keterangan</Label>
              <Textarea id="reason" name="reason" required />
              {state.fieldErrors?.reason && (
                <p className="text-sm text-destructive">{state.fieldErrors.reason[0]}</p>
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
