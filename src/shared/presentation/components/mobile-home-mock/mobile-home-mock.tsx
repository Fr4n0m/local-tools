"use client";

import type { ReactNode } from "react";
import NextImage from "next/image";

import styles from "./mobile-home-mock.module.css";
import {
  IPHONE_16_MAX_FRAME_SVG,
  PIXEL_9_PRO_FRAME_SVG,
} from "./telephone-frame-svgs";

const ASSET_BASE = "/assets/mobile-home-mocks";
const IPHONE_APP_ICON_BASE = `${ASSET_BASE}/icons/ios`;
const IPHONE_DARK_APP_ICON_BASE = `${IPHONE_APP_ICON_BASE}/dark`;
const ANDROID_APP_ICON_BASE = `${ASSET_BASE}/icons/android`;
const FALLBACK_APP_ICON = `${ASSET_BASE}/icons/fallback-app-icon.svg`;

const IPHONE_DECORATIVE_APPS = [
  {
    id: "messages",
    label: "Messages",
    lightSrc: `${IPHONE_APP_ICON_BASE}/imessages.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/imessages.svg`,
  },
  {
    id: "camera",
    label: "Camera",
    lightSrc: `${IPHONE_APP_ICON_BASE}/camera.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/camera.svg`,
  },
  {
    id: "safari",
    label: "Safari",
    lightSrc: `${IPHONE_APP_ICON_BASE}/safari.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/safari.svg`,
  },
  {
    id: "photos",
    label: "Photos",
    lightSrc: `${IPHONE_APP_ICON_BASE}/photos.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/photos.svg`,
  },
  {
    id: "mail",
    label: "Mail",
    lightSrc: `${IPHONE_APP_ICON_BASE}/mail.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/mail.svg`,
  },
  {
    id: "settings",
    label: "Settings",
    lightSrc: `${IPHONE_APP_ICON_BASE}/settings.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/settings.svg`,
  },
  {
    id: "calendar",
    label: "Calendar",
    lightSrc: `${IPHONE_APP_ICON_BASE}/calendar.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/calendar.svg`,
  },
  {
    id: "clock",
    label: "Clock",
    lightSrc: `${IPHONE_APP_ICON_BASE}/clock.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/clock.svg`,
  },
  {
    id: "maps",
    label: "Maps",
    lightSrc: `${IPHONE_APP_ICON_BASE}/maps.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/maps.svg`,
  },
  {
    id: "notes",
    label: "Notes",
    lightSrc: `${IPHONE_APP_ICON_BASE}/notes.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/notes.svg`,
  },
  {
    id: "weather",
    label: "Weather",
    lightSrc: `${IPHONE_APP_ICON_BASE}/weather.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/weather.svg`,
  },
  {
    id: "facetime",
    label: "FaceTime",
    lightSrc: `${IPHONE_APP_ICON_BASE}/facetime.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/facetime.svg`,
  },
  {
    id: "appStore",
    label: "App Store",
    lightSrc: `${IPHONE_APP_ICON_BASE}/app-store.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/app-store.svg`,
  },
  {
    id: "music",
    label: "Music",
    lightSrc: `${IPHONE_APP_ICON_BASE}/music.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/music.svg`,
  },
  {
    id: "phone",
    label: "Phone",
    lightSrc: `${IPHONE_APP_ICON_BASE}/phone.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/phone.svg`,
  },
] as const;

const IPHONE_HOME_APPS = IPHONE_DECORATIVE_APPS.map((app) => ({
  ...app,
  slot: app.id,
}));

const ANDROID_HOME_APPS = [
  {
    id: "messages",
    label: "Messages",
    src: `${ANDROID_APP_ICON_BASE}/messages.svg`,
  },
  {
    id: "play",
    label: "Play Store",
    src: `${ANDROID_APP_ICON_BASE}/play-store.svg`,
  },
  {
    id: "chrome",
    label: "Chrome",
    src: `${ANDROID_APP_ICON_BASE}/chrome.svg`,
  },
  {
    id: "camera",
    label: "Camera",
    src: `${ANDROID_APP_ICON_BASE}/camera.svg`,
  },
] as const;

