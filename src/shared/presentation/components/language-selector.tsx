"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import type { Language } from "@/shared/presentation/i18n";

const LANGUAGE_OPTIONS = [
  {
    code: "es",
    label: "Español",
    flag: "/assets/flags/es.svg",
    available: true,
  },
  {
    code: "en",
    label: "English",
    flag: "/assets/flags/gb.svg",
    available: true,
  },
  {
    code: "fr",
    label: "Français",
    flag: "/assets/flags/fr.svg",
    available: false,
  },
  {
    code: "de",
    label: "Deutsch",
    flag: "/assets/flags/de.svg",
    available: false,
  },
  {
    code: "it",
    label: "Italiano",
    flag: "/assets/flags/it.svg",
    available: false,
  },
] as const;

type LanguageSelectorProps = {
  language: Language;
  label: string;
  onSelect: (language: Language) => void;
  variant: "aside" | "header";
};

export function LanguageSelector({
  language,
  label,
  onSelect,
  variant,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const currentOption =
    LANGUAGE_OPTIONS.find((option) => option.code === language) ??
    LANGUAGE_OPTIONS[0];
  const prefix = variant === "aside" ? "aside-language" : "header-language";

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className={`${prefix}-select`} ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className={`${prefix}-trigger${variant === "aside" ? " aside-top-control" : " lt-button lt-button--ghost page-display-control-button"}`}
        onClick={() => setIsOpen((open) => !open)}
        title={currentOption.label}
        type="button"
      >
        <Image
          alt=""
          aria-hidden="true"
          className={`${prefix}-flag`}
          height={16}
          src={currentOption.flag}
          width={16}
        />
      </button>
      {isOpen ? (
        <menu className={`${prefix}-menu`} id={menuId}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.code === language;
            return (
              <button
                aria-pressed={isActive}
                className={`${prefix}-option`}
                disabled={!option.available}
                key={option.code}
                onClick={() => {
                  if (!option.available) return;
                  onSelect(option.code as Language);
                  setIsOpen(false);
                }}
                type="button"
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className={`${prefix}-flag`}
                  height={16}
                  src={option.flag}
                  width={16}
                />
                <span>{option.label}</span>
                {!option.available ? (
                  <span className={`${prefix}-pending`}>
                    {language === "es" ? "próximamente" : "soon"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </menu>
      ) : null}
    </div>
  );
}
