"use client";

import NextImage from "next/image";
import { useState } from "react";

type CameraDownloadButtonProps = {
  imageUrl?: string;
  imageAlt: string;
  resultKey?: string;
  onConvert: () => void;
  onDownload: () => void;
  disabled?: boolean;
  busy?: boolean;
  convertLabel: string;
  downloadLabel: string;
  className?: string;
};

export function CameraDownloadButton({
  imageUrl,
  imageAlt,
  resultKey,
  onConvert,
  onDownload,
  disabled = false,
  busy = false,
  convertLabel,
  downloadLabel,
  className,
}: CameraDownloadButtonProps) {
  const [downloadedResultKey, setDownloadedResultKey] = useState<string>();
  const [captureFlashKey, setCaptureFlashKey] = useState<number | null>(null);
  const downloaded = Boolean(resultKey && downloadedResultKey === resultKey);

  return (
    <div
      className={`toy-camera-wrapper ${imageUrl ? "has-result" : ""} ${className ?? ""}`}
      data-result-key={resultKey}
    >
      <button
        aria-busy={busy}
        aria-label={convertLabel}
        className="toy-camera-trigger"
        disabled={disabled || busy}
        onClick={() => {
          setCaptureFlashKey((value) => (value ?? 0) + 1);
          onConvert();
        }}
        type="button"
      >
        <span className="toy-camera-body">
          <span className="toy-camera-button" />
          <span className="toy-camera-lens">
            {captureFlashKey !== null ? (
              <span
                key={captureFlashKey}
                aria-hidden="true"
                className="toy-camera-flash"
              />
            ) : null}
          </span>
        </span>
        <span className="toy-camera-shadow" />
      </button>
      {imageUrl ? (
        <button
          aria-label={downloadLabel}
          className={`toy-camera-photo ${downloaded ? "is-downloaded" : "is-awaiting-download"}`}
          key={resultKey}
          onClick={() => {
            setDownloadedResultKey(resultKey);
            onDownload();
          }}
          type="button"
        >
          <span className="toy-camera-card">
            <span className="photo-image">
              <NextImage alt={imageAlt} fill src={imageUrl} unoptimized />
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
