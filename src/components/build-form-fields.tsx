"use client";

import { useRef, useState } from "react";
import {
  DISK_TYPES,
  MEMORY_TYPES,
  NETWORK_UNITS,
  DEFAULT_NETWORK_UNIT,
  DEFAULT_HOST_TYPE,
  SWAP_KINDS,
  PRICE_PERIODS,
  PRICE_PERIOD_LABELS,
  DEFAULT_PRICE_PERIOD,
  type BuildRecord,
  type DiskSpec,
  type HostType,
  type SwapSpec,
} from "@/lib/types";

const HOST_TYPE_OPTIONS: { value: HostType; label: string; hint: string }[] = [
  {
    value: "host",
    label: "Hosting provider",
    hint: "A server you rent from Hetzner, AWS, Oracle and friends.",
  },
  {
    value: "local",
    label: "Local PC / server",
    hint: "Your own PC, homelab or a dedicated box you own.",
  },
];

const inputClass =
  "h-10 w-full rounded-md border bg-background px-3 text-base outline-none transition-colors placeholder:text-muted focus:border-foreground sm:text-sm";

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  step,
  min,
  max,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  hint?: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-muted"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue}
        inputMode={type === "number" ? "numeric" : undefined}
        className={inputClass}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  hint,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputClass}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </h2>
  );
}

