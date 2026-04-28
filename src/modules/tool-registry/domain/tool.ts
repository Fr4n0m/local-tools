import type { TablerIcon } from "@tabler/icons-react";
import type { ComponentType } from "react";

import type { Language } from "@/shared/presentation/i18n";

export type ToolId =
  | "image-converter"
  | "image-compressor"
  | "heic-to-jpg"
  | "svg-to-file"
  | "favicon-generator"
  | "json-formatter"
  | "contrast-checker"
  | "test-colors"
  | "color-range"
  | "base64-tool"
  | "qr-generator"
  | "url-encoder"
  | "text-transformer"
  | "placeholder-text"
  | "uuid-generator"
  | "batch-rename";

export type ToolComponentProps = {
  language: Language;
};

export type Tool = {
  id: ToolId;
  category: "files-media" | "data-encoding" | "text-code" | "advanced";
  icon: TablerIcon;
  component: ComponentType<ToolComponentProps>;
  name: Record<Language, string>;
  description: Record<Language, string>;
};
