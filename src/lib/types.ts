export const DISK_TYPES = ["HDD", "SATA SSD", "NVMe SSD"] as const;
export type DiskType = (typeof DISK_TYPES)[number];

export const MEMORY_TYPES = ["DDR3", "DDR4", "DDR5"] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

// Networks are quoted in different units depending on the host, and some
// people report throughput (MB/s) instead of port speed (Mbit/s).
export const NETWORK_UNITS = ["Mbit/s", "Gbit/s", "MB/s", "GB/s"] as const;
export type NetworkUnit = (typeof NETWORK_UNITS)[number];
export const DEFAULT_NETWORK_UNIT: NetworkUnit = "Gbit/s";

export type BuildRecord = {
  id: string;
  createdAt: string;

  // ROM being built
  romName: string;
  romVersion: string;
  androidVersion: number | null;

  // Server / hosting information
  hostingProvider: string;
  monthlyPriceUsd: number | null;
  networkSpeed: number | null;
  networkSpeedUnit: string;

  // Hardware
  cpuModel: string;
  cpuCores: number | null;
  memoryGb: number | null;
  memoryType: string;
  diskGb: number | null;
  diskType: string;

  // Build result
  buildMinutes: number;
  dirtyBuildMinutes: number | null;

  // Optional kernel build result
  kernelName: string;
  kernelVersion: string;
  kernelBuildMinutes: number | null;
  kernelDirtyBuildMinutes: number | null;

  notes: string;
};

export type NewBuildRecord = Omit<BuildRecord, "id" | "createdAt">;

export function formatNetworkSpeed(build: BuildRecord): string {
  if (build.networkSpeed === null) return "";
  return `${build.networkSpeed} ${build.networkSpeedUnit || DEFAULT_NETWORK_UNIT}`;
}
