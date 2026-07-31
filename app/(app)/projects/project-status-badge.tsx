import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

const STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING:
    "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  ACTIVE:
    "bg-primary/15 text-primary border-primary/30",
  ON_HOLD:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  COMPLETED:
    "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  CANCELLED:
    "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Perencanaan",
  ACTIVE: "Berjalan",
  ON_HOLD: "Ditunda",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLE[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
