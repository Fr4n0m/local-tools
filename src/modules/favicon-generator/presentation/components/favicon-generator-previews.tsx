"use client";

import type { CSSProperties, ReactNode } from "react";
import NextImage from "next/image";

import previewStyles from "./favicon-generator-preview.module.css";
import {
  IPHONE_16_MAX_FRAME_SVG,
  PIXEL_9_PRO_FRAME_SVG,
} from "./telephone-frame-svgs";

const IPHONE_DECORATIVE_APPS = [
  ["#a7f88f", "#41c144"],
  ["#cecdd5", "#89888d"],
  ["#1ac5fb", "#1d71f2"],
  ["#fe9b01", "#f67324"],
  ["#cb65f0", "#8628bb"],
  ["#1d71f2", "#1ac8fd"],
  ["#f3f4f6", "#94a3b8"],
] as const;

type PreviewIcon = React.ComponentType<{ className?: string }>;

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChromeToolbarIcon({
  className,
  type,
}: {
  className?: string;
  type: "back" | "forward" | "reload" | "info";
}) {
  if (type === "reload") {
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
  }

  if (type === "info") {
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
  }

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

function FaviconPreviewTab({
  label,
  iconUrl,
  variant,
}: {
  label: string;
  iconUrl: string | null;
  variant: "dark" | "light";
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={`relative flex h-8 w-[168px] max-w-[34vw] shrink-0 items-center gap-1.5 px-2.5 ${
        isDark ? "bg-[#3c4043] text-white/88" : "bg-[#eef0f2] text-black/78"
      } ${isDark ? "z-30" : "z-10"} ${previewStyles.browserTab} ${isDark ? previewStyles.browserTabCurved : ""}`}
      style={
        {
          "--browser-tab-bg": isDark ? "#3c4043" : "#eef0f2",
        } as CSSProperties
      }
    >
      <div
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center border ${
          isDark
            ? "border-white/14 bg-white text-black"
            : "border-black/10 bg-black/[0.04] text-black"
        } ${previewStyles.tabIcon}`}
      >
        {iconUrl ? (
          <NextImage
            alt=""
            className={previewStyles.tabFavicon}
            height={11}
            src={iconUrl}
            unoptimized
            width={11}
          />
        ) : (
          <div
            className={`h-2.5 w-2.5 ${isDark ? "bg-black/16" : "bg-black/14"} ${previewStyles.tabFavicon}`}
          />
        )}
      </div>
      <div
        className={`min-w-0 flex-1 truncate text-xs font-medium leading-none ${
          isDark ? "text-white/88" : "text-black/72"
        }`}
      >
        Tools | {label}
      </div>
      <div
        className={`grid h-5 w-5 shrink-0 place-items-center text-lg leading-none ${
          isDark ? "text-white/84" : "text-black/45"
        }`}
        aria-hidden
      >
        ×
      </div>
    </div>
  );
}

export function PreviewHeading({
  icon: Icon,
  label,
}: {
  icon: PreviewIcon;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-white/72">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

export function SearchPreviewCard({
  iconUrl,
  siteLabel,
  resultLabel,
  dark = false,
}: {
  iconUrl: string | null;
  siteLabel: string;
  resultLabel: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] p-4 ${
        dark ? "bg-[#121216] text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${
            dark
              ? "border-white/10 bg-white/[0.04]"
              : "border-black/10 bg-black/[0.03]"
          }`}
        >
          {iconUrl ? (
            <NextImage
              alt=""
              className="rounded-[6px]"
              height={20}
              src={iconUrl}
              unoptimized
              width={20}
            />
          ) : (
            <div
              className={`h-5 w-5 rounded-[6px] ${
                dark ? "bg-white/16" : "bg-black/12"
              }`}
            />
          )}
        </div>
        <div className="min-w-0">
          <div
            className={`truncate text-sm font-medium ${
              dark ? "text-white/82" : "text-black/82"
            }`}
          >
            {siteLabel}
          </div>
          <div
            className={`truncate text-xs ${
              dark ? "text-[#9aa0a6]" : "text-[#5f6368]"
            }`}
          >
            https://example.com
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div
          className={`text-sm font-semibold ${
            dark ? "text-[#9ec1ff]" : "text-[#1a4fd7]"
          }`}
        >
          {resultLabel}
        </div>
        <p
          className={`text-xs leading-5 ${
            dark ? "text-white/58" : "text-black/56"
          }`}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
    </div>
  );
}

