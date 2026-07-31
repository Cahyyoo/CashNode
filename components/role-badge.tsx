import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  PM: "Project Manager",
  FINANCE: "Finance",
};

const ROLE_STYLE: Record<Role, string> = {
  ADMIN: "bg-primary/15 text-primary",
  PM: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  FINANCE: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
        ROLE_STYLE[role],
        className
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
