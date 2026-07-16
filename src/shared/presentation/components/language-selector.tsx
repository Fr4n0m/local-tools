"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { LANGUAGE_OPTIONS, type Language } from "@/shared/presentation/i18n";

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
                key={option.code}
                onClick={() => {
                  onSelect(option.code);
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
              </button>
            );
          })}
        </menu>
      ) : null}
    </div>
  );
}
