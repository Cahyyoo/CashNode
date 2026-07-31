"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, canAccessDepartment } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { Role } from "@/lib/generated/prisma/client";

const expenseSchema = z.object({
  vendorId: z.string().min(1, "Vendor wajib dipilih"),
  amount: z
    .string()
    .min(1, "Jumlah wajib diisi")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Jumlah harus berupa angka lebih dari 0",
    }),
  description: z.string().trim().min(3, "Deskripsi wajib diisi"),
  expenseDate: z.string().min(1, "Tanggal wajib diisi"),
  receiptUrl: z.string().min(1, "Lampiran struk wajib diunggah"),
});

export type ExpenseFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

async function assertProjectAccess(projectId: string) {
  const user = await requireUser();
  if (user.role === Role.FINANCE) {
    throw new Error("Finance hanya dapat melihat pengeluaran, bukan menginput.");
  }
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (!canAccessDepartment(user, project.departmentId)) {
    throw new Error("Anda tidak memiliki akses ke proyek ini.");
  }
  return user;
}

function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    vendorId: formData.get("vendorId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    expenseDate: formData.get("expenseDate"),
    receiptUrl: formData.get("receiptUrl"),
  });
}

export async function createExpense(
  projectId: string,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const user = await assertProjectAccess(projectId);

  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.expense.create({
    data: {
      projectId,
      vendorId: parsed.data.vendorId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      expenseDate: new Date(parsed.data.expenseDate),
      receiptUrl: parsed.data.receiptUrl,
      userId: user.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function updateExpense(
  projectId: string,
  expenseId: string,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const user = await assertProjectAccess(projectId);

  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const before = await prisma.expense.findUniqueOrThrow({ where: { id: expenseId } });

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      vendorId: parsed.data.vendorId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      expenseDate: new Date(parsed.data.expenseDate),
      receiptUrl: parsed.data.receiptUrl,
    },
  });

  await logAudit({
    action: "UPDATE",
    entityType: "Expense",
    entityId: expenseId,
    userId: user.id,
    changes: {
      before: { ...before, amount: before.amount.toString() },
      after: parsed.data,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function deleteExpense(projectId: string, expenseId: string) {
  const user = await assertProjectAccess(projectId);

  const expense = await prisma.expense.findUniqueOrThrow({ where: { id: expenseId } });
  await prisma.expense.delete({ where: { id: expenseId } });

  await logAudit({
    action: "DELETE",
    entityType: "Expense",
    entityId: expenseId,
    userId: user.id,
    changes: { deleted: { ...expense, amount: expense.amount.toString() } },
  });

  revalidatePath(`/projects/${projectId}`);
}
