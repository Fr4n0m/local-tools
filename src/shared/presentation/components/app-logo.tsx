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
        {/* border-only squircle */}
        <rect
          height="25"
          rx="6.5"
          stroke="currentColor"
          strokeWidth="1"
          width="25"
          x="0.5"
          y="0.5"
        />
        {/* 3 solid dots */}
        <circle cx="9.5" cy="9.5" fill="currentColor" r="2" />
        <circle cx="16.5" cy="9.5" fill="currentColor" r="2" />
        <circle cx="9.5" cy="16.5" fill="currentColor" r="2" />
        {/* 4th dot hollow */}
        <circle
          cx="16.5"
          cy="16.5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1"
        />
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
