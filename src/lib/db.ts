import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { DEFAULT_NETWORK_UNIT, type BuildRecord, type NewBuildRecord } from "./types";

// Simple JSON-file backed store. Good enough for a placeholder site and
// avoids native dependencies. Data lives in <project root>/data/builds.json.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "builds.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

// Records written before the network/kernel fields existed are missing keys.
// Fill them in on read so the rest of the app can assume a complete shape.
function normalize(raw: Partial<BuildRecord> & { networkPortSpeed?: string }): BuildRecord {
  const legacySpeed =
    raw.networkSpeed === undefined && typeof raw.networkPortSpeed === "string"
      ? Number(raw.networkPortSpeed.replace(/[^0-9.]/g, ""))
      : null;

  return {
    id: raw.id ?? randomUUID(),
    createdAt: raw.createdAt ?? new Date(0).toISOString(),
    romName: raw.romName ?? "",
    romVersion: raw.romVersion ?? "",
    androidVersion: raw.androidVersion ?? null,
    hostingProvider: raw.hostingProvider ?? "",
    monthlyPriceUsd: raw.monthlyPriceUsd ?? null,
    networkSpeed:
      raw.networkSpeed ?? (Number.isFinite(legacySpeed) ? legacySpeed : null),
    networkSpeedUnit: raw.networkSpeedUnit ?? DEFAULT_NETWORK_UNIT,
    cpuModel: raw.cpuModel ?? "",
    cpuCores: raw.cpuCores ?? null,
    memoryGb: raw.memoryGb ?? null,
    memoryType: raw.memoryType ?? "",
    diskGb: raw.diskGb ?? null,
    diskType: raw.diskType ?? "",
    buildMinutes: raw.buildMinutes ?? 0,
    dirtyBuildMinutes: raw.dirtyBuildMinutes ?? null,
    kernelName: raw.kernelName ?? "",
    kernelVersion: raw.kernelVersion ?? "",
    kernelBuildMinutes: raw.kernelBuildMinutes ?? null,
    kernelDirtyBuildMinutes: raw.kernelDirtyBuildMinutes ?? null,
    notes: raw.notes ?? "",
  };
}

async function readAll(): Promise<BuildRecord[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

async function writeAll(builds: BuildRecord[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(builds, null, 2), "utf8");
}

export async function getBuilds(): Promise<BuildRecord[]> {
  const builds = await readAll();
  // Newest first
  return builds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBuild(id: string): Promise<BuildRecord | null> {
  const builds = await readAll();
  return builds.find((b) => b.id === id) ?? null;
}

export async function addBuild(input: NewBuildRecord): Promise<BuildRecord> {
  const builds = await readAll();
  const record: BuildRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  builds.push(record);
  await writeAll(builds);
  return record;
}

export async function updateBuild(
  id: string,
  input: NewBuildRecord
): Promise<BuildRecord | null> {
  const builds = await readAll();
  const index = builds.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const record: BuildRecord = {
    id: builds[index].id,
    createdAt: builds[index].createdAt,
    ...input,
  };
  builds[index] = record;
  await writeAll(builds);
  return record;
}

export async function deleteBuild(id: string): Promise<boolean> {
  const builds = await readAll();
  const remaining = builds.filter((b) => b.id !== id);
  if (remaining.length === builds.length) return false;
  await writeAll(remaining);
  return true;
}
