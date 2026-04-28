import {
  IconBrackets,
  IconColorSwatch,
  IconContrast2,
  IconFileTypePng,
  IconForms,
  IconLanguage,
  IconLink,
  IconPhoto,
  IconQrcode,
  IconTextPlus,
  IconVectorSpline,
  IconRegex,
  IconVariable,
} from "@tabler/icons-react";

import { Base64Tool } from "@/modules/base64-tool/presentation/components/base64-tool";
import base64En from "@/modules/base64-tool/presentation/i18n/en.json";
import base64Es from "@/modules/base64-tool/presentation/i18n/es.json";
import { BatchRenameTool } from "@/modules/batch-rename/presentation/components/batch-rename-tool";
import batchEn from "@/modules/batch-rename/presentation/i18n/en.json";
import batchEs from "@/modules/batch-rename/presentation/i18n/es.json";
import { FaviconGeneratorTool } from "@/modules/favicon-generator/presentation/components/favicon-generator-tool";
import faviconEn from "@/modules/favicon-generator/presentation/i18n/en.json";
import faviconEs from "@/modules/favicon-generator/presentation/i18n/es.json";
import { HeicToJpgTool } from "@/modules/heic-to-jpg/presentation/components/heic-to-jpg-tool";
import heicEn from "@/modules/heic-to-jpg/presentation/i18n/en.json";
import heicEs from "@/modules/heic-to-jpg/presentation/i18n/es.json";
import { SvgToFileTool } from "@/modules/svg-to-file/presentation/components/svg-to-file-tool";
import svgEn from "@/modules/svg-to-file/presentation/i18n/en.json";
import svgEs from "@/modules/svg-to-file/presentation/i18n/es.json";
import { ContrastCheckerTool } from "@/modules/contrast-checker/presentation/components/contrast-checker-tool";
import contrastEn from "@/modules/contrast-checker/presentation/i18n/en.json";
import contrastEs from "@/modules/contrast-checker/presentation/i18n/es.json";
import { ColorRangeTool } from "@/modules/color-range/presentation/components/color-range-tool";
import colorRangeEn from "@/modules/color-range/presentation/i18n/en.json";
import colorRangeEs from "@/modules/color-range/presentation/i18n/es.json";
import { ImageCompressorTool } from "@/modules/image-compressor/presentation/components/image-compressor-tool";
import imageCompressorEn from "@/modules/image-compressor/presentation/i18n/en.json";
import imageCompressorEs from "@/modules/image-compressor/presentation/i18n/es.json";
import { ImageConverterTool } from "@/modules/image-converter/presentation/components/image-converter-tool";
import imageEn from "@/modules/image-converter/presentation/i18n/en.json";
import imageEs from "@/modules/image-converter/presentation/i18n/es.json";
import { JsonFormatterTool } from "@/modules/json-formatter/presentation/components/json-formatter-tool";
import jsonEn from "@/modules/json-formatter/presentation/i18n/en.json";
import jsonEs from "@/modules/json-formatter/presentation/i18n/es.json";
import { TextTransformerTool } from "@/modules/text-transformer/presentation/components/text-transformer-tool";
import textEn from "@/modules/text-transformer/presentation/i18n/en.json";
import textEs from "@/modules/text-transformer/presentation/i18n/es.json";
import { PlaceholderTextTool } from "@/modules/placeholder-text/presentation/components/placeholder-text-tool";
import placeholderEn from "@/modules/placeholder-text/presentation/i18n/en.json";
import placeholderEs from "@/modules/placeholder-text/presentation/i18n/es.json";
import type { Tool } from "@/modules/tool-registry/domain/tool";
import { QrGeneratorTool } from "@/modules/qr-generator/presentation/components/qr-generator-tool";
import qrEn from "@/modules/qr-generator/presentation/i18n/en.json";
import qrEs from "@/modules/qr-generator/presentation/i18n/es.json";
import { UrlEncoderTool } from "@/modules/url-encoder/presentation/components/url-encoder-tool";
import urlEn from "@/modules/url-encoder/presentation/i18n/en.json";
import urlEs from "@/modules/url-encoder/presentation/i18n/es.json";
import { UuidGeneratorTool } from "@/modules/uuid-generator/presentation/components/uuid-generator-tool";
import uuidEn from "@/modules/uuid-generator/presentation/i18n/en.json";
import uuidEs from "@/modules/uuid-generator/presentation/i18n/es.json";

