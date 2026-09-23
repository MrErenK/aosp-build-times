"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addBuild } from "@/lib/db";
import { parseBuildForm } from "@/lib/parse-build";
import { rateLimit, sweepExpired } from "@/lib/rate-limit";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `submit:${ip}`;
}

export async function createBuild(formData: FormData): Promise<void> {
  sweepExpired();
  const { ok } = rateLimit(await clientKey(), RATE_LIMIT, RATE_WINDOW_MS);
  if (!ok) {
    redirect("/submit?error=rate");
  }

  const record = parseBuildForm(formData);
  if (!record) {
    redirect("/submit?error=missing");
  }

  await addBuild(record);

  revalidatePath("/");
  redirect("/?submitted=1");
}
