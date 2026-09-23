import { randomUUID } from "crypto";
import { db } from "@/prisma/db";
import type { Models } from "@/prisma/contract";
import type { BuildRecord, NewBuildRecord } from "@/lib/types";

type BuildRow = Models.public_Build;

function toRecord(row: BuildRow): BuildRecord {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt).toISOString(),
    romName: row.romName,
    romVersion: row.romVersion,
    androidVersion: row.androidVersion,
    hostType: row.hostType === "local" ? "local" : "host",
    hostingProvider: row.hostingProvider,
    monthlyPriceUsd: row.monthlyPriceUsd,
    networkSpeed: row.networkSpeed,
    networkSpeedUnit: row.networkSpeedUnit,
    cpuModel: row.cpuModel,
    cpuCores: row.cpuCores,
    cpuThreads: row.cpuThreads,
    memoryGb: row.memoryGb,
    memoryType: row.memoryType,
    memorySpeedMhz: row.memorySpeedMhz,
    disks: row.disks.map((disk) => ({
      count: disk.count,
      sizeGb: disk.sizeGb,
      type: disk.type,
    })),
    swaps: row.swaps.map((swap) => ({
      sizeGb: swap.sizeGb,
      kind: swap.kind,
    })),
    buildMinutes: row.buildMinutes,
    dirtyBuildMinutes: row.dirtyBuildMinutes,
    kernelName: row.kernelName,
    kernelVersion: row.kernelVersion,
    kernelBuildMinutes: row.kernelBuildMinutes,
    kernelDirtyBuildMinutes: row.kernelDirtyBuildMinutes,
    notes: row.notes,
  };
}

export async function getBuilds(): Promise<BuildRecord[]> {
  const rows = await db.orm.public.Build.orderBy((b) => b.createdAt.desc()).all();
  return rows.map(toRecord);
}

export async function getBuild(id: string): Promise<BuildRecord | null> {
  const row = await db.orm.public.Build.first({ id });
  return row ? toRecord(row) : null;
}

export async function addBuild(input: NewBuildRecord): Promise<BuildRecord> {
  const row = await db.orm.public.Build.create({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  });
  return toRecord(row);
}

export async function updateBuild(
  id: string,
  input: NewBuildRecord
): Promise<BuildRecord | null> {
  const row = await db.orm.public.Build.where({ id }).update(input);
  return row ? toRecord(row) : null;
}

export async function deleteBuild(id: string): Promise<boolean> {
  const plan = db.sql.public.build
    .delete()
    .where((f, fns) => fns.eq(f.id, id))
    .build();
  const { affectedRows } = await db.runtime().execute(plan);
  return affectedRows > 0;
}