const MOCK_APP_LABELS = {
  en: {
    appStore: "App Store",
    calendar: "Calendar",
    camera: "Camera",
    chrome: "Chrome",
    clock: "Clock",
    facetime: "FaceTime",
    mail: "Mail",
    maps: "Maps",
    messages: "Messages",
    music: "Music",
    notes: "Notes",
    phone: "Phone",
    photos: "Photos",
    play: "Play Store",
    safari: "Safari",
    settings: "Settings",
    weather: "Weather",
  },
  es: {
    appStore: "App Store",
    calendar: "Calendario",
    camera: "Cámara",
    chrome: "Chrome",
    clock: "Reloj",
    facetime: "FaceTime",
    mail: "Correo",
    maps: "Mapas",
    messages: "Mensajes",
    music: "Música",
    notes: "Notas",
    phone: "Teléfono",
    photos: "Fotos",
    play: "Play Store",
    safari: "Safari",
    settings: "Ajustes",
    weather: "Tiempo",
  },
} as const;

const IPHONE_DOCK_APPS = [
  {
    id: "phone",
    lightSrc: `${IPHONE_APP_ICON_BASE}/phone.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/phone.svg`,
  },
  {
    id: "safari",
    lightSrc: `${IPHONE_APP_ICON_BASE}/safari.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/safari.svg`,
  },
  {
    id: "messages",
    lightSrc: `${IPHONE_APP_ICON_BASE}/imessages.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/imessages.svg`,
  },
  {
    id: "mail",
    lightSrc: `${IPHONE_APP_ICON_BASE}/mail.svg`,
    darkSrc: `${IPHONE_DARK_APP_ICON_BASE}/mail.svg`,
  },
] as const;

