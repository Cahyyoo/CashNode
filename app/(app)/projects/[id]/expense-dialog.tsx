"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Paperclip, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createExpense, updateExpense, type ExpenseFormState } from "./expense-actions";
import { formatDateInput } from "@/lib/format";

type Vendor = { id: string; name: string };

type Expense = {
  id: string;
  vendorId: string;
  amount: string | number;
  description: string;
  expenseDate: Date;
  receiptUrl: string;
};

const initialState: ExpenseFormState = { error: null };

export function ExpenseDialog({
  projectId,
  vendors,
  expense,
}: {
  projectId: string;
  vendors: Vendor[];
  expense?: Expense;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ExpenseFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(expense?.receiptUrl ?? "");
  const isEdit = !!expense;

  const action = isEdit
    ? updateExpense.bind(null, projectId, expense.id)
    : createExpense.bind(null, projectId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengunggah lampiran.");
        return;
      }
      setReceiptUrl(data.url);
    } catch {
      toast.error("Gagal mengunggah lampiran.");
    } finally {
      setIsUploading(false);
    }
  }

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success(isEdit ? "Pengeluaran diperbarui." : "Pengeluaran dicatat.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setState(initialState);
          setReceiptUrl(expense?.receiptUrl ?? "");
        }
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit pengeluaran">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Catat Pengeluaran
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Pengeluaran" : "Catat Pengeluaran"}</DialogTitle>
            <DialogDescription>
              Setiap pengeluaran wajib memiliki vendor dan lampiran struk.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <Select name="vendorId" defaultValue={expense?.vendorId}>
                  <SelectTrigger id="vendorId" className="w-full">
                    <SelectValue placeholder="Pilih vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.vendorId && (
                  <p className="text-sm text-destructive">{state.fieldErrors.vendorId[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={expense?.amount?.toString()}
                  required
                />
                {state.fieldErrors?.amount && (
                  <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" defaultValue={expense?.description} required />
              {state.fieldErrors?.description && (
                <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDate">Tanggal Pengeluaran</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                defaultValue={expense ? formatDateInput(expense.expenseDate) : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Lampiran Struk</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
              />
              <input type="hidden" name="receiptUrl" value={receiptUrl} />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {isUploading && (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Mengunggah...
                  </>
                )}
                {!isUploading && receiptUrl && (
                  <>
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <Paperclip className="size-3.5" />
                      Lihat lampiran
                    </a>
                  </>
                )}
              </div>
              {state.fieldErrors?.receiptUrl && (
                <p className="text-sm text-destructive">{state.fieldErrors.receiptUrl[0]}</p>
              )}
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || isUploading || !receiptUrl}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
