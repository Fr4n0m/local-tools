"use client";

import { useId } from "react";
import { IconPalette, IconSettings } from "@tabler/icons-react";

import {
  clampFaviconRoundness,
  clampFaviconScale,
  FAVICON_CORNER_SHAPES,
  type FaviconCornerShape,
  type FaviconFitMode,
  type FaviconRenderSettings,
} from "@/modules/favicon-generator/domain/favicon-generator";
import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import { SegmentedControl } from "@/shared/presentation/components/segmented-control";
import {
  ToolColorPicker,
  ToolField,
  ToolSlider,
  ToolSwitch,
} from "@/shared/presentation/components/tool-form";
import { Button } from "@/shared/presentation/components/ui/button";

type FaviconText = typeof en;

const CORNER_SHAPE_PATHS: Record<FaviconCornerShape, string> = {
  square: "M5 5H35V35H5Z",
  round:
    "M15 5H25A10 10 0 0 1 35 15V25A10 10 0 0 1 25 35H15A10 10 0 0 1 5 25V15A10 10 0 0 1 15 5Z",
  squircle:
    "M15 5H25C33.2 5 35 6.8 35 15V25C35 33.2 33.2 35 25 35H15C6.8 35 5 33.2 5 25V15C5 6.8 6.8 5 15 5Z",
  bevel: "M15 5H25L35 15V25L25 35H15L5 25V15Z",
  scoop: "M15 5H25Q25 15 35 15V25Q25 25 25 35H15Q15 25 5 25V15Q15 15 15 5Z",
  notch: "M15 5H25V15H35V25H25V35H15V25H5V15H15Z",
};

const FAVICON_FIT_OPTIONS: FaviconFitMode[] = ["contain", "crop", "stretch"];

export function SettingsHeading({ id, label }: { id: string; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold" id={id}>
      <IconSettings aria-hidden className="h-4 w-4" />
      {label}
    </h3>
  );
}

function CornerShapePicker({
  label,
  labels,
  onChange,
  value,
}: {
  label: string;
  labels: FaviconText["cornerShapeOptions"];
  onChange: (shape: FaviconCornerShape) => void;
  value: FaviconCornerShape;
}) {
  const groupName = useId();

  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">{label}</legend>
      {FAVICON_CORNER_SHAPES.map((shape) => (
        <label className="group relative cursor-pointer" key={shape}>
          <input
            checked={value === shape}
            className="peer sr-only"
            name={groupName}
            onChange={() => onChange(shape)}
            type="radio"
            value={shape}
          />
          <span className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-2 py-2 text-xs font-medium text-foreground/70 shadow-[2px_2px_0_var(--surface-shadow-color)] transition-[background-color,color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:bg-[var(--tool-control-hover-bg)] peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground dark:border-white/22">
            <svg
              aria-hidden="true"
              className="h-7 w-7 fill-current"
              viewBox="0 0 40 40"
            >
              <path d={CORNER_SHAPE_PATHS[shape]} />
            </svg>
            <span>{labels[shape]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export function StyleOverrideButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button aria-pressed={active} onClick={onClick} size="sm" type="button">
      <IconPalette aria-hidden className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function RenderSettingsFields({
  compact = false,
  settings,
  showColorControls = true,
  text,
  updateSettings,
}: {
  compact?: boolean;
  settings: FaviconRenderSettings;
  showColorControls?: boolean;
  text: FaviconText;
  updateSettings: (
    update: (current: FaviconRenderSettings) => FaviconRenderSettings,
  ) => void;
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 content-start gap-3 [&>*:first-child]:col-span-2 [&>*:nth-child(2)]:col-span-2"
          : "grid content-start gap-3"
      }
    >
      <ToolField label={text.fitLabel}>
        <SegmentedControl
          aria-label={text.fitLabel}
          onChange={(fit) =>
            updateSettings((current) => ({
              ...current,
              fit: fit as FaviconFitMode,
            }))
          }
          options={FAVICON_FIT_OPTIONS.map((option) => ({
            value: option,
            label: option[0].toUpperCase() + option.slice(1),
          }))}
          value={settings.fit}
        />
      </ToolField>

      <ToolField label={text.scaleLabel}>
        <ToolSlider
          displayValue={`${Math.round(settings.scale * 100)}%`}
          max={2}
          min={0}
          onChange={(value) =>
            updateSettings((current) => ({
              ...current,
              scale: clampFaviconScale(value),
            }))
          }
          step={0.01}
          value={settings.scale}
        />
      </ToolField>

      {showColorControls ? (
        <>
          <ColorControl
            color={settings.tintColor}
            enabled={settings.tintEnabled}
            label={text.tintToggleLabel}
            onColorChange={(tintColor) =>
              updateSettings((current) => ({ ...current, tintColor }))
            }
            onEnabledChange={(tintEnabled) =>
              updateSettings((current) => ({ ...current, tintEnabled }))
            }
          />
          <ColorControl
            color={settings.backgroundColor}
            enabled={settings.backgroundEnabled}
            label={text.backgroundToggleLabel}
            onColorChange={(backgroundColor) =>
              updateSettings((current) => ({ ...current, backgroundColor }))
            }
            onEnabledChange={(backgroundEnabled) =>
              updateSettings((current) => ({ ...current, backgroundEnabled }))
            }
          />
        </>
      ) : null}

      <ToolField label={text.cornerShapeLabel}>
        <CornerShapePicker
          label={text.cornerShapeLabel}
          labels={text.cornerShapeOptions}
          onChange={(cornerShape) =>
            updateSettings((current) => ({ ...current, cornerShape }))
          }
          value={settings.cornerShape}
        />
      </ToolField>

      <ToolField label={text.roundnessLabel}>
        <ToolSlider
          disabled={settings.cornerShape === "square"}
          displayValue={`${Math.round(settings.roundness * 100)}%`}
          max={1}
          min={0}
          onChange={(value) =>
            updateSettings((current) => ({
              ...current,
              roundness: clampFaviconRoundness(value),
            }))
          }
          step={0.01}
          value={settings.roundness}
        />
        <p className="text-xs text-foreground/55">
          {settings.cornerShape === "square"
            ? text.roundnessSquareHelp
            : settings.backgroundEnabled
              ? text.roundnessWithBackgroundHelp
              : text.roundnessWithoutBackgroundHelp}
        </p>
      </ToolField>
    </div>
  );
}

function ColorControl({
  color,
  enabled,
  label,
  onColorChange,
  onEnabledChange,
}: {
  color: string;
  enabled: boolean;
  label: string;
  onColorChange: (color: string) => void;
  onEnabledChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-2 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
      <ToolSwitch
        aria-label={label}
        checked={enabled}
        onChange={onEnabledChange}
      />
      <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
        {label}
      </span>
      <ToolColorPicker
        className="w-24 shrink-0"
        compact
        disabled={!enabled}
        onChange={onColorChange}
        value={color}
      />
    </div>
  );
}
