"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteUser, toggleUserActive } from "./actions";

export function UserActiveSwitch({
  id,
  isActive,
  disabled,
}: {
  id: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={disabled || isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          try {
            await toggleUserActive(id, checked);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal mengubah status pengguna."
            );
          }
        });
      }}
      aria-label="Status aktif pengguna"
    />
  );
}

export function DeleteUserButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Hapus pengguna"
      disabled={disabled || isPending}
      onClick={() => {
        if (!confirm("Hapus pengguna ini?")) return;
        startTransition(async () => {
          try {
            await deleteUser(id);
            toast.success("Pengguna dihapus.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus pengguna."
            );
          }
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
