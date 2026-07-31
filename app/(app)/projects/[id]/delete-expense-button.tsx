"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "./expense-actions";

export function DeleteExpenseButton({
  projectId,
  expenseId,
}: {
  projectId: string;
  expenseId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Hapus pengeluaran"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Hapus pengeluaran ini?")) return;
        startTransition(async () => {
          try {
            await deleteExpense(projectId, expenseId);
            toast.success("Pengeluaran dihapus.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus pengeluaran."
            );
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
