"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  IconChevronDown,
  IconFileCheck,
  IconHexagon,
  IconPlus,
  IconUpload,
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
        "flex items-center gap-2 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] p-2.5 text-sm shadow-[4px_4px_0_var(--surface-shadow-color)] transition-[border-color,box-shadow,background-color] focus-within:border-foreground/45 focus-within:shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22 dark:focus-within:border-white/38",
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

const LEGACY_RECENT_COLORS_KEY = "localtools.recent-colors";
const LEGACY_SAVED_COLORS_KEY = "localtools.saved-colors";
const RECENT_COLORS_KEY = "localtools.recent-colors:v1";
const SAVED_COLORS_KEY = "localtools.saved-colors:v1";
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

function loadColors(key: string, legacyKey?: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw && legacyKey) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        localStorage.setItem(key, legacyRaw);
        return loadColors(key);
      }
    }
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
  return loadColors(RECENT_COLORS_KEY, LEGACY_RECENT_COLORS_KEY);
}

function loadSavedColors(): string[] {
  return loadColors(SAVED_COLORS_KEY, LEGACY_SAVED_COLORS_KEY);
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
  compact?: boolean;
  disabled?: boolean;
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
  compact = false,
  disabled = false,
}: ToolColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(() => normalizeColor(value));
  const [recentColors, setRecentColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadRecentColors(),
  );
  const [savedColors, setSavedColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadSavedColors(),
  );
  const pickerOpen = open && !disabled;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = React.useState({
    left: 8,
    top: 8,
  });
  const pickerColor = React.useMemo(() => normalizeColor(value), [value]);

  React.useLayoutEffect(() => {
    if (!pickerOpen) return;

    const positionPopover = () => {
      const root = rootRef.current;
      const popover = popoverRef.current;
      if (!root || !popover) return;

      const gutter = 8;
      const gap = 8;
      const triggerRect = root.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const maxLeft = Math.max(
        gutter,
        window.innerWidth - popoverRect.width - gutter,
      );
      const left = Math.min(Math.max(triggerRect.left, gutter), maxLeft);
      const below = triggerRect.bottom + gap;
      const above = triggerRect.top - popoverRect.height - gap;
      const maxTop = Math.max(
        gutter,
        window.innerHeight - popoverRect.height - gutter,
      );
      const preferredTop =
        below + popoverRect.height <= window.innerHeight - gutter
          ? below
          : above;
      const top = Math.min(Math.max(preferredTop, gutter), maxTop);

      setPopoverPosition({ left, top });
    };

    positionPopover();
    window.addEventListener("resize", positionPopover);
    window.addEventListener("scroll", positionPopover, true);
    return () => {
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, true);
    };
  }, [pickerOpen]);

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
    if (!pickerOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const popover = popoverRef.current;
      const path = event.composedPath();
      if (
        !root ||
        (!path.includes(root) && (!popover || !path.includes(popover)))
      ) {
        setOpen(false);
        setRecentColors(saveRecentColor(pickerColor));
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pickerColor, pickerOpen]);

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
    <div
      className={cn("relative", disabled && "opacity-40", className)}
      ref={rootRef}
    >
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] text-left text-xs shadow-[4px_4px_0_var(--surface-shadow-color)] outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-foreground/45 focus-visible:shadow-[2px_2px_0_var(--surface-shadow-color)] disabled:cursor-not-allowed disabled:shadow-none dark:border-white/22 dark:focus-visible:border-white/38",
          compact
            ? "h-8 px-2 shadow-[2px_2px_0_var(--surface-shadow-color)] focus-visible:shadow-[1px_1px_0_var(--surface-shadow-color)]"
            : "h-10 px-3",
        )}
        disabled={disabled}
        onClick={() => {
          const next = !pickerOpen;
          if (next) {
            setDraft(pickerColor);
          } else {
            setRecentColors(saveRecentColor(pickerColor));
          }
          setOpen(next);
        }}
        type="button"
      >
        <span
          aria-hidden
          className={cn(
            "rounded-lg border border-border/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)] dark:border-white/24",
            compact ? "h-4 w-4" : "h-5 w-5",
          )}
          style={{ backgroundColor: value }}
        />
        <span className="font-mono">{value}</span>
      </button>

      {pickerOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="lt-surface-raised fixed z-50 max-h-[calc(100dvh-1rem)] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border border-border/70 bg-[var(--tool-control-bg)] p-3.5 shadow-none backdrop-blur dark:border-white/20"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              ref={popoverRef}
              style={popoverPosition}
            >
              <div className="grid gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-[var(--tool-control-hover-bg)] p-2 dark:border-white/16">
                  <span
                    aria-hidden
                    className="h-8 w-8 rounded-lg border border-border/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)] dark:border-white/24"
                    style={{ backgroundColor: value }}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-foreground/45">
                      Current
                    </p>
                    <p className="font-mono text-xs text-foreground/85">
                      {value}
                    </p>
                  </div>
                </div>

                <HexColorPicker
                  className="!h-40 !w-full [&_.react-colorful__hue]:!h-4 [&_.react-colorful__hue]:!rounded-full [&_.react-colorful__hue-pointer]:!h-5 [&_.react-colorful__hue-pointer]:!w-5 [&_.react-colorful__hue-pointer]:!border-2 [&_.react-colorful__saturation]:!rounded-xl [&_.react-colorful__saturation]:!border [&_.react-colorful__saturation]:!border-border/45"
                  color={pickerColor}
                  onChange={onChange}
                />
              </div>

              <input
                aria-label="Custom hex color"
                className="mt-3 w-full rounded-xl border border-border/65 bg-[var(--tool-control-bg)] px-3 py-2 font-mono text-xs outline-none transition-colors focus:border-foreground/50 dark:border-white/18 dark:focus:border-white/40"
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
              <div className="mt-3 border-t border-border/55 pt-3 dark:border-white/12">
                <div className="grid grid-cols-7 gap-2">
                  {swatchColors.map((c) => {
                    const selected =
                      c.toLowerCase() === pickerColor.toLowerCase();
                    return (
                      <button
                        aria-label={c}
                        aria-pressed={selected}
                        className={cn(
                          "h-7 w-7 rounded-full border border-border/60 shadow-[1px_1px_0_var(--surface-shadow-color)] transition-transform hover:scale-110 dark:border-white/18",
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
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border/55 bg-foreground/12 text-foreground/55 shadow-[1px_1px_0_var(--surface-shadow-color)] transition-colors hover:bg-foreground/22 dark:border-white/14"
                          key={id}
                          onClick={() =>
                            setSavedColors(toggleSavedColor(value))
                          }
                          title="Save current color"
                          type="button"
                        >
                          <IconPlus size={16} strokeWidth={2.6} />
                        </button>
                      ) : (
                        <span
                          aria-hidden
                          className="h-7 w-7 rounded-full border border-border/30 bg-foreground/8 dark:border-white/10"
                          key={id}
                        />
                      );
                    }

                    const selected =
                      c.toLowerCase() === pickerColor.toLowerCase();
                    return (
                      <div className="group/swatch relative" key={id}>
                        <button
                          aria-label={c}
                          aria-pressed={selected}
                          className={cn(
                            "h-7 w-7 rounded-full border border-border/60 shadow-[1px_1px_0_var(--surface-shadow-color)] transition-transform hover:scale-110 dark:border-white/18",
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
                          className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full border border-border/60 bg-background shadow-[1px_1px_0_var(--surface-shadow-color)] group-hover/swatch:flex dark:border-white/20"
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type ToolTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ToolTextarea({ className, ...props }: ToolTextareaProps) {
  return (
    <div className="lt-textarea-shell">
      <textarea
        {...props}
        className={cn(
          "lt-scroll-fade-mask lt-scrollbar relative z-0 w-full resize-y border-0 bg-transparent px-3 py-2 outline-none focus-visible:outline-none",
          className,
        )}
      />
    </div>
  );
}

type ToolInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function ToolInput({ className, ...props }: ToolInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border/85 bg-[var(--tool-control-bg)] px-3 py-2 text-sm shadow-[4px_4px_0_var(--surface-shadow-color)] outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-foreground/45 focus-visible:shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22 dark:focus-visible:border-white/38",
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
          "flex w-full items-center justify-between gap-2 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] text-sm shadow-[4px_4px_0_var(--surface-shadow-color)] outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-foreground/45 focus-visible:shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22 dark:focus-visible:border-white/38",
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
          className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-border/85 bg-[var(--tool-control-bg)] shadow-[var(--surface-shadow-compact),0_18px_38px_rgba(0,0,0,0.22)] dark:border-white/22"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              aria-selected={option.value === value}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors",
                index === highlighted
                  ? "bg-[var(--tool-control-active-bg)]"
                  : "hover:bg-[var(--tool-control-hover-bg)]",
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
  disabled?: boolean;
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
  disabled = false,
}: ToolSliderProps) {
  const parsed = React.useMemo(
    () => parseDisplayValue(displayValue),
    [displayValue],
  );
  const effectiveStep =
    parsed?.suffix.trim() === "%"
      ? Math.min(step, Math.abs(max - min) / 1000)
      : step;
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
    <div
      aria-disabled={disabled}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] px-3 py-2 shadow-[4px_4px_0_var(--surface-shadow-color)] transition-[border-color,box-shadow,background-color] focus-within:border-foreground/45 focus-within:shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22 dark:focus-within:border-white/38",
        disabled &&
          "cursor-not-allowed opacity-45 shadow-none focus-within:border-border/85 focus-within:shadow-none dark:focus-within:border-white/22",
        className,
      )}
    >
      <input
        aria-label={displayValue}
        className="flex-1 disabled:cursor-not-allowed"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={effectiveStep}
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
  compact?: boolean;
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
  compact = false,
  onSelectFiles,
}: ToolFileDropProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputId = React.useId();

  if (compact) {
    return (
      <div
        className={cn(
          "min-w-0 flex-1 rounded-lg",
          isDragging && "ring-2 ring-foreground ring-offset-2",
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
        <input
          accept={accept}
          aria-label={inputAriaLabel ?? label}
          className="peer sr-only"
          id={inputId}
          multiple={multiple}
          onChange={(event) =>
            onSelectFiles(Array.from(event.target.files ?? []))
          }
          type="file"
        />
        <label
          className="flex h-7 min-w-0 cursor-pointer items-center gap-1.5 rounded-md bg-[#050505] px-2.5 text-[11px] font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#202020] active:translate-y-0 active:scale-96 peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2"
          htmlFor={inputId}
        >
          <IconUpload aria-hidden className="shrink-0" size={14} />
          <span className="min-w-0 flex-1 truncate">
            {currentFileText ?? label}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative grid min-h-40 place-items-center overflow-hidden rounded-2xl border border-border/85 bg-[var(--tool-control-bg)] p-5 text-center shadow-[4px_4px_0_var(--surface-shadow-color)] transition-[border-color,background-color,transform,box-shadow] dark:border-white/22",
        isDragging
          ? "scale-[1.01] border-foreground bg-[var(--tool-control-active-bg)] shadow-[inset_0_0_0_1px_var(--color-foreground)]"
          : "hover:bg-[var(--tool-control-hover-bg)]",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onSelectFiles(Array.from(event.dataTransfer.files ?? []));
      }}
    >
      <input
        accept={accept}
        aria-label={inputAriaLabel ?? label}
        className="peer sr-only"
        id={inputId}
        multiple={multiple}
        onChange={(event) =>
          onSelectFiles(Array.from(event.target.files ?? []))
        }
        type="file"
      />
      <label
        className="grid w-full cursor-pointer place-items-center gap-2 rounded-xl outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-4 peer-focus-visible:ring-offset-background"
        htmlFor={inputId}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#050505] text-white transition-transform group-hover:-translate-y-0.5 group-hover:scale-105">
          <IconUpload aria-hidden size={22} stroke={1.8} />
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="max-w-72 text-xs leading-5 text-foreground/60">
          {dropHint}
        </span>
      </label>
      {currentFileText ? (
        <div className="mt-3 flex w-full min-w-0 items-center gap-1.5 rounded-full bg-foreground/[0.08] px-3 py-1.5 text-xs font-medium text-foreground/75">
          <IconFileCheck aria-hidden className="shrink-0" size={15} />
          <span className="min-w-0 flex-1 truncate">{currentFileText}</span>
        </div>
      ) : null}
      {extraText ? (
        <p className="mt-2 max-w-72 text-xs text-foreground/55">{extraText}</p>
      ) : null}
    </div>
  );
}
