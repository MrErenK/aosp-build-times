"use client";

import { useRef, useState } from "react";
import {
  DISK_TYPES,
  MEMORY_TYPES,
  NETWORK_UNITS,
  DEFAULT_NETWORK_UNIT,
  DEFAULT_HOST_TYPE,
  SWAP_KINDS,
  REPO_SYNC_MODES,
  raidOptionsFor,
  PRICE_PERIODS,
  PRICE_PERIOD_LABELS,
  DEFAULT_PRICE_PERIOD,
  type BuildRecord,
  type DiskSpec,
  type HostType,
  type SwapSpec,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/button";
import { Panel } from "@/components/panel";
import { Field as FormField, Input, Textarea } from "@/components/input";
import { Select } from "@/components/select";

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

function note(hint: string | undefined, required: boolean): string | undefined {
  return [hint, required ? "required" : null].filter(Boolean).join(" · ") || undefined;
}

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
    <FormField label={label} htmlFor={name} hint={note(hint, required)}>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue}
        inputMode={type === "number" ? "numeric" : undefined}
      />
    </FormField>
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
    <FormField label={label} htmlFor={name} hint={hint}>
      <Select
        id={name}
        name={name}
        options={options}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </FormField>
  );
}

const PRICE_PERIOD_OPTIONS = PRICE_PERIODS.map((period) => ({
  value: period,
  label: PRICE_PERIOD_LABELS[period],
}));

const groupChrome =
  "flex items-stretch border border-line bg-background " +
  "focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-foreground";

const groupInput =
  "h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-foreground outline-none placeholder:text-muted sm:h-7";

const groupSelect =
  "h-9 shrink-0 cursor-pointer bg-transparent pl-1 pr-2 text-xs outline-none sm:h-7";

