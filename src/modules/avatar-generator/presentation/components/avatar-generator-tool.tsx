"use client";

import { useMemo, useState } from "react";

import {
  avatarSeedColor,
  buildAvatarSvg,
  initialsFromName,
  type AvatarShape,
} from "@/modules/avatar-generator/domain/avatar";
import en from "@/modules/avatar-generator/presentation/i18n/en.json";
import es from "@/modules/avatar-generator/presentation/i18n/es.json";
import { downloadBlob, downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolSection,
  ToolSelect,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function AvatarGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);

  const [name, setName] = useState("Local Tools");
  const [shape, setShape] = useState<AvatarShape>("rounded");
  const [size, setSize] = useState(256);
  const [background, setBackground] = useState(avatarSeedColor("Local Tools"));
  const [textColor, setTextColor] = useState("#ffffff");
  const [svg, setSvg] = useState("");

  const initials = initialsFromName(name);
  const previewSvg =
    svg ||
    buildAvatarSvg({
      size,
      initials,
      background,
      textColor,
      shape,
    });

  const previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`;

  const onGenerate = () => {
    setSvg(
      buildAvatarSvg({
        size,
        initials,
        background,
        textColor,
        shape,
      }),
    );
  };

  const onDownloadPng = async () => {
    const image = new Image();
    image.src = previewUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Avatar render failed"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/png"),
    );

    if (blob) downloadBlob(blob, "avatar.png");
  };

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolField label={text.nameLabel}>
          <ToolInput onChange={(e) => setName(e.target.value)} value={name} />
        </ToolField>
        <ToolField label={text.shape}>
          <ToolSelect
            onChange={(value) => {
              if (
                value === "circle" ||
                value === "rounded" ||
                value === "square"
              ) {
                setShape(value);
              }
            }}
            options={[
              { value: "circle", label: text.circle },
              { value: "rounded", label: text.rounded },
              { value: "square", label: text.square },
            ]}
            value={shape}
          />
        </ToolField>
        <ToolField label={text.size}>
          <ToolInput
            max={1024}
            min={64}
            onChange={(e) => setSize(Number(e.target.value))}
            type="number"
            value={size}
          />
        </ToolField>
        <ToolField label={text.background}>
          <ToolInput
            onChange={(e) => setBackground(e.target.value)}
            type="color"
            value={background}
          />
        </ToolField>
        <ToolField label={text.textColor}>
          <ToolInput
            onChange={(e) => setTextColor(e.target.value)}
            type="color"
            value={textColor}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          { label: text.generate, onClick: onGenerate },
          {
            label: text.downloadSvg,
            onClick: () => {
              downloadTextFile(
                previewSvg,
                "avatar.svg",
                "image/svg+xml;charset=utf-8",
              );
            },
          },
          { label: text.downloadPng, onClick: () => void onDownloadPng() },
        ]}
      />

      <div className="space-y-2">
        <p className="text-sm">{text.preview}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={text.preview}
          className="h-40 w-40 rounded-xl border bg-background/40 object-contain p-2"
          src={previewUrl}
        />
      </div>
    </ToolSection>
  );
}