function TelephoneFrame({
  children,
  platform,
}: {
  children: ReactNode;
  platform: "ios" | "android";
}) {
  const isIos = platform === "ios";

  return (
    <div
      className={`${previewStyles.telephoneFrame} ${
        isIos
          ? previewStyles.telephoneFrameIphone
          : previewStyles.telephoneFramePixel
      }`}
    >
      <div
        className={`${previewStyles.telephoneScreenshot} ${
          isIos
            ? previewStyles.telephoneScreenshotIphone
            : previewStyles.telephoneScreenshotPixel
        }`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={previewStyles.telephoneSvg}
        dangerouslySetInnerHTML={{
          __html: isIos ? IPHONE_16_MAX_FRAME_SVG : PIXEL_9_PRO_FRAME_SVG,
        }}
      />
    </div>
  );
}

function IPhonePreviewMock({
  iconUrl,
  appLabel,
  dark = false,
}: {
  iconUrl: string | null;
  appLabel: string;
  dark?: boolean;
}) {
  return (
    <TelephoneFrame platform="ios">
      <div
        className={`${previewStyles.telephoneHome} ${previewStyles.iphoneHome} ${
          dark ? previewStyles.iphoneHomeDark : ""
        }`}
      >
        <div className={previewStyles.iphoneWallpaper}>
          <div className={previewStyles.iphoneWallpaperSection} />
          <div
            className={`${previewStyles.iphoneWallpaperSection} ${previewStyles.iphoneWallpaperSectionBottom}`}
          />
        </div>
        <div className={previewStyles.iphoneAppGrid}>
          <div
            className={`${previewStyles.iphoneWidget} ${previewStyles.iphoneWeather}`}
          >
            <span>Local</span>
            <strong>24°</strong>
          </div>
          <div
            className={`${previewStyles.iphoneWidget} ${previewStyles.iphoneMap}`}
          />
          <div className={previewStyles.iphoneFaviconApp}>
            {iconUrl ? (
              <NextImage
                alt=""
                className={previewStyles.iphoneFaviconImage}
                height={24}
                src={iconUrl}
                unoptimized
                width={24}
              />
            ) : (
              <div className={previewStyles.iphoneFaviconPlaceholder} />
            )}
            <div className={previewStyles.iphoneAppLabel}>{appLabel}</div>
          </div>
          {IPHONE_DECORATIVE_APPS.map(([start, end], index) => (
            <div
              className={previewStyles.iphoneApp}
              key={`iphone-app-${index}`}
              style={
                {
                  "--app-bg-1": start,
                  "--app-bg-2": end,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className={previewStyles.phoneGestureBar} />
      </div>
    </TelephoneFrame>
  );
}

function AndroidPreviewMock({
  iconUrl,
  appLabel,
}: {
  iconUrl: string | null;
  appLabel: string;
}) {
  const ghostApps = Array.from({ length: 11 });

  return (
    <TelephoneFrame platform="android">
      <div
        className={`${previewStyles.telephoneHome} ${previewStyles.androidHome}`}
      >
        <div className={previewStyles.androidSearchBar}>
          <span className={previewStyles.androidSearchDot} />
          <span className={previewStyles.androidSearchText} />
        </div>
        <div className={previewStyles.androidApps}>
          <div className={previewStyles.androidAppSlot}>
            <div className={previewStyles.androidAppTile}>
              {iconUrl ? (
                <NextImage
                  alt=""
                  className={previewStyles.androidAppImage}
                  height={22}
                  src={iconUrl}
                  unoptimized
                  width={22}
                />
              ) : (
                <div className={previewStyles.androidAppPlaceholder} />
              )}
            </div>
            <div className={previewStyles.androidAppLabel} title={appLabel}>
              {appLabel}
            </div>
          </div>
          {ghostApps.map((_, index) => (
            <div
              className={previewStyles.androidAppSlot}
              key={`android-app-${index}`}
            >
              <div className={previewStyles.androidGhostTile} />
              <div className={previewStyles.androidLabelLine} />
            </div>
          ))}
        </div>
        <div className={previewStyles.androidGesture} />
      </div>
    </TelephoneFrame>
  );
}

export function MobilePreviewCard({
  iconUrl,
  appLabel,
  platform,
  dark = false,
}: {
  iconUrl: string | null;
  appLabel: string;
  platform: "ios" | "android";
  dark?: boolean;
}) {
  if (platform === "ios") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-white">
        <IPhonePreviewMock appLabel={appLabel} dark={dark} iconUrl={iconUrl} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[340px] items-center justify-center text-white">
      <AndroidPreviewMock appLabel={appLabel} iconUrl={iconUrl} />
    </div>
  );
}

export function BrowserPreviewMock({
  lightIconUrl,
  darkIconUrl,
  label,
}: {
  lightIconUrl: string | null;
  darkIconUrl: string | null;
  label: string;
}) {
  const tabIconUrl = darkIconUrl ?? lightIconUrl;

  return (
    <div
      className={`overflow-hidden border border-white/[0.08] bg-[#202124] shadow-[0_16px_34px_rgba(0,0,0,0.24)] ${previewStyles.browserFrame}`}
    >
      <div className="flex h-10 items-end gap-1 bg-[#202124] px-2 pt-2">
        <div
          aria-hidden
          className="mb-2.5 flex h-5 shrink-0 items-center gap-1.5 px-1"
        >
          <span
            className={`h-3 w-3 bg-[#ff5f57] ${previewStyles.browserControlDot}`}
          />
          <span
            className={`h-3 w-3 bg-[#ffbd2e] ${previewStyles.browserControlDot}`}
          />
          <span
            className={`h-3 w-3 bg-[#28c840] ${previewStyles.browserControlDot}`}
          />
        </div>
        <div className="flex min-w-0 flex-1 items-end overflow-visible">
          <FaviconPreviewTab
            iconUrl={tabIconUrl}
            label={label}
            variant="dark"
          />
          <FaviconPreviewTab
            iconUrl={lightIconUrl}
            label={label}
            variant="light"
          />
          <button
            aria-label="Nueva pestaña"
            className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center text-xl leading-none text-white/88"
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2.5 bg-[#3c4043] px-3 py-2">
        <ChromeToolbarIcon
          className="h-5 w-5 shrink-0 text-white/72"
          type="back"
        />
        <ChromeToolbarIcon
          className="h-5 w-5 shrink-0 text-white/32"
          type="forward"
        />
        <ChromeToolbarIcon
          className="h-[18px] w-[18px] shrink-0 text-white/72"
          type="reload"
        />
        <div
          className={`flex h-9 min-w-0 flex-1 items-center gap-2 border border-white/18 bg-[#3b3b3b] px-2.5 text-white ${previewStyles.addressBar}`}
        >
          <ChromeToolbarIcon
            className="h-[18px] w-[18px] shrink-0 text-white/70"
            type="info"
          />
          <GoogleMark className="h-[18px] w-[18px] shrink-0 text-white/92" />
          <span className="truncate text-sm font-medium leading-none text-white/88">
            {label.charAt(0).toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PreviewSection({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {header}
      </div>
      {children}
    </section>
  );
}

export function PreviewSubtleStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function PreviewSettingsPanel({ children }: { children: ReactNode }) {
  return <div className="p-0 lg:pl-2">{children}</div>;
}

export function PreviewSettingsField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/78">{label}</span>
      {children}
    </label>
  );
}

export const previewDarkFieldClass =
  "!h-10 !w-full !rounded-[14px] !border !border-white/14 !bg-[#101010] !px-3 !text-sm !text-white !outline-none !placeholder:text-white/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:!border-white/24";

export const previewDarkSelectClass =
  "[&>button]:!h-10 [&>button]:!rounded-[14px] [&>button]:!border-white/14 [&>button]:!bg-[#101010] [&>button]:!text-white [&>button]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&>button:focus-visible]:!border-white/24 [&_svg]:!text-white/58 [&_[role=listbox]]:!rounded-[14px] [&_[role=listbox]]:!border-white/14 [&_[role=listbox]]:!bg-[#101010] [&_[role=listbox]]:!shadow-[0_18px_38px_rgba(0,0,0,0.45)] [&_[role=option]]:!text-white/86 [&_[role=option]:hover]:!bg-white/[0.08] [&_[role=option][aria-selected=true]]:!text-white";
