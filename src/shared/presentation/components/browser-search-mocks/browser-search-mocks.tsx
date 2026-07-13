"use client";

import NextImage from "next/image";

import styles from "./browser-search-mocks.module.css";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function GoogleMark({
  className,
  colored = false,
}: {
  className?: string;
  colored?: boolean;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={colored ? "#4285f4" : "currentColor"}
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={colored ? "#34a853" : "currentColor"}
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill={colored ? "#fbbc05" : "currentColor"}
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill={colored ? "#ea4335" : "currentColor"}
      />
    </svg>
  );
}

function ToolbarIcon({
  className,
  type,
}: {
  className?: string;
  type: "back" | "forward" | "reload" | "info";
}) {
  if (type === "reload")
    return (
      <svg
        aria-hidden
        className={className}
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M20 6v5h-5" />
        <path d="M19 11a7 7 0 1 0-2.05 4.95" />
      </svg>
    );
  if (type === "info")
    return (
      <svg
        aria-hidden
        className={className}
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    );
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      {type === "back" ? (
        <>
          <path d="M15 6l-6 6 6 6" />
          <path d="M20 12H9" />
        </>
      ) : (
        <>
          <path d="M9 6l6 6-6 6" />
          <path d="M4 12h11" />
        </>
      )}
    </svg>
  );
}

function BrowserTab({
  active,
  iconUrl,
  label,
  theme,
}: {
  active?: boolean;
  iconUrl: string | null;
  label: string;
  theme: "dark" | "light";
}) {
  const dark = theme === "dark";
  return (
    <div
      className={joinClasses(
        styles.tab,
        styles.tabCurved,
        dark ? styles.tabDark : styles.tabLight,
        active ? styles.tabActive : styles.tabInactive,
      )}
    >
      <div
        className={joinClasses(
          styles.tabIcon,
          dark ? styles.tabIconDark : styles.tabIconLight,
          iconUrl ? styles.tabIconLoaded : undefined,
        )}
      >
        {iconUrl ? (
          <NextImage
            alt=""
            className={styles.tabFavicon}
            height={11}
            src={iconUrl}
            unoptimized
            width={11}
          />
        ) : (
          <span className={styles.tabFallback} />
        )}
      </div>
      <span className={styles.tabLabel}>Tools | {label}</span>
      <span aria-hidden className={styles.tabClose}>
        ×
      </span>
    </div>
  );
}

export interface BrowserPreviewMockProps {
  className?: string;
  darkIconUrl?: string | null;
  label: string;
  lightIconUrl?: string | null;
  newTabLabel?: string;
  theme?: "light" | "dark";
}

export function BrowserPreviewMock({
  className,
  darkIconUrl = null,
  label,
  lightIconUrl = null,
  newTabLabel = "New tab",
  theme = "dark",
}: BrowserPreviewMockProps) {
  const dark = theme === "dark";
  const tabIconUrl = dark
    ? (darkIconUrl ?? lightIconUrl)
    : (lightIconUrl ?? darkIconUrl);
  return (
    <div
      className={joinClasses(
        styles.browserFrame,
        dark ? styles.browserFrameDark : styles.browserFrameLight,
        className,
      )}
    >
      <div className={styles.tabStrip}>
        <div aria-hidden className={styles.windowControls}>
          <span className={joinClasses(styles.controlDot, styles.controlRed)} />
          <span
            className={joinClasses(styles.controlDot, styles.controlYellow)}
          />
          <span
            className={joinClasses(styles.controlDot, styles.controlGreen)}
          />
        </div>
        <div className={styles.tabs}>
          <BrowserTab active iconUrl={tabIconUrl} label={label} theme={theme} />
          <BrowserTab iconUrl={tabIconUrl} label={label} theme={theme} />
          <button
            aria-label={newTabLabel}
            className={styles.newTab}
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div className={styles.toolbar}>
        <ToolbarIcon className={styles.toolbarIcon} type="back" />
        <ToolbarIcon
          className={joinClasses(styles.toolbarIcon, styles.toolbarIconMuted)}
          type="forward"
        />
        <ToolbarIcon
          className={joinClasses(styles.toolbarIcon, styles.reloadIcon)}
          type="reload"
        />
        <div className={styles.addressBar}>
          <ToolbarIcon
            className={joinClasses(styles.toolbarIcon, styles.infoIcon)}
            type="info"
          />
          <GoogleMark className={styles.googleMark} colored={!dark} />
          <span className={styles.addressLabel}>
            {label.charAt(0).toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface SearchPreviewCardProps {
  className?: string;
  description?: string;
  iconUrl?: string | null;
  resultLabel: string;
  siteLabel: string;
  theme?: "light" | "dark";
  url?: string;
}

export function SearchPreviewCard({
  className,
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  iconUrl = null,
  resultLabel,
  siteLabel,
  theme = "light",
  url = "https://example.com",
}: SearchPreviewCardProps) {
  const dark = theme === "dark";
  return (
    <div
      className={joinClasses(
        styles.searchCard,
        dark ? styles.searchDark : styles.searchLight,
        className,
      )}
    >
      <div className={styles.searchIdentity}>
        <div className={styles.searchIconBox}>
          {iconUrl ? (
            <NextImage
              alt=""
              className={styles.searchIcon}
              height={20}
              src={iconUrl}
              unoptimized
              width={20}
            />
          ) : (
            <span className={styles.searchFallback} />
          )}
        </div>
        <div className={styles.searchMeta}>
          <div className={styles.siteLabel}>{siteLabel}</div>
          <div className={styles.url}>{url}</div>
        </div>
      </div>
      <div className={styles.searchResult}>
        <div className={styles.resultTitle}>{resultLabel}</div>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
