"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteDepartment } from "./actions";

export function DeleteDepartmentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Hapus departemen"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Hapus departemen ini?")) return;
        startTransition(async () => {
          try {
            await deleteDepartment(id);
            toast.success("Departemen dihapus.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus departemen."
            );
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
