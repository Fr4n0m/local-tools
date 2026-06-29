"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconHexagon,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { HexColorPicker } from "react-colorful";

import { cn } from "@/shared/lib/utils";
import { CountUp as CountUpInline } from "@/shared/presentation/components/count-up";

type ToolSectionProps = {
  title?: string;
  className?: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
};

export function ToolSection({
  title,
  className,
  titleIcon,
  children,
}: ToolSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title ? (
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span aria-hidden className="text-foreground/75">
            {titleIcon ?? <IconHexagon size={18} />}
          </span>
          <span>{title}</span>
        </h2>
      ) : null}
      {children}
    </div>
  );
}

type ToolFieldProps = {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export function ToolField({
  label,
  htmlFor,
  className,
  children,
}: ToolFieldProps) {
  return (
    <div className={cn("block space-y-2", className)}>
      <label
        className="text-sm font-medium text-foreground/85"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

type ToolToggleFieldProps = {
  label: string;
  className?: string;
  children: React.ReactNode;
};

export function ToolToggleField({
  label,
  className,
  children,
}: ToolToggleFieldProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background/25 p-2.5 text-sm",
        className,
      )}
    >
      {children}
      <span className="text-foreground/90">{label}</span>
    </label>
  );
}

type ToolSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
};

export function ToolSwitch({
  checked,
  onChange,
  className,
  "aria-label": ariaLabel,
  disabled = false,
}: ToolSwitchProps) {
  return (
    <label className={cn("lt-switch", className)}>
      <input
        aria-label={ariaLabel}
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        role="switch"
        type="checkbox"
      />
      <span aria-hidden className="lt-switch-slider" />
    </label>
  );
}

const RECENT_COLORS_KEY = "localtools.recent-colors";
const SAVED_COLORS_KEY = "localtools.saved-colors";
const RECENT_COLORS_MAX = 10;
const CUSTOM_COLOR_SLOTS = 10;
const CUSTOM_COLOR_SLOT_IDS = Array.from(
  { length: CUSTOM_COLOR_SLOTS },
  (_, idx) => `custom-color-slot-${idx + 1}`,
);
const DEFAULT_COLOR_SWATCHES = [
  "#ff3b3b",
  "#e348e8",
  "#9a45d6",
  "#7563ff",
  "#3b55f6",
  "#438cf5",
  "#2bc7d4",
  "#34e2ad",
  "#54df2a",
  "#b9f719",
  "#ffc414",
  "#fb9636",
  "#ffffff",
  "#8a8a8a",
];

function loadColors(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((c) => typeof c === "string")
      : [];
  } catch {
    return [];
  }
}

function loadRecentColors(): string[] {
  return loadColors(RECENT_COLORS_KEY);
}

function loadSavedColors(): string[] {
  return loadColors(SAVED_COLORS_KEY);
}

function saveRecentColor(color: string): string[] {
  const hex = color.toLowerCase();
  const existing = loadRecentColors().filter((c) => c !== hex);
  const updated = [hex, ...existing].slice(0, RECENT_COLORS_MAX);
  try {
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("localtools:recent-colors-change", { detail: updated }),
      );
    }, 0);
  } catch {}
  return updated;
}

function toggleSavedColor(color: string): string[] {
  const hex = color.toLowerCase();
  const existing = loadSavedColors();
  const updated = existing.includes(hex)
    ? existing.filter((c) => c !== hex)
    : [hex, ...existing];
  try {
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("localtools:saved-colors-change", { detail: updated }),
      );
    }, 0);
  } catch {}
  return updated;
}

type ToolColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function normalizeHex(value: string): string {
  const v = value.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(v)) {
    return "#000000";
  }
  return v.startsWith("#") ? v.toLowerCase() : `#${v.toLowerCase()}`;
}

function parseRgbColor(value: string): string | null {
  if (typeof document === "undefined") return null;

  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  document.body.appendChild(probe);

  const computed = window.getComputedStyle(probe).color;
  probe.remove();

  const match = computed.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i,
  );
  if (!match) return null;

  const [r, g, b] = match.slice(1, 4).map((channel) => Number(channel));
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeColor(value: string): string {
  return parseRgbColor(value) ?? normalizeHex(value);
}

