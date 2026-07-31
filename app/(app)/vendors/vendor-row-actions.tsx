"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteVendor, toggleVendorActive } from "./actions";

export function VendorActiveSwitch({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await toggleVendorActive(id, checked);
        });
      }}
      aria-label="Status aktif vendor"
    />
  );
}

export function DeleteVendorButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Hapus vendor"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Hapus vendor ini?")) return;
        startTransition(async () => {
          try {
            await deleteVendor(id);
            toast.success("Vendor dihapus.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus vendor."
            );
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
