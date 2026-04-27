"use client";

import * as React from "react";

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

type ToolSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function ToolSelect({ className, ...props }: ToolSelectProps) {
  return (
    <select
      className={cn("w-full rounded-md border bg-background/40 p-3", className)}
      {...props}
    />
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