export const tools: Tool[] = [
  {
    id: "image-converter",
    category: "files-media",
    icon: IconPhoto,
    component: ImageConverterTool,
    name: { en: imageEn.name, es: imageEs.name },
    description: { en: imageEn.description, es: imageEs.description },
  },
  {
    id: "image-compressor",
    category: "files-media",
    icon: IconPhoto,
    component: ImageCompressorTool,
    name: { en: imageCompressorEn.name, es: imageCompressorEs.name },
    description: {
      en: imageCompressorEn.description,
      es: imageCompressorEs.description,
    },
  },
  {
    id: "heic-to-jpg",
    category: "files-media",
    icon: IconPhoto,
    component: HeicToJpgTool,
    name: { en: heicEn.name, es: heicEs.name },
    description: { en: heicEn.description, es: heicEs.description },
  },
  {
    id: "favicon-generator",
    category: "files-media",
    icon: IconFileTypePng,
    component: FaviconGeneratorTool,
    name: { en: faviconEn.name, es: faviconEs.name },
    description: { en: faviconEn.description, es: faviconEs.description },
  },
  {
    id: "svg-to-file",
    category: "files-media",
    icon: IconVectorSpline,
    component: SvgToFileTool,
    name: { en: svgEn.name, es: svgEs.name },
    description: { en: svgEn.description, es: svgEs.description },
  },
  {
    id: "json-formatter",
    category: "data-encoding",
    icon: IconBrackets,
    component: JsonFormatterTool,
    name: { en: jsonEn.name, es: jsonEs.name },
    description: { en: jsonEn.description, es: jsonEs.description },
  },
  {
    id: "contrast-checker",
    category: "data-encoding",
    icon: IconContrast2,
    component: ContrastCheckerTool,
    name: { en: contrastEn.name, es: contrastEs.name },
    description: { en: contrastEn.description, es: contrastEs.description },
  },
  {
    id: "color-range",
    category: "data-encoding",
    icon: IconColorSwatch,
    component: ColorRangeTool,
    name: { en: colorRangeEn.name, es: colorRangeEs.name },
    description: {
      en: colorRangeEn.description,
      es: colorRangeEs.description,
    },
  },
  {
    id: "base64-tool",
    category: "data-encoding",
    icon: IconForms,
    component: Base64Tool,
    name: { en: base64En.name, es: base64Es.name },
    description: { en: base64En.description, es: base64Es.description },
  },
  {
    id: "qr-generator",
    category: "data-encoding",
    icon: IconQrcode,
    component: QrGeneratorTool,
    name: { en: qrEn.name, es: qrEs.name },
    description: { en: qrEn.description, es: qrEs.description },
  },
  {
    id: "url-encoder",
    category: "data-encoding",
    icon: IconLink,
    component: UrlEncoderTool,
    name: { en: urlEn.name, es: urlEs.name },
    description: { en: urlEn.description, es: urlEs.description },
  },
  {
    id: "text-transformer",
    category: "text-code",
    icon: IconLanguage,
    component: TextTransformerTool,
    name: { en: textEn.name, es: textEs.name },
    description: { en: textEn.description, es: textEs.description },
  },
  {
    id: "placeholder-text",
    category: "text-code",
    icon: IconTextPlus,
    component: PlaceholderTextTool,
    name: { en: placeholderEn.name, es: placeholderEs.name },
    description: {
      en: placeholderEn.description,
      es: placeholderEs.description,
    },
  },
  {
    id: "uuid-generator",
    category: "text-code",
    icon: IconVariable,
    component: UuidGeneratorTool,
    name: { en: uuidEn.name, es: uuidEs.name },
    description: { en: uuidEn.description, es: uuidEs.description },
  },
  {
    id: "batch-rename",
    category: "advanced",
    icon: IconRegex,
    component: BatchRenameTool,
    name: { en: batchEn.name, es: batchEs.name },
    description: { en: batchEn.description, es: batchEs.description },
  },
];
