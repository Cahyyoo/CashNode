"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@/lib/generated/prisma/client";

const vendorSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  contactName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Format email tidak valid",
    }),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type VendorFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

const MANAGE_ROLES = [Role.ADMIN, Role.FINANCE];

export async function createVendor(
  _prevState: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  await requireRole(...MANAGE_ROLES);

  const parsed = vendorSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.vendor.create({ data: parsed.data });
  revalidatePath("/vendors");
  return { error: null };
}

export async function updateVendor(
  id: string,
  _prevState: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  await requireRole(...MANAGE_ROLES);

  const parsed = vendorSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.vendor.update({ where: { id }, data: parsed.data });
  revalidatePath("/vendors");
  return { error: null };
}

export async function toggleVendorActive(id: string, isActive: boolean) {
  await requireRole(...MANAGE_ROLES);
  await prisma.vendor.update({ where: { id }, data: { isActive } });
  revalidatePath("/vendors");
}

export async function deleteVendor(id: string) {
  await requireRole(...MANAGE_ROLES);

  try {
    await prisma.vendor.delete({ where: { id } });
  } catch {
    throw new Error(
      "Vendor tidak dapat dihapus karena masih memiliki data terkait."
    );
  }

  revalidatePath("/vendors");
}