function GoogleMark({
  className,
  multicolor = false,
}: {
  className?: string;
  multicolor?: boolean;
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
        fill={multicolor ? "#4285F4" : "currentColor"}
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={multicolor ? "#34A853" : "currentColor"}
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill={multicolor ? "#FBBC05" : "currentColor"}
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill={multicolor ? "#EA4335" : "currentColor"}
      />
    </svg>
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
      className={`${styles.telephoneFrame} ${
        isIos ? styles.telephoneFrameIphone : styles.telephoneFramePixel
      }`}
    >
      <div
        className={`${styles.telephoneScreenshot} ${
          isIos
            ? styles.telephoneScreenshotIphone
            : styles.telephoneScreenshotPixel
        }`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={styles.telephoneSvg}
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
  language,
}: {
  iconUrl: string | null;
  appLabel: string;
  dark?: boolean;
  language: "en" | "es";
}) {
  return (
    <TelephoneFrame platform="ios">
      <div
        className={`${styles.telephoneHome} ${styles.iphoneHome} ${
          dark ? styles.iphoneHomeDark : ""
        }`}
      >
        <div className={styles.iphoneWallpaper}></div>
        <div className={styles.iphoneAppGrid}>
          {IPHONE_HOME_APPS.map(({ darkSrc, id, label, lightSrc, slot }) => (
            <div className={styles.iphoneApp} key={slot}>
              <NextImage
                alt=""
                className={styles.iphoneAppImage}
                height={60}
                src={dark ? darkSrc : lightSrc}
                unoptimized
                width={60}
              />
              <span className={styles.iphoneAppLabel}>
                {MOCK_APP_LABELS[language][id] ?? label}
              </span>
            </div>
          ))}
          <div className={styles.iphoneFaviconApp}>
            <NextImage
              alt=""
              className={`${styles.iphoneFaviconImage} ${
                iconUrl ? "" : styles.iphoneFallbackImage
              }`}
              height={24}
              src={iconUrl ?? FALLBACK_APP_ICON}
              unoptimized
              width={24}
            />
            <div className={styles.iphoneAppLabel}>{appLabel}</div>
          </div>
        </div>
        <div className={styles.iphoneDock} aria-hidden>
          {IPHONE_DOCK_APPS.map(({ darkSrc, id, lightSrc }) => (
            <span className={styles.iphoneDockApp} key={`iphone-dock-${id}`}>
              <NextImage
                alt=""
                className={styles.iphoneDockImage}
                height={60}
                src={dark ? darkSrc : lightSrc}
                unoptimized
                width={60}
              />
            </span>
          ))}
        </div>
        <div className={styles.iphoneSearchPill} aria-hidden>
          <svg
            className={styles.iphoneSearchIcon}
            focusable="false"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span>{language === "es" ? "Buscar" : "Search"}</span>
        </div>
      </div>
    </TelephoneFrame>
  );
}

function AndroidPreviewMock({
  iconUrl,
  appLabel,
  dark = false,
  language,
}: {
  iconUrl: string | null;
  appLabel: string;
  dark?: boolean;
  language: "en" | "es";
}) {
  return (
    <TelephoneFrame platform="android">
      <div
        className={`${styles.telephoneHome} ${styles.androidHome} ${
          dark ? "" : styles.androidHomeLight
        }`}
      >
        <div className={styles.androidDate}>
          <span>
            {language === "es" ? "Miércoles, 7 ago" : "Wednesday, Aug 7"}
          </span>
          <span className={styles.androidWeather}>
            <i aria-hidden className={styles.androidWeatherIcon} />
            <span>21°C</span>
          </span>
        </div>
        <div className={styles.androidApps}>
          <div className={styles.androidAppSlot}>
            <div className={styles.androidAppTile}>
              <NextImage
                alt=""
                className={`${styles.androidAppImage} ${
                  iconUrl ? "" : styles.androidFallbackImage
                }`}
                height={20}
                src={iconUrl ?? FALLBACK_APP_ICON}
                unoptimized
                width={20}
              />
            </div>
            <div className={styles.androidAppLabel} title={appLabel}>
              {appLabel}
            </div>
          </div>
          {ANDROID_HOME_APPS.map(({ id, label, src }) => (
            <div className={styles.androidAppSlot} key={`android-app-${id}`}>
              <div className={styles.androidAppTile}>
                <NextImage
                  alt=""
                  className={styles.androidDecorativeImage}
                  height={20}
                  src={src}
                  unoptimized
                  width={20}
                />
              </div>
              <div className={styles.androidAppLabel}>
                {MOCK_APP_LABELS[language][id] ?? label}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.androidSearchBar}>
          <GoogleMark className={styles.androidGoogleMark} multicolor={!dark} />
          <span className={styles.androidSearchText} />
          <NextImage
            alt=""
            className={styles.androidAssistantIcon}
            height={24}
            src={`${ASSET_BASE}/icons/android/google-assistant.svg`}
            unoptimized
            width={24}
          />
        </div>
        <div className={styles.androidGesture} />
      </div>
    </TelephoneFrame>
  );
}

export type MobileHomeMockPlatform = "ios" | "android";
export type MobileHomeMockTheme = "light" | "dark";
export type MobileHomeMockLanguage = "en" | "es";

export interface MobileHomeMockProps {
  appIconUrl?: string | null;
  appName: string;
  className?: string;
  language?: MobileHomeMockLanguage;
  platform: MobileHomeMockPlatform;
  theme?: MobileHomeMockTheme;
}

export function MobileHomeMock({
  appIconUrl = null,
  appName,
  className,
  language = "en",
  platform,
  theme = "light",
}: MobileHomeMockProps) {
  const dark = theme === "dark";
  const rootClassName = [
    styles.mockViewport,
    platform === "ios" ? styles.mockViewportIos : styles.mockViewportAndroid,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      {platform === "ios" ? (
        <IPhonePreviewMock
          appLabel={appName}
          dark={dark}
          iconUrl={appIconUrl}
          language={language}
        />
      ) : (
        <AndroidPreviewMock
          appLabel={appName}
          dark={dark}
          iconUrl={appIconUrl}
          language={language}
        />
      )}
    </div>
  );
}