function NetworkSpeedField({
  speed,
  unit,
}: {
  speed?: number | null;
  unit?: string;
}) {
  return (
    <FormField
      label="Network speed"
      htmlFor="networkSpeed"
      hint="port speed or throughput"
    >
      <div className={groupChrome}>
        <input
          id="networkSpeed"
          name="networkSpeed"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 1"
          inputMode="numeric"
          defaultValue={speed ?? undefined}
          className={groupInput}
        />
        <span className="w-px self-stretch bg-line" aria-hidden="true" />
        <Select
          name="networkSpeedUnit"
          options={NETWORK_UNITS}
          defaultValue={unit || DEFAULT_NETWORK_UNIT}
          bare
          menuAlign="end"
          className={groupSelect}
          aria-label="Network speed unit"
        />
      </div>
    </FormField>
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
    <FormField
      label="Price (USD)"
      htmlFor="priceUsd"
      hint="what the host bills you"
    >
      <div className={groupChrome}>
        <span
          className="flex items-center pl-2 text-xs text-muted"
          aria-hidden="true"
        >
          $
        </span>
        <input
          id="priceUsd"
          name="priceUsd"
          type="number"
          min="0"
          step="0.01"
          placeholder="49.99"
          inputMode="decimal"
          defaultValue={price ?? undefined}
          className={cn(groupInput, "pl-1")}
        />
        <span className="w-px self-stretch bg-line" aria-hidden="true" />
        <Select
          name="pricePeriod"
          options={PRICE_PERIOD_OPTIONS}
          defaultValue={period || DEFAULT_PRICE_PERIOD}
          bare
          menuAlign="end"
          className={groupSelect}
          aria-label="Billing period"
        />
      </div>
    </FormField>
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
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted">
        where do you build?
      </span>
      <div className="flex w-full gap-1 sm:w-fit">
        {HOST_TYPE_OPTIONS.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={cn(
                "flex-1 cursor-pointer border border-line px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider sm:flex-none",
                "transition-colors duration-75",
                selected
                  ? "bg-invert text-invert-foreground"
                  : "bg-background text-foreground invert-hover",
              )}
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
  options?: readonly string[] | ((rows: Row[]) => readonly string[]);
};

type Row = { key: number; values: (string | null)[] };

function resolveOptions(
  field: RowField | undefined,
  rows: Row[],
): readonly string[] | undefined {
  if (!field?.options) return undefined;
  return typeof field.options === "function"
    ? field.options(rows)
    : field.options;
}

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
          ? {
              ...row,
              values: row.values.map((item, i) => (i === index ? value : item)),
            }
          : row,
      ),
    );
  }

  function fieldValue(field: RowField, value: string | null): string {
    const current = value ?? "";
    if (current === "") return "";
    const options = resolveOptions(field, rows);
    return !options || options.includes(current) ? current : "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-muted">{title}</span>
      {rows.map((row) => (
        <div
          key={row.key}
          className={cn("grid grid-cols-1 items-end gap-2", columns)}
        >
          {fields.map((field, index) => {
            const options = resolveOptions(field, rows);
            const id = `${field.name}-${row.key}`;
            return (
              <FormField key={field.name} label={field.label} htmlFor={id}>
                {options ? (
                  <Select
                    id={id}
                    name={field.name}
                    options={options}
                    placeholder={field.placeholder}
                    value={fieldValue(field, row.values[index])}
                    onChange={(next) => updateRow(row.key, index, next)}
                  />
                ) : (
                  <Input
                    id={id}
                    name={field.name}
                    type="number"
                    min="1"
                    placeholder={field.placeholder}
                    inputMode="numeric"
                    value={fieldValue(field, row.values[index])}
                    onChange={(event) =>
                      updateRow(row.key, index, event.target.value)
                    }
                  />
                )}
              </FormField>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((current) => current.filter((item) => item.key !== row.key))
            }
            disabled={rows.length === 1}
            aria-label="Remove row"
          >
            [x]
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setRows((current) => [
            ...current,
            {
              key: nextKey.current++,
              values: Array<string | null>(fields.length).fill(null),
            },
          ])
        }
        className="w-fit"
      >
        + {addLabel}
      </Button>
      <span className="text-xs text-muted">{hint}</span>
    </div>
  );
}

function DiskFields({ disks }: { disks?: DiskSpec[] }) {
  return (
    <RowList
      title="Disks"
      addLabel="add disk"
      columns="sm:grid-cols-[5rem_1fr_1fr_1fr_2.5rem]"
      hint="One row per disk. Count is how many of them, e.g. 2 × 960 GB NVMe, both in RAID 1. RAID levels appear once you have listed enough disks for them."
      fields={[
        { name: "diskCount", label: "Count", placeholder: "1" },
        { name: "diskSizeGb", label: "Size (GB)", placeholder: "960" },
        {
          name: "diskKind",
          label: "Type",
          placeholder: "select disk type",
          options: DISK_TYPES,
        },
        {
          name: "diskRaid",
          label: "RAID",
          placeholder: "optional",
          options: (rows) =>
            raidOptionsFor(
              rows.reduce(
                (sum, row) =>
                  sum + Math.min(Math.max(Number(row.values[0]) || 1, 1), 64),
                0,
              ),
            ),
        },
      ]}
      initial={disks?.map((disk) => [
        disk.count === null ? null : String(disk.count),
        disk.sizeGb === null ? null : String(disk.sizeGb),
        disk.type || null,
        disk.raid || null,
      ])}
    />
  );
}

function SwapFields({ swaps }: { swaps?: SwapSpec[] }) {
  return (
    <RowList
      title="Swap & zram"
      addLabel="add swapfile or zram"
      columns="sm:grid-cols-[1fr_1fr_2.5rem]"
      hint="Optional. Add a row per device — a swapfile and zram can both be present."
      fields={[
        { name: "swapSizeGb", label: "Size (GB)", placeholder: "8" },
        {
          name: "swapKind",
          label: "Kind",
          placeholder: "select kind",
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
    build?.hostType ?? DEFAULT_HOST_TYPE,
  );
  const isHost = hostType === "host";

  return (
    <div className="flex flex-col gap-4">
      <Panel title="ROM">
        <div className="flex flex-col gap-2">
          <Field
            label="ROM name"
            name="romName"
            placeholder="e.g. LineageOS"
            required
            defaultValue={build?.romName}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              hint="number only"
              defaultValue={build?.androidVersion ?? undefined}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field
              label="Repo sync time (minutes)"
              name="repoSyncMinutes"
              type="number"
              min="1"
              placeholder="e.g. 12"
              hint="how long repo sync took"
              defaultValue={build?.repoSyncMinutes ?? undefined}
            />
            <SelectField
              label="Source sync mode"
              name="repoSyncMode"
              options={REPO_SYNC_MODES}
              placeholder="optional"
              hint="shallow init skips history"
              defaultValue={build?.repoSyncMode}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Server & hosting">
        <div className="flex flex-col gap-2">
          <HostTypeSwitch value={hostType} onChange={setHostType} />
          {isHost ? (
            <Field
              label="Hosting provider"
              name="hostingProvider"
              placeholder="e.g. Hetzner, AWS, Oracle Cloud"
              defaultValue={build?.hostingProvider}
            />
          ) : null}
          <div className={`grid grid-cols-1 gap-2 ${isHost ? "sm:grid-cols-2" : ""}`}>
            {isHost ? (
              <PriceField price={build?.priceUsd} period={build?.pricePeriod} />
            ) : null}
            <NetworkSpeedField
              speed={build?.networkSpeed}
              unit={build?.networkSpeedUnit}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Hardware">
        <div className="flex flex-col gap-2">
          <Field
            label="CPU model"
            name="cpuModel"
            placeholder="e.g. AMD Ryzen 9 5950X"
            defaultValue={build?.cpuModel}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              hint="logical threads, not cores"
              defaultValue={build?.cpuThreads ?? undefined}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              placeholder="optional"
              defaultValue={build?.memoryType}
            />
            <Field
              label="RAM speed (MHz)"
              name="memorySpeedMhz"
              type="number"
              min="1"
              placeholder="e.g. 3200"
              hint="optional"
              defaultValue={build?.memorySpeedMhz ?? undefined}
            />
          </div>
          <DiskFields disks={build?.disks} />
          <SwapFields swaps={build?.swaps} />
        </div>
      </Panel>

      <Panel title="ROM build result">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field
            label="Clean build time (minutes)"
            name="buildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 120"
            required
            hint="full wall-clock build"
            defaultValue={build?.buildMinutes}
          />
          <Field
            label="Dirty build time (minutes)"
            name="dirtyBuildMinutes"
            type="number"
            min="1"
            placeholder="e.g. 25"
            hint="incremental rebuild"
            defaultValue={build?.dirtyBuildMinutes ?? undefined}
          />
        </div>
      </Panel>

      <Panel title="Kernel build" meta="optional">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-strong">
            Built a kernel on the same machine? Add its times here. Leave blank to
            skip.
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
        </div>
      </Panel>

      <Panel title="Notes">
        <FormField label="Notes" htmlFor="notes" hint="plain text">
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="ccache enabled, clean build, etc."
            defaultValue={build?.notes}
          />
        </FormField>
      </Panel>
    </div>
  );
}
