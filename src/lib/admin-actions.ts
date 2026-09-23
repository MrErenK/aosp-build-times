"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteBuild, updateBuild } from "@/lib/db";
import { parseBuildForm } from "@/lib/parse-build";
import {
  checkPassword,
  createSession,
  destroySession,
  isAdmin,
} from "@/lib/admin-auth";
import { rateLimit, sweepExpired } from "@/lib/rate-limit";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 5 * 60_000;

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function adminLogin(formData: FormData): Promise<void> {
  sweepExpired();
  // Login attempts are limited globally: this is a single-admin panel, so
  // there is no legitimate case for a burst of attempts.
  const { ok } = rateLimit("admin-login", LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!ok) {
    redirect("/admin/login?error=rate");
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  await createSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function adminUpdateBuild(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id === "") {
    redirect("/admin?error=notfound");
  }

  const record = parseBuildForm(formData);
  if (!record) {
    redirect(`/admin/${id}?error=missing`);
  }

  const updated = await updateBuild(id, record);
  if (!updated) {
    redirect("/admin?error=notfound");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/builds/${id}`);
  redirect("/admin?done=updated");
}

export async function adminDeleteBuild(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id === "") {
    redirect("/admin?error=notfound");
  }

  const deleted = await deleteBuild(id);
  if (!deleted) {
    redirect("/admin?error=notfound");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?done=deleted");
}
