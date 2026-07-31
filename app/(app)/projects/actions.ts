"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, canAccessDepartment } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { Role, ProjectStatus } from "@/lib/generated/prisma/client";

const projectSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    code: z.string().trim().min(2, "Kode minimal 2 karakter").toUpperCase(),
    description: z.string().trim().optional(),
    status: z.nativeEnum(ProjectStatus),
    departmentId: z.string().min(1, "Departemen wajib dipilih"),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
    initialBudget: z
      .string()
      .min(1, "Anggaran wajib diisi")
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
        message: "Anggaran harus berupa angka positif",
      }),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  });

export type ProjectFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    status: formData.get("status"),
    departmentId: formData.get("departmentId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    initialBudget: formData.get("initialBudget"),
  });
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireRole(Role.ADMIN, Role.PM);

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!canAccessDepartment(user, parsed.data.departmentId)) {
    return { error: "Anda hanya dapat membuat proyek di departemen Anda sendiri." };
  }

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        status: parsed.data.status,
        departmentId: parsed.data.departmentId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        initialBudget: parsed.data.initialBudget,
      },
    });
  } catch {
    return { error: "Kode proyek sudah digunakan." };
  }

  revalidatePath("/projects");
  return { error: null };
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireRole(Role.ADMIN, Role.PM);

  const existing = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (!canAccessDepartment(user, existing.departmentId)) {
    return { error: "Anda tidak memiliki akses ke proyek ini." };
  }

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!canAccessDepartment(user, parsed.data.departmentId)) {
    return { error: "Anda hanya dapat memindahkan proyek ke departemen Anda sendiri." };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        status: parsed.data.status,
        departmentId: parsed.data.departmentId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        initialBudget: parsed.data.initialBudget,
      },
    });
  } catch {
    return { error: "Kode proyek sudah digunakan." };
  }

  await logAudit({
    action: "UPDATE",
    entityType: "Project",
    entityId: id,
    userId: user.id,
    changes: {
      before: { ...existing, initialBudget: existing.initialBudget.toString() },
      after: parsed.data,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { error: null };
}

export async function deleteProject(id: string) {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.project.findUniqueOrThrow({ where: { id } });

  try {
    await prisma.project.delete({ where: { id } });
  } catch {
    throw new Error("Proyek tidak dapat dihapus karena masih memiliki data terkait.");
  }

  await logAudit({
    action: "DELETE",
    entityType: "Project",
    entityId: id,
    userId: user.id,
    changes: { deleted: { ...existing, initialBudget: existing.initialBudget.toString() } },
  });

  revalidatePath("/projects");
}

const revisionSchema = z.object({
  amount: z
    .string()
    .min(1, "Nilai revisi wajib diisi")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) !== 0, {
      message: "Nilai revisi harus berupa angka bukan nol (gunakan minus untuk pengurangan)",
    }),
  reason: z.string().trim().min(3, "Alasan revisi wajib diisi"),
});

export type RevisionFormState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};

export async function addBudgetRevision(
  projectId: string,
  _prevState: RevisionFormState,
  formData: FormData
): Promise<RevisionFormState> {
  const user = await requireRole(Role.ADMIN, Role.FINANCE, Role.PM);

  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (!canAccessDepartment(user, project.departmentId)) {
    return { error: "Anda tidak memiliki akses ke proyek ini." };
  }

  const parsed = revisionSchema.safeParse({
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.budgetRevision.create({
    data: {
      projectId,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
      createdById: user.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}
