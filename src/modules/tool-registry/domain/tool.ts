import type { TablerIcon } from "@tabler/icons-react";
import type { ComponentType } from "react";

import type { Language } from "@/shared/presentation/i18n";

export type ToolId =
  | "image-converter"
  | "favicon-generator"
  | "json-formatter"
  | "base64-tool"
  | "qr-generator"
  | "url-encoder"
  | "text-transformer"
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
