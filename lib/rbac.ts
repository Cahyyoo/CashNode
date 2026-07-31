import "server-only";

import { auth } from "@/auth";
import { Role } from "@/lib/generated/prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: no active session.");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(" or ")}.`);
  }
  return user;
}

export const isAdmin = (role: Role) => role === Role.ADMIN;
export const isFinance = (role: Role) => role === Role.FINANCE;

type SessionUser = {
  role: Role;
  departmentId: string | null;
};

/** Finance and Admin see every project; a PM is confined to their own department. */
export function canAccessDepartment(
  user: SessionUser,
  departmentId: string
) {
  if (user.role === Role.ADMIN || user.role === Role.FINANCE) return true;
  return user.departmentId === departmentId;
}

export async function requireDepartmentAccess(departmentId: string) {
  const user = await requireUser();
  if (!canAccessDepartment(user, departmentId)) {
    throw new Error("Forbidden: proyek ini di luar departemen Anda.");
  }
  return user;
}
