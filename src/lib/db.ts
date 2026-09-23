import { randomUUID } from "crypto";
import { or } from "@prisma/orm-postgres/orm-client";
import { db } from "@/prisma/db";
import type { Models } from "@/prisma/contract";
import {
  DEFAULT_PRICE_PERIOD,
  isPricePeriod,
  type BuildRecord,
  type NewBuildRecord,
} from "@/lib/types";

export const PAGE_SIZE = 10;

type BuildRow = Models.public_Build;

function toRecord(row: BuildRow): BuildRecord {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt).toISOString(),
    romName: row.romName,
    romVersion: row.romVersion,
    androidVersion: row.androidVersion,
    repoSyncMinutes: row.repoSyncMinutes,
    repoSyncMode: row.repoSyncMode,
    hostType: row.hostType === "local" ? "local" : "host",
    hostingProvider: row.hostingProvider,
    priceUsd: row.priceUsd,
    pricePeriod: isPricePeriod(row.pricePeriod)
      ? row.pricePeriod
      : DEFAULT_PRICE_PERIOD,
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
    raidStatus: row.raidStatus,
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

const SEARCH_FIELDS = [
  "romName",
  "romVersion",
  "hostingProvider",
  "cpuModel",
  "memoryType",
  "kernelName",
  "notes",
] as const;

function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

function searchBuilds(query: string) {
  const like = likePattern(query.trim());
  return db.orm.public.Build.where((b) =>
    or(...SEARCH_FIELDS.map((field) => b[field].ilike(like)))
  );
}

export type BuildPage = {
  builds: BuildRecord[];
  total: number;
  page: number;
  pageCount: number;
};

export async function getBuildsPage({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
}): Promise<BuildPage> {
  const matching = searchBuilds(query);
  const { total } = await matching.aggregate((a) => ({ total: a.count() }));

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount);

  const rows = await matching
    .orderBy((b) => b.createdAt.desc())
    .limit(PAGE_SIZE)
    .offset((current - 1) * PAGE_SIZE)
    .all();

  return { builds: rows.map(toRecord), total, page: current, pageCount };
}

export type BuildStats = {
  count: number;
  avgMinutes: number | null;
  fastestMinutes: number | null;
};

export async function getBuildStats(query = ""): Promise<BuildStats> {
  const { count, avgMinutes, fastestMinutes } = await searchBuilds(
    query
  ).aggregate((a) => ({
    count: a.count(),
    avgMinutes: a.avg("buildMinutes"),
    fastestMinutes: a.min("buildMinutes"),
  }));

  return { count, avgMinutes, fastestMinutes };
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
