"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@/lib/generated/prisma/client";

const departmentSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter")
    .max(10, "Kode maksimal 10 karakter")
    .toUpperCase(),
  description: z.string().trim().optional(),
});

export type DepartmentFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

export async function createDepartment(
  _prevState: DepartmentFormState,
  formData: FormData
): Promise<DepartmentFormState> {
  await requireRole(Role.ADMIN);

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.department.create({ data: parsed.data });
  } catch {
    return { error: "Nama atau kode departemen sudah digunakan." };
  }

  revalidatePath("/departments");
  return { error: null };
}

export async function updateDepartment(
  id: string,
  _prevState: DepartmentFormState,
  formData: FormData
): Promise<DepartmentFormState> {
  await requireRole(Role.ADMIN);

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.department.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Nama atau kode departemen sudah digunakan." };
  }

  revalidatePath("/departments");
  return { error: null };
}

export async function deleteDepartment(id: string) {
  await requireRole(Role.ADMIN);

  try {
    await prisma.department.delete({ where: { id } });
  } catch {
    throw new Error(
      "Departemen tidak dapat dihapus karena masih memiliki data terkait."
    );
  }

  revalidatePath("/departments");
}
