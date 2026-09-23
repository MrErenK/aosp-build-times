export const DISK_TYPES = ["HDD", "SATA SSD", "NVMe SSD"] as const;
export type DiskType = (typeof DISK_TYPES)[number];

export const MEMORY_TYPES = ["DDR3", "DDR4", "DDR5"] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

// Networks are quoted in different units depending on the host, and some
// people report throughput (MB/s) instead of port speed (Mbit/s).
export const NETWORK_UNITS = ["Mbit/s", "Gbit/s", "MB/s", "GB/s"] as const;
export type NetworkUnit = (typeof NETWORK_UNITS)[number];
export const DEFAULT_NETWORK_UNIT: NetworkUnit = "Gbit/s";

export const HOST_TYPES = ["host", "local"] as const;
export type HostType = (typeof HOST_TYPES)[number];
export const DEFAULT_HOST_TYPE: HostType = "host";
export const LOCAL_HOST_LABEL = "Local machine";

export const SWAP_KINDS = ["Swapfile", "ZRAM"] as const;
export type SwapKind = (typeof SWAP_KINDS)[number];

export const PRICE_PERIODS = ["hour", "day", "month", "year"] as const;
export type PricePeriod = (typeof PRICE_PERIODS)[number];
export const DEFAULT_PRICE_PERIOD: PricePeriod = "month";
export const PRICE_PERIOD_LABELS: Record<PricePeriod, string> = {
  hour: "Hour",
  day: "Day",
  month: "Month",
  year: "Year",
};

export function isPricePeriod(value: string): value is PricePeriod {
  return (PRICE_PERIODS as readonly string[]).includes(value);
}

const PRICE_PERIOD_SUFFIX: Record<PricePeriod, string> = {
  hour: "/h",
  day: "/day",
  month: "/mo",
  year: "/yr",
};

// Month lengths averaged out (730 hours, 365/12 days), so hourly, daily and
// yearly prices can be compared.
const MONTHS_PER_PERIOD: Record<PricePeriod, number> = {
  hour: 730,
  day: 365 / 12,
  month: 1,
  year: 1 / 12,
};

export type DiskSpec = {
  count: number | null;
  sizeGb: number | null;
  type: string;
};

export type SwapSpec = {
  sizeGb: number | null;
  kind: string;
};

export type BuildRecord = {
  id: string;
  createdAt: string;

  romName: string;
  romVersion: string;
  androidVersion: number | null;

  hostType: HostType;
  hostingProvider: string;
  priceUsd: number | null;
  pricePeriod: PricePeriod;
  networkSpeed: number | null;
  networkSpeedUnit: string;

  cpuModel: string;
  cpuCores: number | null;
  cpuThreads: number | null;
  memoryGb: number | null;
  memoryType: string;
  memorySpeedMhz: number | null;
  disks: DiskSpec[];
  swaps: SwapSpec[];

  buildMinutes: number;
  dirtyBuildMinutes: number | null;

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

export function formatMemory(build: BuildRecord): string {
  if (
    build.memoryGb === null &&
    build.memoryType === "" &&
    build.memorySpeedMhz === null
  ) {
    return "";
  }
  const capacity = build.memoryGb === null ? "" : `${build.memoryGb} GB`;
  const speed =
    build.memorySpeedMhz === null ? "" : `${build.memorySpeedMhz} MHz`;
  const kind =
    build.memoryType && speed
      ? `${build.memoryType}-${build.memorySpeedMhz}`
      : build.memoryType || speed;
  return [capacity, kind, "RAM"].filter(Boolean).join(" ");
}

export function formatDisks(disks: DiskSpec[]): string {
  return disks
    .map((disk) => {
      const size = disk.sizeGb === null ? "" : `${disk.sizeGb} GB`;
      const quantity = disk.count === null || disk.count === 1 ? "" : `${disk.count} × `;
      return [quantity + size, disk.type].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

export function formatSwaps(swaps: SwapSpec[]): string {
  return swaps
    .map((swap) => {
      const size = swap.sizeGb === null ? "" : `${swap.sizeGb} GB`;
      return [size, swap.kind].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

export function formatHost(build: BuildRecord): string {
  if (build.hostType === "local") return LOCAL_HOST_LABEL;
  return build.hostingProvider || "Unknown host";
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function formatAmount(value: number): string {
  return value.toFixed(4).replace(/\.?0+$/, "");
}

export function formatPrice(
  build: Pick<BuildRecord, "priceUsd" | "pricePeriod">
): string {
  if (build.priceUsd === null) return "";
  return `$${formatAmount(build.priceUsd)}${PRICE_PERIOD_SUFFIX[build.pricePeriod]}`;
}

export function formatMonthlyPrice(
  build: Pick<BuildRecord, "priceUsd" | "pricePeriod">
): string {
  if (build.priceUsd === null || build.pricePeriod === "month") return "";
  const monthly = build.priceUsd * MONTHS_PER_PERIOD[build.pricePeriod];
  return `$${monthly.toFixed(2)}/mo`;
}
