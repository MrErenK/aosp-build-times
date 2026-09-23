import {
  DISK_TYPES,
  MEMORY_TYPES,
  NETWORK_UNITS,
  DEFAULT_NETWORK_UNIT,
  HOST_TYPES,
  DEFAULT_HOST_TYPE,
  SWAP_KINDS,
  type NewBuildRecord,
} from "@/lib/types";

export const MAX_TEXT = 120;
export const MAX_NOTES = 1000;

function cleanString(value: FormDataEntryValue | null, maxLen: number): string {
  if (value == null) return "";
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maxLen);
}

function toNumber(
  value: FormDataEntryValue | null,
  { min, max }: { min?: number; max?: number } = {}
): number | null {
  if (typeof value !== "string") return null;
  const str = value.trim();
  if (str === "") return null;
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  if (min !== undefined && n < min) return null;
  if (max !== undefined && n > max) return null;
  return n;
}

function fromWhitelist<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[]
): T | "" {
  if (typeof value !== "string") return "";
  return (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

type RowValues = {
  count: number | null;
  sizeGb: number | null;
  kind: string;
};

function parseRows(
  formData: FormData,
  prefix: string,
  allowed: readonly string[]
): RowValues[] {
  const counts = formData.getAll(`${prefix}Count`);
  const sizes = formData.getAll(`${prefix}SizeGb`);
  const kinds = formData.getAll(`${prefix}Kind`);

  const rows: RowValues[] = [];
  for (let i = 0; i < sizes.length; i += 1) {
    const row: RowValues = {
      count: toNumber(counts[i] ?? null, { min: 1, max: 64 }),
      sizeGb: toNumber(sizes[i] ?? null, { min: 1, max: 1_000_000 }),
      kind: fromWhitelist(kinds[i] ?? null, allowed),
    };
    if (row.count === null && row.sizeGb === null && row.kind === "") continue;
    rows.push(row);
  }
  return rows;
}

export function parseBuildForm(formData: FormData): NewBuildRecord | null {
  const romName = cleanString(formData.get("romName"), MAX_TEXT);
  const buildMinutes = toNumber(formData.get("buildMinutes"), {
    min: 1,
    max: 100_000,
  });

  if (romName === "" || buildMinutes === null) return null;

  const hostType =
    fromWhitelist(formData.get("hostType"), HOST_TYPES) || DEFAULT_HOST_TYPE;
  const isLocal = hostType === "local";

  return {
    romName,
    romVersion: cleanString(formData.get("romVersion"), MAX_TEXT),
    androidVersion: toNumber(formData.get("androidVersion"), {
      min: 1,
      max: 100,
    }),
    hostType,
    hostingProvider: isLocal
      ? ""
      : cleanString(formData.get("hostingProvider"), MAX_TEXT),
    monthlyPriceUsd: isLocal
      ? null
      : toNumber(formData.get("monthlyPriceUsd"), {
          min: 0,
          max: 1_000_000,
        }),
    networkSpeed: toNumber(formData.get("networkSpeed"), {
      min: 0,
      max: 1_000_000,
    }),
    networkSpeedUnit:
      fromWhitelist(formData.get("networkSpeedUnit"), NETWORK_UNITS) ||
      DEFAULT_NETWORK_UNIT,
    cpuModel: cleanString(formData.get("cpuModel"), MAX_TEXT),
    cpuCores: toNumber(formData.get("cpuCores"), { min: 1, max: 4096 }),
    cpuThreads: toNumber(formData.get("cpuThreads"), { min: 1, max: 8192 }),
    memoryGb: toNumber(formData.get("memoryGb"), { min: 1, max: 1_048_576 }),
    memoryType: fromWhitelist(formData.get("memoryType"), MEMORY_TYPES),
    memorySpeedMhz: toNumber(formData.get("memorySpeedMhz"), {
      min: 1,
      max: 100_000,
    }),
    disks: parseRows(formData, "disk", DISK_TYPES).map(
      ({ count, sizeGb, kind }) => ({ count, sizeGb, type: kind })
    ),
    swaps: parseRows(formData, "swap", SWAP_KINDS).map(({ sizeGb, kind }) => ({
      sizeGb,
      kind,
    })),
    buildMinutes,
    dirtyBuildMinutes: toNumber(formData.get("dirtyBuildMinutes"), {
      min: 1,
      max: 100_000,
    }),
    kernelName: cleanString(formData.get("kernelName"), MAX_TEXT),
    kernelVersion: cleanString(formData.get("kernelVersion"), MAX_TEXT),
    kernelBuildMinutes: toNumber(formData.get("kernelBuildMinutes"), {
      min: 1,
      max: 100_000,
    }),
    kernelDirtyBuildMinutes: toNumber(
      formData.get("kernelDirtyBuildMinutes"),
      { min: 1, max: 100_000 }
    ),
    notes: cleanString(formData.get("notes"), MAX_NOTES),
  };
}
