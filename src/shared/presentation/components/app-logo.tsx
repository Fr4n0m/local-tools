import type React from "react";

export function AppLogo({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}
    >
      <svg aria-hidden fill="none" height="26" viewBox="0 0 26 26" width="26">
        <rect
          fill="currentColor"
          height="26"
          opacity="0.12"
          rx="7"
          width="26"
        />
        <circle cx="9.5" cy="9.5" fill="currentColor" r="2" />
        <circle cx="16.5" cy="9.5" fill="currentColor" r="2" />
        <circle cx="9.5" cy="16.5" fill="currentColor" r="2" />
        <circle cx="16.5" cy="16.5" fill="currentColor" opacity="0.4" r="2" />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1,
          gap: "1px",
        }}
      >
        <span
          style={{
            fontWeight: 100,
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          local
        </span>
        <span
          style={{
            fontWeight: 900,
            fontSize: "13px",
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
          }}
        >
          TOOLS
        </span>
      </div>
    </div>
  );
}
