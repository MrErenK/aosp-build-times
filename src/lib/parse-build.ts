import {
  DISK_TYPES,
  MEMORY_TYPES,
  NETWORK_UNITS,
  DEFAULT_NETWORK_UNIT,
  type NewBuildRecord,
} from "@/lib/types";

// Security limits
export const MAX_TEXT = 120; // max length for short text fields
export const MAX_NOTES = 1000; // max length for the notes field

function cleanString(value: FormDataEntryValue | null, maxLen: number): string {
  if (value == null) return "";
  // Reject non-string entries (e.g. files) and strip control chars.
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

function fromWhitelist(
  value: FormDataEntryValue | null,
  allowed: readonly string[]
): string {
  if (typeof value !== "string") return "";
  return allowed.includes(value) ? value : "";
}

// Parses and sanitizes a build submission. Returns null when the required
// fields (ROM name + build time) are missing or out of range.
export function parseBuildForm(formData: FormData): NewBuildRecord | null {
  const romName = cleanString(formData.get("romName"), MAX_TEXT);
  const buildMinutes = toNumber(formData.get("buildMinutes"), {
    min: 1,
    max: 100_000,
  });

  if (romName === "" || buildMinutes === null) return null;

  return {
    romName,
    romVersion: cleanString(formData.get("romVersion"), MAX_TEXT),
    androidVersion: toNumber(formData.get("androidVersion"), {
      min: 1,
      max: 100,
    }),
    hostingProvider: cleanString(formData.get("hostingProvider"), MAX_TEXT),
    monthlyPriceUsd: toNumber(formData.get("monthlyPriceUsd"), {
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
    memoryGb: toNumber(formData.get("memoryGb"), { min: 1, max: 1_048_576 }),
    memoryType: fromWhitelist(formData.get("memoryType"), MEMORY_TYPES),
    diskGb: toNumber(formData.get("diskGb"), { min: 1, max: 1_048_576 }),
    diskType: fromWhitelist(formData.get("diskType"), DISK_TYPES),
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
