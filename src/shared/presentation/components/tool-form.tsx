"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/shared/lib/utils";

type ToolSectionProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export function ToolSection({ title, className, children }: ToolSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
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

type ToolTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ToolTextarea({ className, ...props }: ToolTextareaProps) {
  return (
    <textarea
      className={cn("w-full rounded-md border bg-background/40 p-3", className)}
      {...props}
    />
  );
}

type ToolInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function ToolInput({ className, ...props }: ToolInputProps) {
  return (
    <input
      className={cn("w-full rounded-md border bg-background/40 p-3", className)}
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

  const paddingClass = size === "sm" ? "px-2.5 py-2" : "px-3 py-3";

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
          paddingClass,
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
                "w-full px-3 py-2.5 text-left text-sm transition-colors",
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
