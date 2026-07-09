"use client";

import type { CSSProperties, KeyboardEvent } from "react";

import { cn } from "@/shared/lib/utils";

type SegmentedControlOption<TValue extends string> = {
  value: TValue;
  label: string;
  disabled?: boolean;
};

type SegmentedControlProps<TValue extends string> = {
  "aria-label": string;
  className?: string;
  onChange: (value: TValue) => void;
  options: SegmentedControlOption<TValue>[];
  value: TValue;
};

export function SegmentedControl<TValue extends string>({
  "aria-label": ariaLabel,
  className,
  onChange,
  options,
  value,
}: SegmentedControlProps<TValue>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const enabledOptions = options.filter((option) => !option.disabled);

  function moveSelection(currentValue: TValue, direction: -1 | 1) {
    if (enabledOptions.length === 0) {
      return;
    }

    const currentIndex = enabledOptions.findIndex(
      (option) => option.value === currentValue,
    );
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + enabledOptions.length) %
          enabledOptions.length;

    onChange(enabledOptions[nextIndex].value);
  }

  function onOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentValue: TValue,
  ) {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(currentValue, -1);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(currentValue, 1);
      return;
    }

    if (event.key === "Home" && enabledOptions[0]) {
      event.preventDefault();
      onChange(enabledOptions[0].value);
      return;
    }

    if (event.key === "End" && enabledOptions[enabledOptions.length - 1]) {
      event.preventDefault();
      onChange(enabledOptions[enabledOptions.length - 1].value);
    }
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "relative grid overflow-hidden rounded-xl border bg-background/35 p-1.5",
        className,
      )}
      role="radiogroup"
      style={
        {
          "--segmented-count": options.length,
          "--segmented-index": selectedIndex,
        } as CSSProperties
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 top-1.5 rounded-lg bg-foreground shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          left: "0.375rem",
          transform: "translateX(calc(var(--segmented-index) * 100%))",
          width: "calc((100% - 0.75rem) / var(--segmented-count))",
        }}
      />
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              aria-checked={selected}
              className={cn(
                "relative z-10 min-w-0 rounded-lg px-3 py-2 text-sm font-medium transition-[color,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
                selected
                  ? "text-background"
                  : "text-foreground/68 hover:text-foreground",
              )}
              disabled={option.disabled}
              key={option.value}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => onOptionKeyDown(event, option.value)}
              role="radio"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
