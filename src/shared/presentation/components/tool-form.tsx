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
    <label className={cn("block space-y-2", className)} htmlFor={htmlFor}>
      <span className="text-sm font-medium text-foreground/85">{label}</span>
      {children}
    </label>
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
    <input
      aria-label={ariaLabel}
      checked={checked}
      className={cn("lt-liquid-switch", className)}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      role="switch"
      type="checkbox"
    />
  );
}

const RECENT_COLORS_KEY = "localtools.recent-colors";
const SAVED_COLORS_KEY = "localtools.saved-colors";
const RECENT_COLORS_MAX = 10;

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
    window.dispatchEvent(
      new CustomEvent("localtools:recent-colors-change", { detail: updated }),
    );
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
    window.dispatchEvent(
      new CustomEvent("localtools:saved-colors-change", { detail: updated }),
    );
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

export function ToolColorPicker({
  value,
  onChange,
  className,
}: ToolColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [recentColors, setRecentColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadRecentColors(),
  );
  const [savedColors, setSavedColors] = React.useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadSavedColors(),
  );
  const rootRef = React.useRef<HTMLDivElement>(null);

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
    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setRecentColors(saveRecentColor(value));
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, value]);

  const savedSet = new Set(savedColors);
  const recentOnly = recentColors.filter((c) => !savedSet.has(c));

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        className="flex h-9 w-full items-center gap-2 rounded-md border bg-background/40 px-2.5 text-left text-xs"
        onClick={() =>
          setOpen((s) => {
            const next = !s;
            if (next) {
              setDraft(value);
            } else {
              setRecentColors(saveRecentColor(value));
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
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-background p-3 shadow-lg">
          <HexColorPicker color={value} onChange={onChange} />
          <input
            className="mt-2 w-full rounded-md border bg-background/40 px-2.5 py-1.5 font-mono text-xs"
            onBlur={() => onChange(normalizeHex(draft))}
            onChange={(event) => setDraft(event.target.value)}
            value={draft}
          />
          {recentOnly.length > 0 || savedColors.length > 0 ? (
            <div className="mt-2.5 border-t pt-2.5">
              <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest opacity-40">
                Recent
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[...recentOnly, ...savedColors].map((c) => {
                  const isSaved = savedSet.has(c);
                  return (
                    <div className="group/swatch relative" key={c}>
                      <button
                        aria-label={c}
                        className={`h-5 w-5 rounded-md border transition-transform hover:scale-110 ${isSaved ? "border-foreground/40 dark:border-white/50 ring-1 ring-foreground/20 dark:ring-white/20" : "border-border/60 dark:border-white/22"}`}
                        onClick={() => {
                          onChange(c);
                          setDraft(c);
                        }}
                        style={{ backgroundColor: c }}
                        title={c}
                        type="button"
                      />
                      <button
                        aria-label={
                          isSaved ? `Remove ${c} from saved` : `Save ${c}`
                        }
                        className="absolute -right-1 -top-1 hidden h-3 w-3 items-center justify-center rounded-full bg-background shadow group-hover/swatch:flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedColors(toggleSavedColor(c));
                        }}
                        style={{
                          border: "1px solid currentColor",
                          opacity: 0.7,
                        }}
                        title={isSaved ? "Remove from saved" : "Save color"}
                        type="button"
                      >
                        {isSaved ? (
                          <IconX size={6} strokeWidth={3} />
                        ) : (
                          <IconPlus size={6} strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
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
        aria-activedescendant={
          open && highlighted >= 0
            ? `${listboxId}-opt-${highlighted}`
            : undefined
        }
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

export function ToolSlider({
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  className,
}: ToolSliderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <input
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
        {displayValue}
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
