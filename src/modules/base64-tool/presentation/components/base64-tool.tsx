"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { base64UseCase } from "@/modules/base64-tool/application/base64-use-case";
import en from "@/modules/base64-tool/presentation/i18n/en.json";
import es from "@/modules/base64-tool/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolOutputBlock,
  ToolSection,
  ToolInput,
  ToolSelect,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function Base64Tool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("standard");
  const [status, setStatus] = useState("");
  const [mimeType, setMimeType] = useState("text/plain");
  const [currentFileName, setCurrentFileName] = useState("");

  const previewUrl = useMemo(() => {
    const dataResult = base64UseCase.parseDataUrl(output);
    if (dataResult.ok) {
      return dataResult.mimeType.startsWith("image/") ? output : null;
    }
    if (mode === "standard" || mode === "url") {
      const base64 =
        mode === "url" ? base64UseCase.normalizeUrl(output) : output;
      return mimeType.startsWith("image/")
        ? base64UseCase.toDataUrl(base64, mimeType)
        : null;
    }
    return null;
  }, [output, mode, mimeType]);

  const onEncode = () => {
    if (mode === "data-url") {
      setOutput(base64UseCase.toDataUrl(base64UseCase.encode(input), mimeType));
    } else if (mode === "url") {
      setOutput(base64UseCase.encodeUrl(input));
    } else {
      setOutput(base64UseCase.encode(input));
    }
    setStatus("");
  };

  const onDecode = () => {
    if (mode === "data-url") {
      const parsed = base64UseCase.parseDataUrl(input);
      if (!parsed.ok) {
        setOutput(text.error);
        setStatus(text.invalid);
        return;
      }
      setMimeType(parsed.mimeType);
      const result = base64UseCase.decode(parsed.base64);
      setOutput(result.ok ? result.value : text.error);
      setStatus(result.ok ? text.valid : text.invalid);
      return;
    }

    const result =
      mode === "url"
        ? base64UseCase.decodeUrl(input)
        : base64UseCase.decode(input);
    setOutput(result.ok ? result.value : text.error);
    setStatus(result.ok ? text.valid : text.invalid);
  };

  const onValidate = () => {
    const isValid =
      mode === "url"
        ? base64UseCase.isValidUrl(input)
        : mode === "data-url"
          ? base64UseCase.parseDataUrl(input).ok
          : base64UseCase.isValid(input);
    setStatus(isValid ? text.valid : text.invalid);
  };

  const onNormalize = () => {
    if (mode === "url") {
      setOutput(base64UseCase.normalizeUrl(input));
    } else if (mode === "data-url") {
      const parsed = base64UseCase.parseDataUrl(input);
      setOutput(
        parsed.ok
          ? base64UseCase.toDataUrl(parsed.base64, parsed.mimeType)
          : text.error,
      );
    } else {
      setOutput(base64UseCase.normalize(input));
    }
    setStatus("");
  };

  const onSelectFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCurrentFileName(file.name);
    setMimeType(file.type || "application/octet-stream");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const parsed = base64UseCase.parseDataUrl(dataUrl);
    setInput(mode === "data-url" ? dataUrl : parsed.ok ? parsed.base64 : "");
  };

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          className="h-44"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </ToolField>
      <ToolField label={text.mode}>
        <ToolSelect
          options={[
            { value: "standard", label: text.modeStandard },
            { value: "url", label: text.modeUrl },
            { value: "data-url", label: text.modeDataUrl },
          ]}
          value={mode}
          onChange={setMode}
        />
      </ToolField>
      <ToolField label={text.mimeType}>
        <ToolInput
          value={mimeType}
          onChange={(event) => setMimeType(event.target.value)}
        />
      </ToolField>
      <ToolFileDrop
        accept="*/*"
        currentFileText={
          currentFileName
            ? text.currentFile.replace("{name}", currentFileName)
            : null
        }
        dropHint={text.dropHint}
        label={text.dropLabel}
        onSelectFiles={(files) => {
          void onSelectFiles(files);
        }}
      />
      <ToolActions
        actions={[
          {
            label: text.encode,
            onClick: onEncode,
            disabled: input.trim().length === 0,
          },
          {
            label: text.decode,
            onClick: onDecode,
            disabled: input.trim().length === 0,
          },
          {
            label: text.normalize,
            onClick: onNormalize,
            disabled: input.trim().length === 0,
          },
          {
            label: text.validate,
            onClick: onValidate,
            disabled: input.trim().length === 0,
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: output.trim().length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setInput("");
              setOutput("");
              setStatus("");
              setCurrentFileName("");
              setMode("standard");
              setMimeType("text/plain");
            },
            disabled:
              input.length === 0 &&
              output.length === 0 &&
              status.length === 0 &&
              currentFileName.length === 0 &&
              mode === "standard" &&
              mimeType === "text/plain",
          },
        ]}
      />
      {status ? <p className="text-sm text-foreground/75">{status}</p> : null}
      <ToolOutputBlock className="pt-1" label={text.output} value={output} />
      {previewUrl ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/85">Preview</p>
          <div className="relative h-56 overflow-hidden rounded-md border bg-background/30 p-2">
            <Image
              alt="Base64 preview"
              className="object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              src={previewUrl}
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </ToolSection>
  );
}
