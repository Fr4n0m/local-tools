"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

type ToolDropSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  dropHint: string;
  enabled?: boolean;
  label: string;
  onSelectFiles: (files: File[]) => void;
};

function hasDraggedFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function ToolDropSurface({
  children,
  className,
  dropHint,
  enabled = true,
  label,
  onSelectFiles,
}: ToolDropSurfaceProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragDepthRef = React.useRef(0);

  React.useEffect(() => {
    if (!enabled) return;

    const onDragEnter = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDragging(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      if (!isDragging) setIsDragging(true);
    };

    const onDragLeave = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
      }
    };

    const onDrop = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDragging(false);
      onSelectFiles(Array.from(event.dataTransfer?.files ?? []));
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [enabled, isDragging, onSelectFiles]);

  return (
    <div className={cn("relative", className)}>
      {children}
      {enabled && isDragging ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-foreground/30 bg-background/82 p-6 backdrop-blur-sm">
          <div className="max-w-md space-y-2 text-center">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-foreground/72">{dropHint}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
