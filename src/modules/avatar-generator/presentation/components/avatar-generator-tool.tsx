"use client";

import { useMemo, useRef, useState } from "react";

import {
  avatarSeedColor,
  buildAvatarSvg,
  fictitiousProfile,
  initialsFromName,
  type AvatarAge,
  type AvatarPresentation,
  type AvatarStyle,
  type AvatarShape,
  type EyeStyle,
  type HairStyle,
  type MouthStyle,
} from "@/modules/avatar-generator/domain/avatar";
import en from "@/modules/avatar-generator/presentation/i18n/en.json";
import es from "@/modules/avatar-generator/presentation/i18n/es.json";
import { downloadBlob, downloadTextFile } from "@/shared/lib/download";
import { sanitizeIntInput } from "@/shared/lib/safe-input";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolColorPicker,
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
  const [presentation, setPresentation] =
    useState<AvatarPresentation>("female");
  const [age, setAge] = useState<AvatarAge>("young");
  const profileSequence = useRef(0);
  const [style, setStyle] = useState<AvatarStyle>("portrait");
  const [shape, setShape] = useState<AvatarShape>("rounded");
  const [size, setSize] = useState(256);
  const [background, setBackground] = useState(() =>
    avatarSeedColor("Local Tools"),
  );
  const [textColor, setTextColor] = useState("#ffffff");
  const [skinColor, setSkinColor] = useState("#f2b38f");
  const [hairColor, setHairColor] = useState("#38251f");
  const [shirtColor, setShirtColor] = useState("#6857e5");
  const [hair, setHair] = useState<HairStyle>("short");
  const [eyes, setEyes] = useState<EyeStyle>("round");
  const [mouth, setMouth] = useState<MouthStyle>("smile");

  const initials = initialsFromName(name);
  const previewSvg = buildAvatarSvg({
    size,
    initials,
    background,
    textColor,
    shape,
    style,
    skinColor,
    hairColor,
    shirtColor,
    hair,
    eyes,
    mouth,
    presentation,
    age,
  });

  const previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`;

  const onRandomize = () => {
    profileSequence.current += 1;
    const profile = fictitiousProfile(
      profileSequence.current,
      presentation,
      age,
    );
    setName(profile.name);
    setHair(profile.hair);
    setEyes(profile.eyes);
    setMouth(profile.mouth);
    setBackground(
      avatarSeedColor(`${profile.name}-${profileSequence.current}`),
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-3 md:grid-cols-2">
          <ToolField label={text.presentation}>
            <ToolSelect
              onChange={(value) => setPresentation(value as AvatarPresentation)}
              options={[
                { value: "female", label: text.female },
                { value: "male", label: text.male },
              ]}
              value={presentation}
            />
          </ToolField>
          <ToolField label={text.age}>
            <ToolSelect
              onChange={(value) => setAge(value as AvatarAge)}
              options={[
                { value: "young", label: text.young },
                { value: "elderly", label: text.elderly },
              ]}
              value={age}
            />
          </ToolField>
          <ToolField label={text.nameLabel}>
            <ToolInput onChange={(e) => setName(e.target.value)} value={name} />
          </ToolField>
          <ToolField label={text.style}>
            <ToolSelect
              onChange={(value) => setStyle(value as AvatarStyle)}
              options={[
                { value: "portrait", label: text.portrait },
                { value: "initials", label: text.initials },
              ]}
              value={style}
            />
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
              onChange={(e) =>
                setSize(sanitizeIntInput(e.target.value, 256, 64, 1024))
              }
              type="number"
              value={size}
            />
          </ToolField>
          <ToolField label={text.background}>
            <ToolColorPicker onChange={setBackground} value={background} />
          </ToolField>
          <ToolField label={text.textColor}>
            <ToolColorPicker onChange={setTextColor} value={textColor} />
          </ToolField>
          {style === "portrait" ? (
            <>
              <ToolField label={text.hair}>
                <ToolSelect
                  onChange={(value) => setHair(value as HairStyle)}
                  options={[
                    { value: "short", label: text.hairShort },
                    { value: "wave", label: text.hairWave },
                    { value: "bun", label: text.hairBun },
                    { value: "none", label: text.hairNone },
                  ]}
                  value={hair}
                />
              </ToolField>
              <ToolField label={text.eyes}>
                <ToolSelect
                  onChange={(value) => setEyes(value as EyeStyle)}
                  options={[
                    { value: "round", label: text.eyesRound },
                    { value: "happy", label: text.eyesHappy },
                    { value: "wink", label: text.eyesWink },
                  ]}
                  value={eyes}
                />
              </ToolField>
              <ToolField label={text.mouth}>
                <ToolSelect
                  onChange={(value) => setMouth(value as MouthStyle)}
                  options={[
                    { value: "smile", label: text.mouthSmile },
                    { value: "neutral", label: text.mouthNeutral },
                    { value: "open", label: text.mouthOpen },
                  ]}
                  value={mouth}
                />
              </ToolField>
              <ToolField label={text.skinColor}>
                <ToolColorPicker onChange={setSkinColor} value={skinColor} />
              </ToolField>
              <ToolField label={text.hairColor}>
                <ToolColorPicker onChange={setHairColor} value={hairColor} />
              </ToolField>
              <ToolField label={text.shirtColor}>
                <ToolColorPicker onChange={setShirtColor} value={shirtColor} />
              </ToolField>
            </>
          ) : null}
        </div>

        <aside className="grid content-center justify-items-center gap-3 rounded-2xl bg-[var(--tool-control-bg)] p-6">
          <p className="text-sm font-semibold">{text.preview}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={text.preview}
            className="aspect-square w-full max-w-64 object-contain"
            fetchPriority="high"
            loading="eager"
            src={previewUrl}
          />
          <p className="max-w-full truncate text-sm text-foreground/65">
            {name}
          </p>
        </aside>
      </div>

      <ToolActions
        actions={[
          { label: text.randomize, onClick: onRandomize },
          {
            label: text.copyName,
            onClick: () => void navigator.clipboard.writeText(name),
          },
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
    </ToolSection>
  );
}
