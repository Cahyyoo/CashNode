"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@/lib/generated/prisma/client";

const baseUserSchema = {
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  role: z.nativeEnum(Role),
  departmentId: z.string().trim().optional(),
};

const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(8, "Password minimal 8 karakter"),
});

const updateUserSchema = z.object({
  ...baseUserSchema,
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 8, {
      message: "Password minimal 8 karakter",
    }),
});

export type UserFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole(Role.ADMIN);

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        departmentId: parsed.data.departmentId || null,
        passwordHash,
      },
    });
  } catch {
    return { error: "Email sudah digunakan." };
  }

  revalidatePath("/users");
  return { error: null };
}

export async function updateUser(
  id: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const currentUser = await requireRole(Role.ADMIN);

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (currentUser.id === id && parsed.data.role !== Role.ADMIN) {
    return { error: "Anda tidak dapat mengubah peran akun Anda sendiri." };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        departmentId: parsed.data.departmentId || null,
        ...(parsed.data.password
          ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) }
          : {}),
      },
    });
  } catch {
    return { error: "Email sudah digunakan." };
  }

  revalidatePath("/users");
  return { error: null };
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const currentUser = await requireRole(Role.ADMIN);

  if (currentUser.id === id) {
    throw new Error("Anda tidak dapat menonaktifkan akun Anda sendiri.");
  }

  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  const currentUser = await requireRole(Role.ADMIN);

  if (currentUser.id === id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
