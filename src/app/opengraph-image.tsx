import { ImageResponse } from "next/og";

export const alt = "LocalTools — Free Developer Toolbox";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d0d14 0%, #111827 60%, #0d1520 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        position: "relative",
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)",
        }}
      />

      {/* Logo + name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🛠
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
          }}
        >
          LocalTools
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 30,
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: 820,
          lineHeight: 1.4,
          marginBottom: 40,
        }}
      >
        32+ free developer tools — runs 100% in your browser
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 900,
        }}
      >
        {["No uploads", "No tracking", "No account", "Open source"].map(
          (label) => (
            <div
              key={label}
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: 100,
                padding: "10px 24px",
                fontSize: 20,
                color: "#a5b4fc",
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          fontSize: 18,
          color: "#475569",
        }}
      >
        localtools.app
      </div>
    </div>,
    { ...size },
  );
}