function NetworkSpeedField({
  speed,
  unit,
}: {
  speed?: number | null;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Network speed</span>
      <div className="flex h-10 items-center rounded-md border bg-background transition-colors focus-within:border-foreground">
        <input
          name="networkSpeed"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 1"
          inputMode="numeric"
          defaultValue={speed ?? undefined}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted sm:text-sm"
        />
        <span className="my-2 w-px self-stretch bg-border" aria-hidden="true" />
        <select
          name="networkSpeedUnit"
          defaultValue={unit || DEFAULT_NETWORK_UNIT}
          className="h-full shrink-0 rounded-r-md bg-transparent pl-2 pr-3 text-base outline-none sm:text-sm"
          aria-label="Network speed unit"
        >
          {NETWORK_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <span className="text-xs text-muted">
        Port speed or measured throughput. Pick the matching unit.
      </span>
    </label>
  );
}

function PriceField({
  price,
  period,
}: {
  price?: number | null;
  period?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Price (USD)</span>
      <div className="flex h-10 items-center rounded-md border bg-background transition-colors focus-within:border-foreground">
        <span className="pl-3 text-base text-muted sm:text-sm" aria-hidden="true">
          $
        </span>
        <input
          name="priceUsd"
          type="number"
          min="0"
          step="0.01"
          placeholder="49.99"
          inputMode="decimal"
          defaultValue={price ?? undefined}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted sm:text-sm"
        />
        <span className="my-2 w-px self-stretch bg-border" aria-hidden="true" />
        <select
          name="pricePeriod"
          defaultValue={period || DEFAULT_PRICE_PERIOD}
          className="h-full shrink-0 rounded-r-md bg-transparent pl-2 pr-3 text-base outline-none sm:text-sm"
          aria-label="Billing period"
        >
          {PRICE_PERIODS.map((option) => (
            <option key={option} value={option}>
              {PRICE_PERIOD_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      <span className="text-xs text-muted">
        What the host bills you. Monthly is the default.
      </span>
    </label>
  );
}

function HostTypeSwitch({
  value,
  onChange,
}: {
  value: HostType;
  onChange: (next: HostType) => void;
}) {
  const active = HOST_TYPE_OPTIONS.find((opt) => opt.value === value)!;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Where do you build?</span>
      <div className="grid w-full grid-cols-2 gap-1 rounded-md border bg-background p-1 sm:w-fit">
        {HOST_TYPE_OPTIONS.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`cursor-pointer rounded px-3 py-1.5 text-center text-sm transition-colors ${
                selected
                  ? "bg-foreground font-medium text-background"
                  : "text-muted hover:bg-card hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="hostType"
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      <span className="text-xs text-muted">{active.hint}</span>
    </div>
  );
}

type RowField = {
  name: string;
  label: string;
  placeholder?: string;
  options?: readonly string[];
};

type Row = { key: number; values: (string | null)[] };

function toRows(initial: (string | null)[][] | undefined, width: number): Row[] {
  const list = initial?.length ? initial : [Array<string | null>(width).fill(null)];
  return list.map((values, index) => ({ key: index, values }));
}

function RowList({
  title,
  hint,
  addLabel,
  columns,
  fields,
  initial,
}: {
  title: string;
  hint: string;
  addLabel: string;
  columns: string;
  fields: RowField[];
  initial?: (string | null)[][];
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initial, fields.length));
  const nextKey = useRef(rows.length);

  function updateRow(key: number, index: number, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.key === key
          ? { ...row, values: row.values.map((item, i) => (i === index ? value : item)) }
          : row
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">{title}</span>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`grid grid-cols-1 items-end gap-3 ${columns}`}
        >
          {fields.map((field, index) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">{field.label}</span>
              {field.options ? (
                <select
                  name={field.name}
                  value={row.values[index] ?? ""}
                  onChange={(event) => updateRow(row.key, index, event.target.value)}
                  className={inputClass}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type="number"
                  min="1"
                  placeholder={field.placeholder}
                  inputMode="numeric"
                  value={row.values[index] ?? ""}
                  onChange={(event) => updateRow(row.key, index, event.target.value)}
                  className={inputClass}
                />
              )}
            </label>
          ))}
          <button
            type="button"
            onClick={() =>
              setRows((current) => current.filter((item) => item.key !== row.key))
            }
            disabled={rows.length === 1}
            aria-label="Remove row"
            className="h-10 rounded-md border text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            { key: nextKey.current++, values: Array<string | null>(fields.length).fill(null) },
          ])
        }
        className="h-10 w-fit rounded-md border px-4 text-sm font-medium transition-colors hover:bg-background"
      >
        {addLabel}
      </button>
      <span className="text-xs text-muted">{hint}</span>
    </div>
  );
}

function DiskFields({ disks }: { disks?: DiskSpec[] }) {
  return (
    <RowList
      title="Disks"
      addLabel="+ Add another disk"
      columns="sm:grid-cols-[6rem_1fr_1fr_2.5rem]"
      hint="One row per disk. Count is how many of them, e.g. 2 × 960 GB NVMe."
      fields={[
        { name: "diskCount", label: "Count", placeholder: "1" },
        { name: "diskSizeGb", label: "Size (GB)", placeholder: "960" },
        {
          name: "diskKind",
          label: "Type",
          placeholder: "Select disk type",
          options: DISK_TYPES,
        },
      ]}
      initial={disks?.map((disk) => [
        disk.count === null ? null : String(disk.count),
        disk.sizeGb === null ? null : String(disk.sizeGb),
        disk.type || null,
      ])}
    />
  );
}

function SwapFields({ swaps }: { swaps?: SwapSpec[] }) {
  return (
    <RowList
      title="Swap & zram"
      addLabel="+ Add swapfile or zram"
      columns="sm:grid-cols-[1fr_1fr_2.5rem]"
      hint="Optional. Add a row per device — a swapfile and zram can both be present."
      fields={[
        { name: "swapSizeGb", label: "Size (GB)", placeholder: "8" },
        {
          name: "swapKind",
          label: "Kind",
          placeholder: "Select kind",
          options: SWAP_KINDS,
        },
      ]}
      initial={swaps?.map((swap) => [
        swap.sizeGb === null ? null : String(swap.sizeGb),
        swap.kind || null,
      ])}
    />
  );
}

export default function BuildFormFields({ build }: { build?: BuildRecord }) {
  const [hostType, setHostType] = useState<HostType>(
    build?.hostType ?? DEFAULT_HOST_TYPE
  );
  const isHost = hostType === "host";

  return (
    <>
      <fieldset className="flex flex-col gap-4">
        <SectionTitle>ROM</SectionTitle>
        <Field
          label="ROM name"
          name="romName"
          placeholder="e.g. LineageOS"
          required
          defaultValue={build?.romName}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="ROM version"
            name="romVersion"
            placeholder="e.g. 23.2"
            defaultValue={build?.romVersion}
          />
          <Field
            label="Android version"
            name="androidVersion"
            type="number"
            min="1"
            max="100"
            placeholder="e.g. 16"
            hint="Number only."
            defaultValue={build?.androidVersion ?? undefined}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionTitle>Server &amp; hosting</SectionTitle>
        <HostTypeSwitch value={hostType} onChange={setHostType} />
        {isHost ? (
          <Field
            label="Hosting provider"
            name="hostingProvider"
            placeholder="e.g. Hetzner, AWS, Oracle Cloud"
            defaultValue={build?.hostingProvider}
          />
        ) : null}
        <div
          className={`grid grid-cols-1 gap-4 ${isHost ? "sm:grid-cols-2" : ""}`}
        >
          {isHost ? (
            <PriceField price={build?.priceUsd} period={build?.pricePeriod} />
          ) : null}
          <NetworkSpeedField
            speed={build?.networkSpeed}
            unit={build?.networkSpeedUnit}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionTitle>Hardware</SectionTitle>
        <Field
          label="CPU model"
          name="cpuModel"
          placeholder="e.g. AMD Ryzen 9 5950X"
          defaultValue={build?.cpuModel}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="CPU cores"
            name="cpuCores"
            type="number"
            min="1"
            placeholder="16"
            defaultValue={build?.cpuCores ?? undefined}
          />
          <Field
            label="Threads"
            name="cpuThreads"
            type="number"
            min="1"
            placeholder="32"
            hint="Optional. Logical threads, not cores."
            defaultValue={build?.cpuThreads ?? undefined}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="Memory (GB)"
            name="memoryGb"
            type="number"
            min="1"
            placeholder="64"
            defaultValue={build?.memoryGb ?? undefined}
          />
          <SelectField
            label="Memory type"
            name="memoryType"
            options={MEMORY_TYPES}
            placeholder="Optional"
            defaultValue={build?.memoryType}
          />
          <Field
            label="RAM speed (MHz)"
            name="memorySpeedMhz"
            type="number"
            min="1"
            placeholder="e.g. 3200"
            hint="Optional."
            defaultValue={build?.memorySpeedMhz ?? undefined}
          />
        </div>
        <DiskFields disks={build?.disks} />
        <SwapFields swaps={build?.swaps} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionTitle>ROM build result</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Clean build time (minutes)"
            name="buildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 120"
            required
            hint="Total wall-clock time for a full build."
            defaultValue={build?.buildMinutes}
          />
          <Field
            label="Dirty build time (minutes)"
            name="dirtyBuildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 25"
            hint="Incremental rebuild on an existing out/ tree."
            defaultValue={build?.dirtyBuildMinutes ?? undefined}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <div>
          <SectionTitle>Kernel build (optional)</SectionTitle>
          <p className="mt-2 text-sm text-muted">
            Built a kernel on the same machine? Add its times here. Leave blank
            to skip.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Kernel name"
            name="kernelName"
            placeholder="e.g. Sultan, Proton, stock"
            defaultValue={build?.kernelName}
          />
          <Field
            label="Kernel version"
            name="kernelVersion"
            placeholder="e.g. 5.10"
            defaultValue={build?.kernelVersion}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Clean build time (minutes)"
            name="kernelBuildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 8"
            defaultValue={build?.kernelBuildMinutes ?? undefined}
          />
          <Field
            label="Dirty build time (minutes)"
            name="kernelDirtyBuildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 2"
            defaultValue={build?.kernelDirtyBuildMinutes ?? undefined}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionTitle>Notes</SectionTitle>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="ccache enabled, clean build, etc."
            defaultValue={build?.notes}
            className="rounded-md border bg-background px-3 py-2 text-base outline-none transition-colors placeholder:text-muted focus:border-foreground sm:text-sm"
          />
        </label>
      </fieldset>
    </>
  );
}
