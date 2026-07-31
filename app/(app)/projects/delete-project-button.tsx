"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProject } from "./actions";

export function DeleteProjectButton({
  id,
  redirectTo,
}: {
  id: string;
  /** Navigate here after a successful delete (e.g. from the detail page). */
  redirectTo?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Hapus proyek"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm("Hapus proyek ini beserta seluruh riwayat anggarannya?")) return;
        startTransition(async () => {
          try {
            await deleteProject(id);
            toast.success("Proyek dihapus.");
            if (redirectTo) router.push(redirectTo);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus proyek."
            );
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
