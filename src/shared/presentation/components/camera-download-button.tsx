"use client";

import NextImage from "next/image";
import { useState } from "react";

type CameraDownloadButtonProps = {
  imageUrl: string;
  alt: string;
  onCapture: () => void;
  disabled?: boolean;
  label: string;
  className?: string;
};

export function CameraDownloadButton({
  imageUrl,
  alt,
  onCapture,
  disabled = false,
  label,
  className,
}: CameraDownloadButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isAnimating) {
      return;
    }
    setIsAnimating(true);
    onCapture();
    window.setTimeout(() => setIsAnimating(false), 900);
  };

  return (
    <button
      className={`toy-camera-wrapper ${isAnimating ? "is-capturing" : ""} ${className ?? ""}`}
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      <span className="toy-camera-body">
        <span className="toy-camera-button" />
        <span className="toy-camera-lens" />
        <span className="toy-camera-photo">
          <span className="photo-image">
            <NextImage alt={alt} fill src={imageUrl} unoptimized />
          </span>
        </span>
      </span>
      <span className="toy-camera-shadow" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
