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
  const [dropState, dispatchDropState] = React.useReducer(
    (
      state: { dragDepth: number; isDragging: boolean },
      action:
        | { type: "drag-enter" }
        | { type: "drag-over" }
        | { type: "drag-leave" }
        | { type: "drop" },
    ) => {
      switch (action.type) {
        case "drag-enter": {
          return {
            dragDepth: state.dragDepth + 1,
            isDragging: true,
          };
        }
        case "drag-over": {
          if (state.isDragging) {
            return state;
          }
          return {
            dragDepth: state.dragDepth,
            isDragging: true,
          };
        }
        case "drag-leave": {
          const nextDepth = Math.max(0, state.dragDepth - 1);
          return {
            dragDepth: nextDepth,
            isDragging: nextDepth > 0,
          };
        }
        case "drop": {
          return {
            dragDepth: 0,
            isDragging: false,
          };
        }
      }
    },
    { dragDepth: 0, isDragging: false },
  );
  const dragDepthRef = React.useRef(0);
  const selectFilesRef = React.useRef(onSelectFiles);

  React.useEffect(() => {
    selectFilesRef.current = onSelectFiles;
  }, [onSelectFiles]);

  React.useEffect(() => {
    if (!enabled) return;

    const onDragEnter = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      dispatchDropState({ type: "drag-enter" });
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dispatchDropState({ type: "drag-over" });
    };

    const onDragLeave = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      dispatchDropState({ type: "drag-leave" });
    };

    const onDrop = (event: DragEvent) => {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      dispatchDropState({ type: "drop" });
      selectFilesRef.current(Array.from(event.dataTransfer?.files ?? []));
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
  }, [enabled]);

  return (
    <div className={cn("relative", className)}>
      <div className="space-y-4">{children}</div>
      {enabled && dropState.isDragging ? (
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
