"use client";

import NextImage from "next/image";
import { useMemo, useState } from "react";

import { buildQrPayloadUseCase } from "@/modules/qr-generator/application/build-qr-payload-use-case";
import type { QrType } from "@/modules/qr-generator/domain/qr-payload";
import en from "@/modules/qr-generator/presentation/i18n/en.json";
import es from "@/modules/qr-generator/presentation/i18n/es.json";
import { downloadBlob, downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolColorPicker,
  ToolInput,
  ToolSection,
  ToolSelect,
  ToolSlider,
  ToolSwitch,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function QrGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [type, setType] = useState<QrType>("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [foreground, setForeground] = useState("#111111");
  const [background, setBackground] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<
    "L" | "M" | "Q" | "H"
  >("M");
  const [error, setError] = useState("");
  const [pngDataUrl, setPngDataUrl] = useState("");
  const [svgText, setSvgText] = useState("");

  const sizeLabel = `${size}px`;

  const onGenerate = async () => {
    const payloadResult =
      type === "url"
        ? buildQrPayloadUseCase({ type, value: urlValue })
        : type === "text"
          ? buildQrPayloadUseCase({ type, value: textValue })
          : type === "email"
            ? buildQrPayloadUseCase({
                type,
                email: emailValue,
                subject: emailSubject,
                body: emailBody,
              })
            : buildQrPayloadUseCase({
                type,
                wifi: { ssid, password, encryption, hidden },
              });

    if (!payloadResult.ok) {
      setError(text.invalid);
      setPngDataUrl("");
      setSvgText("");
      return;
    }

    setError("");
    const payload = payloadResult.value;
    const QRCode = (await import("qrcode")).default;
    const [nextPng, nextSvg] = await Promise.all([
      QRCode.toDataURL(payload, {
        width: size,
        margin,
        color: { dark: foreground, light: background },
        errorCorrectionLevel,
      }),
      QRCode.toString(payload, {
        type: "svg",
        width: size,
        margin,
        color: { dark: foreground, light: background },
        errorCorrectionLevel,
      }),
    ]);
    setPngDataUrl(nextPng);
    setSvgText(nextSvg);
  };

  const onDownloadPng = () => {
    if (!pngDataUrl) {
      return;
    }
    const [prefix, content] = pngDataUrl.split(",");
    const mimeMatch = prefix.match(/data:(.*);base64/);
    const mime = mimeMatch?.[1] ?? "image/png";
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    downloadBlob(new Blob([bytes], { type: mime }), "qrcode.png");
  };

  const onDownloadSvg = () => {
    if (!svgText) {
      return;
    }
    downloadTextFile(svgText, "qrcode.svg", "image/svg+xml;charset=utf-8");
  };

  const clearAll = () => {
    setType("url");
    setUrlValue("");
    setTextValue("");
    setEmailValue("");
    setEmailSubject("");
    setEmailBody("");
    setSsid("");
    setPassword("");
    setEncryption("WPA");
    setHidden(false);
    setSize(256);
    setMargin(2);
    setForeground("#111111");
    setBackground("#ffffff");
    setErrorCorrectionLevel("M");
    setError("");
    setPngDataUrl("");
    setSvgText("");
  };

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.type}>
        <ToolSelect
          aria-label={text.type}
          options={[
            { value: "url", label: text.types.url },
            { value: "text", label: text.types.text },
            { value: "email", label: text.types.email },
            { value: "wifi", label: text.types.wifi },
          ]}
          value={type}
          onChange={(value) => setType(value as QrType)}
        />
      </ToolField>

      {type === "url" ? (
        <ToolField label={text.urlValue}>
          <ToolInput
            placeholder="https://"
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
          />
        </ToolField>
      ) : null}

      {type === "text" ? (
        <ToolField label={text.textValue}>
          <ToolInput
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
          />
        </ToolField>
      ) : null}

      {type === "email" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ToolField label={text.emailValue}>
            <ToolInput
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
            />
          </ToolField>
          <ToolField label={text.emailSubject}>
            <ToolInput
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
            />
          </ToolField>
          <ToolField className="md:col-span-2" label={text.emailBody}>
            <ToolInput
              value={emailBody}
              onChange={(event) => setEmailBody(event.target.value)}
            />
          </ToolField>
        </div>
      ) : null}

      {type === "wifi" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ToolField label={text.wifiSsid}>
            <ToolInput value={ssid} onChange={(e) => setSsid(e.target.value)} />
          </ToolField>
          <ToolField label={text.wifiPassword}>
            <ToolInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ToolField>
          <ToolField label={text.wifiEncryption}>
            <ToolSelect
              aria-label={text.wifiEncryption}
              options={[
                { value: "WPA", label: "WPA" },
                { value: "WEP", label: "WEP" },
                { value: "nopass", label: "No password" },
              ]}
              value={encryption}
              onChange={(value) =>
                setEncryption(value as "WPA" | "WEP" | "nopass")
              }
            />
          </ToolField>
          <ToolToggleField className="md:mt-7" label={text.wifiHidden}>
            <ToolSwitch checked={hidden} onChange={setHidden} />
          </ToolToggleField>
        </div>
      ) : null}

      <ToolField label={text.size}>
        <ToolSlider
          displayValue={sizeLabel}
          max={512}
          min={128}
          step={16}
          value={size}
          onChange={setSize}
        />
      </ToolField>
      <div className="grid gap-4 md:grid-cols-2">
        <ToolField label={text.foreground}>
          <ToolColorPicker value={foreground} onChange={setForeground} />
        </ToolField>
        <ToolField label={text.background}>
          <ToolColorPicker value={background} onChange={setBackground} />
        </ToolField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ToolField label={text.margin}>
          <ToolSlider
            displayValue={String(margin)}
            max={8}
            min={0}
            step={1}
            value={margin}
            onChange={setMargin}
          />
        </ToolField>
        <ToolField label={text.errorCorrection}>
          <ToolSelect
            aria-label={text.errorCorrection}
            options={[
              { value: "L", label: "L" },
              { value: "M", label: "M" },
              { value: "Q", label: "Q" },
              { value: "H", label: "H" },
            ]}
            value={errorCorrectionLevel}
            onChange={(value) =>
              setErrorCorrectionLevel(value as "L" | "M" | "Q" | "H")
            }
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => {
              void onGenerate();
            },
          },
          {
            label: text.downloadPng,
            onClick: onDownloadPng,
            disabled: !pngDataUrl,
          },
          {
            label: text.downloadSvg,
            onClick: onDownloadSvg,
            disabled: !svgText,
          },
          {
            label: sharedText.buttons.clear,
            onClick: clearAll,
            disabled:
              !urlValue &&
              !textValue &&
              !emailValue &&
              !emailSubject &&
              !emailBody &&
              !ssid &&
              !password &&
              !pngDataUrl &&
              !svgText &&
              type === "url" &&
              size === 256 &&
              margin === 2 &&
              foreground === "#111111" &&
              background === "#ffffff" &&
              errorCorrectionLevel === "M" &&
              encryption === "WPA" &&
              !hidden,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {pngDataUrl ? (
        <div className="space-y-2">
          <p className="text-sm">{text.preview}</p>
          <NextImage
            alt={text.preview}
            className="rounded-md border bg-white p-2"
            height={size}
            src={pngDataUrl}
            unoptimized
            width={size}
          />
        </div>
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </ToolSection>
  );
}
