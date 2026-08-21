import {
  DISK_TYPES,
  MEMORY_TYPES,
  NETWORK_UNITS,
  DEFAULT_NETWORK_UNIT,
  type BuildRecord,
} from "@/lib/types";

const inputClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground";

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

// Network speed is a number plus a unit, because hosts advertise ports in
// Mbit/s or Gbit/s while some people measure real throughput in MB/s.
// Rendered as one combined control so it reads as a single field.
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
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted"
        />
        <span className="my-2 w-px self-stretch bg-border" aria-hidden="true" />
        <select
          name="networkSpeedUnit"
          defaultValue={unit || DEFAULT_NETWORK_UNIT}
          className="h-full shrink-0 rounded-r-md bg-transparent pl-2 pr-3 text-sm outline-none"
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
        Port speed or measured throughput - pick the matching unit.
      </span>
    </label>
  );
}

export default function BuildFormFields({ build }: { build?: BuildRecord }) {
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
            placeholder="e.g. 21"
            defaultValue={build?.romVersion}
          />
          <Field
            label="Android version"
            name="androidVersion"
            type="number"
            min="1"
            max="100"
            placeholder="e.g. 14"
            hint="Number only."
            defaultValue={build?.androidVersion ?? undefined}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionTitle>Server &amp; hosting</SectionTitle>
        <Field
          label="Hosting provider"
          name="hostingProvider"
          placeholder="e.g. Hetzner, AWS, self-hosted"
          defaultValue={build?.hostingProvider}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Monthly price (USD)"
            name="monthlyPriceUsd"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 49.99"
            defaultValue={build?.monthlyPriceUsd ?? undefined}
          />
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
        <Field
          label="CPU cores"
          name="cpuCores"
          type="number"
          min="1"
          placeholder="16"
          defaultValue={build?.cpuCores ?? undefined}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Disk (GB)"
            name="diskGb"
            type="number"
            min="1"
            placeholder="512"
            defaultValue={build?.diskGb ?? undefined}
          />
          <SelectField
            label="Disk type"
            name="diskType"
            options={DISK_TYPES}
            placeholder="Select disk type"
            defaultValue={build?.diskType}
          />
        </div>
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
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
          />
        </label>
      </fieldset>
    </>
  );
}
