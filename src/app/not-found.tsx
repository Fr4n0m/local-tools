import Link from "next/link";
import { AppLogo } from "@/shared/presentation/components/app-logo";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <AppLogo />

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.4,
              margin: 0,
            }}
          >
            404
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              margin: 0,
              fontFamily: "var(--font-heading, system-ui, sans-serif)",
            }}
          >
            Tool not found.
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              opacity: 0.55,
              margin: "0.5rem 0 0",
              lineHeight: 1.6,
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or was moved.
            <br />
            All tools are available from the main app.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              height: "2.25rem",
              paddingInline: "1.1rem",
              borderRadius: "0.6rem",
              background: "var(--color-primary, #fff)",
              color: "var(--color-background, #000)",
              fontWeight: 700,
              fontSize: "0.82rem",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            ← Back to LocalTools
          </Link>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: -1,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: "clamp(12rem, 40vw, 28rem)",
              fontWeight: 900,
              letterSpacing: "-0.06em",
              opacity: 0.03,
              lineHeight: 1,
              userSelect: "none",
              fontFamily: "var(--font-heading, system-ui, sans-serif)",
            }}
          >
            404
          </span>
        </div>
      </div>
    </div>
  );
}