export function ToolColorPicker({
  value,
  onChange,
  className,
}: ToolColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(() => normalizeColor(value));
  const [recentColors, setRecentColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadRecentColors(),
  );
  const [savedColors, setSavedColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadSavedColors(),
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pickerColor = React.useMemo(() => normalizeColor(value), [value]);

  React.useEffect(() => {
    const onRecent = (e: Event) =>
      setRecentColors((e as CustomEvent<string[]>).detail);
    const onSaved = (e: Event) =>
      setSavedColors((e as CustomEvent<string[]>).detail);
    window.addEventListener("localtools:recent-colors-change", onRecent);
    window.addEventListener("localtools:saved-colors-change", onSaved);
    return () => {
      window.removeEventListener("localtools:recent-colors-change", onRecent);
      window.removeEventListener("localtools:saved-colors-change", onSaved);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const path = event.composedPath();
      if (!root || !path.includes(root)) {
        setOpen(false);
        setRecentColors(saveRecentColor(pickerColor));
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, pickerColor]);

  const savedSet = new Set(savedColors);
  const recentOnly = recentColors.filter((c) => !savedSet.has(c));
  const swatchColors = Array.from(
    new Set([...recentOnly, ...DEFAULT_COLOR_SWATCHES]),
  ).slice(0, 14);
  const customSlots = CUSTOM_COLOR_SLOT_IDS.map((id, idx) => ({
    id,
    color: savedColors[idx] ? savedColors[idx] : null,
  }));
  const firstEmptySlot = customSlots.find((slot) => !slot.color)?.id;

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        className="flex h-9 w-full items-center gap-2 rounded-md border bg-background/40 px-2.5 text-left text-xs"
        onClick={() =>
          setOpen((s) => {
            const next = !s;
            if (next) {
              setDraft(pickerColor);
            } else {
              setRecentColors(saveRecentColor(pickerColor));
            }
            return next;
          })
        }
        type="button"
      >
        <span
          aria-hidden
          className="h-5 w-5 rounded-md border border-border/60 dark:border-white/22"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono">{value}</span>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border bg-background p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="grid gap-3">
            <div className="flex items-center gap-2 rounded-md border bg-background/45 p-2">
              <span
                aria-hidden
                className="h-8 w-8 rounded-md border border-border/60 dark:border-white/22"
                style={{ backgroundColor: value }}
              />
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-foreground/45">
                  Current
                </p>
                <p className="font-mono text-xs text-foreground/85">{value}</p>
              </div>
            </div>

            <HexColorPicker color={pickerColor} onChange={onChange} />
          </div>

          <input
            aria-label="Custom hex color"
            className="mt-2 w-full rounded-md border bg-background/40 px-2.5 py-1.5 font-mono text-xs"
            onBlur={() => onChange(normalizeHex(draft))}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onChange(normalizeHex(draft));
                setOpen(false);
                setRecentColors(saveRecentColor(normalizeHex(draft)));
              }
            }}
            value={draft}
          />
          <div className="mt-3 border-t pt-3">
            <div className="grid grid-cols-7 gap-2">
              {swatchColors.map((c) => {
                const selected = c.toLowerCase() === pickerColor.toLowerCase();
                return (
                  <button
                    aria-label={c}
                    aria-pressed={selected}
                    className={cn(
                      "h-7 w-7 rounded-full border border-border/50 transition-transform hover:scale-110",
                      selected &&
                        "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                    key={c}
                    onClick={() => {
                      onChange(c);
                      setDraft(c);
                    }}
                    style={{ backgroundColor: c }}
                    title={c}
                    type="button"
                  />
                );
              })}
            </div>

            <p className="mt-3 text-xs font-medium text-foreground/50">
              Custom colors
            </p>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {customSlots.map(({ color: c, id }) => {
                if (!c) {
                  return id === firstEmptySlot ? (
                    <button
                      aria-label="Save current color"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/15 text-foreground/55 transition-colors hover:bg-foreground/24"
                      key={id}
                      onClick={() => setSavedColors(toggleSavedColor(value))}
                      title="Save current color"
                      type="button"
                    >
                      <IconPlus size={16} strokeWidth={2.6} />
                    </button>
                  ) : (
                    <span
                      aria-hidden
                      className="h-7 w-7 rounded-full bg-foreground/8"
                      key={id}
                    />
                  );
                }

                const selected = c.toLowerCase() === pickerColor.toLowerCase();
                return (
                  <div className="group/swatch relative" key={id}>
                    <button
                      aria-label={c}
                      aria-pressed={selected}
                      className={cn(
                        "h-7 w-7 rounded-full border border-border/50 transition-transform hover:scale-110",
                        selected &&
                          "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                      )}
                      onClick={() => {
                        onChange(c);
                        setDraft(c);
                      }}
                      style={{ backgroundColor: c }}
                      title={c}
                      type="button"
                    />
                    <button
                      aria-label={`Remove ${c} from custom colors`}
                      className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full border bg-background shadow group-hover/swatch:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSavedColors(toggleSavedColor(c));
                      }}
                      title="Remove custom color"
                      type="button"
                    >
                      <IconX size={8} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ToolTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ToolTextarea({ className, ...props }: ToolTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border bg-background/40 px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

type ToolInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function ToolInput({ className, ...props }: ToolInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border bg-background/40 px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

export type ToolSelectOption = { value: string; label: string };

type ToolSelectProps = {
  value: string;
  options: ToolSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
};

export function ToolSelect({
  value,
  options,
  onChange,
  className,
  size = "md",
  "aria-label": ariaLabel,
}: ToolSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = options[selectedIndex] ?? options[0];

  React.useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const openDropdown = () => {
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const closeDropdown = () => {
    setHighlighted(-1);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      closeDropdown();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlighted(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlighted(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlighted >= 0) {
        onChange(options[highlighted].value);
        closeDropdown();
      }
    }
  };

  const sizeClass = size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3";

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-background/40 text-sm",
          sizeClass,
        )}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={onKeyDown}
        type="button"
      >
        <span>{selectedOption?.label}</span>
        <IconChevronDown
          aria-hidden
          className={cn(
            "shrink-0 text-foreground/60 transition-transform duration-150",
            open && "rotate-180",
          )}
          size={14}
        />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-lg"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              aria-selected={option.value === value}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors",
                index === highlighted
                  ? "bg-secondary/60"
                  : "hover:bg-secondary/30",
                option.value === value
                  ? "font-medium text-primary"
                  : "text-foreground",
              )}
              id={`${listboxId}-opt-${index}`}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlighted(index)}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ToolSliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
  className?: string;
};

function parseDisplayValue(
  display: string,
): { num: number; suffix: string; decimals: number } | null {
  const match = display.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const raw = match[1];
  const suffix = match[2] ?? "";
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { num: parseFloat(raw), suffix, decimals };
}

export function ToolSlider({
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  className,
}: ToolSliderProps) {
  const parsed = React.useMemo(
    () => parseDisplayValue(displayValue),
    [displayValue],
  );
  const [anim, dispatchAnim] = React.useReducer(
    (state: { from: number; to: number }, to: number) => ({
      from: state.to,
      to,
    }),
    { from: parsed?.num ?? 0, to: parsed?.num ?? 0 },
  );

  React.useEffect(() => {
    if (parsed) dispatchAnim(parsed.num);
  }, [parsed]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <input
        aria-label={displayValue}
        className="flex-1"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <span
        aria-live="polite"
        className="w-10 shrink-0 text-right text-sm tabular-nums text-foreground/70"
        role="status"
      >
        {parsed ? (
          <CountUpInline
            decimals={parsed.decimals}
            from={anim.from}
            suffix={parsed.suffix}
            to={anim.to}
          />
        ) : (
          <span className="num-tick" key={displayValue}>
            {displayValue}
          </span>
        )}
      </span>
    </div>
  );
}

type ToolOutputBlockProps = {
  label: string;
  value: string;
  className?: string;
};

export function ToolOutputBlock({
  label,
  value,
  className,
}: ToolOutputBlockProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm">{label}</p>
      <ToolTextarea className="h-44" readOnly value={value} />
    </div>
  );
}

type ToolFileDropProps = {
  label: string;
  accept: string;
  multiple?: boolean;
  dropHint: string;
  inputAriaLabel?: string;
  currentFileText?: string | null;
  extraText?: string | null;
  onSelectFiles: (files: File[]) => void;
};

export function ToolFileDrop({
  label,
  accept,
  multiple = false,
  dropHint,
  inputAriaLabel,
  currentFileText,
  extraText,
  onSelectFiles,
}: ToolFileDropProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <ToolField label={label}>
      <div
        className={cn(
          "rounded-md border p-3",
          isDragging ? "bg-secondary/40" : "bg-background/50",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onSelectFiles(Array.from(event.dataTransfer.files ?? []));
        }}
      >
        <ToolInput
          accept={accept}
          aria-label={inputAriaLabel ?? label}
          className="bg-background/60"
          multiple={multiple}
          onChange={(event) =>
            onSelectFiles(Array.from(event.target.files ?? []))
          }
          type="file"
        />
        <p className="mt-2 text-xs">{dropHint}</p>
        {currentFileText ? (
          <p className="mt-1 text-xs">{currentFileText}</p>
        ) : null}
        {extraText ? <p className="mt-1 text-xs">{extraText}</p> : null}
      </div>
    </ToolField>
  );
}
