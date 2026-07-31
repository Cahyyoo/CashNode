import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export async function logAudit({
  action,
  entityType,
  entityId,
  userId,
  changes,
}: {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string | null;
  changes?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      userId: userId ?? null,
      changes: changes ?? undefined,
    },
  });
}
