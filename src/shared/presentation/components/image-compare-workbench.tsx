"use client";

import NextImage from "next/image";
import * as React from "react";

type ImageCompareWorkbenchProps = {
  compareLabel: string;
  emptyText: string;
  originalLabel: string;
  originalUrl: string;
  resetViewLabel: string;
  resultLabel: string;
  resultUrl?: string | null;
  zoomLabel: string;
};

export function ImageCompareWorkbench({
  compareLabel,
  emptyText,
  originalLabel,
  originalUrl,
  resetViewLabel,
  resultLabel,
  resultUrl,
  zoomLabel,
}: ImageCompareWorkbenchProps) {
  const [split, setSplit] = React.useState(50);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef<{
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const imageTransform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

  const resetView = React.useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div className="space-y-3 rounded-xl border bg-background/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border bg-background/78 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/72">
          {originalLabel}
        </span>
        <span className="rounded-full border bg-background/78 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/72">
          {resultLabel}
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border bg-secondary/20"
        onPointerLeave={() => {
          dragRef.current = null;
        }}
        onPointerMove={(event) => {
          if (!dragRef.current || zoom <= 1) return;
          setOffset({
            x: dragRef.current.originX + event.clientX - dragRef.current.startX,
            y: dragRef.current.originY + event.clientY - dragRef.current.startY,
          });
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      >
        <div
          className="relative aspect-[4/3] min-h-[18rem] w-full touch-none"
          onPointerDown={(event) => {
            if (zoom <= 1) return;
            dragRef.current = {
              originX: offset.x,
              originY: offset.y,
              startX: event.clientX,
              startY: event.clientY,
            };
          }}
        >
          <NextImage
            alt={originalLabel}
            className="object-contain transition-transform duration-150 ease-out"
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            style={{ transform: imageTransform }}
            src={originalUrl}
            unoptimized
          />

          {resultUrl ? (
            <>
              <div
                aria-hidden
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${split}%` }}
              >
                <div className="relative h-full w-full min-w-full">
                  <NextImage
                    alt={resultLabel}
                    className="object-contain transition-transform duration-150 ease-out"
                    fill
                    sizes="(max-width: 768px) 100vw, 960px"
                    style={{ transform: imageTransform }}
                    src={resultUrl}
                    unoptimized
                  />
                </div>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/95 shadow-[0_0_0_1px_rgba(15,23,42,0.3),0_0_24px_rgba(255,255,255,0.55)]"
                style={{ left: `calc(${split}% - 0.5px)` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-background/88 shadow-lg"
                style={{ left: `calc(${split}% - 1.25rem)` }}
              >
                <span className="h-4 w-px bg-foreground/65" />
                <span className="mx-1 h-4 w-px bg-foreground/65" />
                <span className="h-4 w-px bg-foreground/65" />
              </div>
            </>
          ) : (
            <div className="absolute inset-x-6 bottom-6 rounded-xl border bg-background/88 px-4 py-3 text-center text-sm text-foreground/68 shadow-lg backdrop-blur">
              {emptyText}
            </div>
          )}
        </div>
      </div>

      {resultUrl ? (
        <div className="space-y-3 rounded-xl border bg-background/55 px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="block flex-1 space-y-2">
              <span className="text-sm font-medium text-foreground/85">
                {compareLabel}
              </span>
              <input
                aria-label={compareLabel}
                className="w-full"
                max={100}
                min={0}
                onChange={(event) => setSplit(Number(event.target.value))}
                type="range"
                value={split}
              />
            </label>

            <button
              className="lt-button lt-button--secondary h-9 px-3 text-sm"
              onClick={resetView}
              type="button"
            >
              {resetViewLabel}
            </button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground/85">
              {zoomLabel}
            </span>
            <input
              aria-label={zoomLabel}
              className="w-full"
              max={3}
              min={1}
              onChange={(event) => {
                const nextZoom = Number(event.target.value);
                setZoom(nextZoom);
                if (nextZoom <= 1) {
                  setOffset({ x: 0, y: 0 });
                }
              }}
              step={0.1}
              type="range"
              value={zoom}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
