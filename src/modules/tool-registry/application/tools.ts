import {
  IconBrackets,
  IconColorSwatch,
  IconContrast2,
  IconClockHour4,
  IconFileTypePng,
  IconFileTypePdf,
  IconForms,
  IconFileText,
  IconLanguage,
  IconLink,
  IconPhoto,
  IconQrcode,
  IconTextPlus,
  IconPalette,
  IconVectorSpline,
  IconRegex,
  IconVariable,
} from "@tabler/icons-react";

import { Base64Tool } from "@/modules/base64-tool/presentation/components/base64-tool";
import base64En from "@/modules/base64-tool/presentation/i18n/en.json";
import base64Es from "@/modules/base64-tool/presentation/i18n/es.json";
import { AvatarGeneratorTool } from "@/modules/avatar-generator/presentation/components/avatar-generator-tool";
import avatarEn from "@/modules/avatar-generator/presentation/i18n/en.json";
import avatarEs from "@/modules/avatar-generator/presentation/i18n/es.json";
import { BatchRenameTool } from "@/modules/batch-rename/presentation/components/batch-rename-tool";
import batchEn from "@/modules/batch-rename/presentation/i18n/en.json";
import batchEs from "@/modules/batch-rename/presentation/i18n/es.json";
import { CarouselGeneratorTool } from "@/modules/carousel-generator/presentation/components/carousel-generator-tool";
import carouselEn from "@/modules/carousel-generator/presentation/i18n/en.json";
import carouselEs from "@/modules/carousel-generator/presentation/i18n/es.json";
import { ChordExplorerTool } from "@/modules/chord-explorer/presentation/components/chord-explorer-tool";
import chordEn from "@/modules/chord-explorer/presentation/i18n/en.json";
import chordEs from "@/modules/chord-explorer/presentation/i18n/es.json";
import { FaviconGeneratorTool } from "@/modules/favicon-generator/presentation/components/favicon-generator-tool";
import faviconEn from "@/modules/favicon-generator/presentation/i18n/en.json";
import faviconEs from "@/modules/favicon-generator/presentation/i18n/es.json";
import { FetchColorsTool } from "@/modules/fetch-colors/presentation/components/fetch-colors-tool";
import fetchColorsEn from "@/modules/fetch-colors/presentation/i18n/en.json";
import fetchColorsEs from "@/modules/fetch-colors/presentation/i18n/es.json";
import { FocusReaderTool } from "@/modules/focus-reader/presentation/components/focus-reader-tool";
import focusEn from "@/modules/focus-reader/presentation/i18n/en.json";
import focusEs from "@/modules/focus-reader/presentation/i18n/es.json";
import { HeicToJpgTool } from "@/modules/heic-to-jpg/presentation/components/heic-to-jpg-tool";
import heicEn from "@/modules/heic-to-jpg/presentation/i18n/en.json";
import heicEs from "@/modules/heic-to-jpg/presentation/i18n/es.json";
import { PdfToImagesTool } from "@/modules/pdf-to-images/presentation/components/pdf-to-images-tool";
import pdfEn from "@/modules/pdf-to-images/presentation/i18n/en.json";
import pdfEs from "@/modules/pdf-to-images/presentation/i18n/es.json";
import { PdfCompressorTool } from "@/modules/pdf-compressor/presentation/components/pdf-compressor-tool";
import pdfCompressorEn from "@/modules/pdf-compressor/presentation/i18n/en.json";
import pdfCompressorEs from "@/modules/pdf-compressor/presentation/i18n/es.json";
import { VideoCompressorTool } from "@/modules/video-compressor/presentation/components/video-compressor-tool";
import videoCompressorEn from "@/modules/video-compressor/presentation/i18n/en.json";
import videoCompressorEs from "@/modules/video-compressor/presentation/i18n/es.json";
import { SvgToFileTool } from "@/modules/svg-to-file/presentation/components/svg-to-file-tool";
import svgEn from "@/modules/svg-to-file/presentation/i18n/en.json";
import svgEs from "@/modules/svg-to-file/presentation/i18n/es.json";
import { ContrastCheckerTool } from "@/modules/contrast-checker/presentation/components/contrast-checker-tool";
import contrastEn from "@/modules/contrast-checker/presentation/i18n/en.json";
import contrastEs from "@/modules/contrast-checker/presentation/i18n/es.json";
import { CustomTimerTool } from "@/modules/custom-timer/presentation/components/custom-timer-tool";
import timerEn from "@/modules/custom-timer/presentation/i18n/en.json";
import timerEs from "@/modules/custom-timer/presentation/i18n/es.json";
import { DataToMarkdownTool } from "@/modules/data-to-markdown/presentation/components/data-to-markdown-tool";
import dataToMdEn from "@/modules/data-to-markdown/presentation/i18n/en.json";
import dataToMdEs from "@/modules/data-to-markdown/presentation/i18n/es.json";
import { ColorRangeTool } from "@/modules/color-range/presentation/components/color-range-tool";
import colorRangeEn from "@/modules/color-range/presentation/i18n/en.json";
import colorRangeEs from "@/modules/color-range/presentation/i18n/es.json";
import { ImageCompressorTool } from "@/modules/image-compressor/presentation/components/image-compressor-tool";
import imageCompressorEn from "@/modules/image-compressor/presentation/i18n/en.json";
import imageCompressorEs from "@/modules/image-compressor/presentation/i18n/es.json";
import { ImageConverterTool } from "@/modules/image-converter/presentation/components/image-converter-tool";
import imageEn from "@/modules/image-converter/presentation/i18n/en.json";
import imageEs from "@/modules/image-converter/presentation/i18n/es.json";
import { LlmsTxtTool } from "@/modules/llms-txt/presentation/components/llms-txt-tool";
import llmsEn from "@/modules/llms-txt/presentation/i18n/en.json";
import llmsEs from "@/modules/llms-txt/presentation/i18n/es.json";
import { LiquidGlassTool } from "@/modules/liquid-glass/presentation/components/liquid-glass-tool";
import liquidEn from "@/modules/liquid-glass/presentation/i18n/en.json";
import liquidEs from "@/modules/liquid-glass/presentation/i18n/es.json";
import { LoaderMakerTool } from "@/modules/loader-maker/presentation/components/loader-maker-tool";
import loaderEn from "@/modules/loader-maker/presentation/i18n/en.json";
import loaderEs from "@/modules/loader-maker/presentation/i18n/es.json";
import { MeshGradientTool } from "@/modules/mesh-gradient/presentation/components/mesh-gradient-tool";
import meshEn from "@/modules/mesh-gradient/presentation/i18n/en.json";
import meshEs from "@/modules/mesh-gradient/presentation/i18n/es.json";
import { ProgressiveBlurTool } from "@/modules/progressive-blur/presentation/components/progressive-blur-tool";
import progressiveEn from "@/modules/progressive-blur/presentation/i18n/en.json";
import progressiveEs from "@/modules/progressive-blur/presentation/i18n/es.json";
import { JsonFormatterTool } from "@/modules/json-formatter/presentation/components/json-formatter-tool";
import jsonEn from "@/modules/json-formatter/presentation/i18n/en.json";
import jsonEs from "@/modules/json-formatter/presentation/i18n/es.json";
import { TextTransformerTool } from "@/modules/text-transformer/presentation/components/text-transformer-tool";
import textEn from "@/modules/text-transformer/presentation/i18n/en.json";
import textEs from "@/modules/text-transformer/presentation/i18n/es.json";
import { TestColorsTool } from "@/modules/test-colors/presentation/components/test-colors-tool";
import testColorsEn from "@/modules/test-colors/presentation/i18n/en.json";
import testColorsEs from "@/modules/test-colors/presentation/i18n/es.json";
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
    id: "avatar-generator",
    category: "files-media",
    icon: IconPhoto,
    component: AvatarGeneratorTool,
    name: { en: avatarEn.name, es: avatarEs.name },
    description: { en: avatarEn.description, es: avatarEs.description },
  },
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
    id: "custom-timer",
    category: "advanced",
    icon: IconClockHour4,
    component: CustomTimerTool,
    name: { en: timerEn.name, es: timerEs.name },
    description: { en: timerEn.description, es: timerEs.description },
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
    id: "pdf-to-images",
    category: "files-media",
    icon: IconFileTypePdf,
    component: PdfToImagesTool,
    name: { en: pdfEn.name, es: pdfEs.name },
    description: { en: pdfEn.description, es: pdfEs.description },
  },
  {
    id: "pdf-compressor",
    category: "files-media",
    icon: IconFileTypePdf,
    component: PdfCompressorTool,
    name: { en: pdfCompressorEn.name, es: pdfCompressorEs.name },
    description: {
      en: pdfCompressorEn.description,
      es: pdfCompressorEs.description,
    },
  },
  {
    id: "video-compressor",
    category: "files-media",
    icon: IconFileTypePdf,
    component: VideoCompressorTool,
    name: { en: videoCompressorEn.name, es: videoCompressorEs.name },
    description: {
      en: videoCompressorEn.description,
      es: videoCompressorEs.description,
    },
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
    id: "test-colors",
    category: "data-encoding",
    icon: IconPalette,
    component: TestColorsTool,
    name: { en: testColorsEn.name, es: testColorsEs.name },
    description: { en: testColorsEn.description, es: testColorsEs.description },
  },
  {
    id: "fetch-colors",
    category: "data-encoding",
    icon: IconPalette,
    component: FetchColorsTool,
    name: { en: fetchColorsEn.name, es: fetchColorsEs.name },
    description: {
      en: fetchColorsEn.description,
      es: fetchColorsEs.description,
    },
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
    id: "data-to-markdown",
    category: "text-code",
    icon: IconBrackets,
    component: DataToMarkdownTool,
    name: { en: dataToMdEn.name, es: dataToMdEs.name },
    description: { en: dataToMdEn.description, es: dataToMdEs.description },
  },
  {
    id: "focus-reader",
    category: "text-code",
    icon: IconTextPlus,
    component: FocusReaderTool,
    name: { en: focusEn.name, es: focusEs.name },
    description: { en: focusEn.description, es: focusEs.description },
  },
  {
    id: "mesh-gradient",
    category: "advanced",
    icon: IconColorSwatch,
    component: MeshGradientTool,
    name: { en: meshEn.name, es: meshEs.name },
    description: { en: meshEn.description, es: meshEs.description },
  },
  {
    id: "progressive-blur",
    category: "advanced",
    icon: IconContrast2,
    component: ProgressiveBlurTool,
    name: { en: progressiveEn.name, es: progressiveEs.name },
    description: {
      en: progressiveEn.description,
      es: progressiveEs.description,
    },
  },
  {
    id: "liquid-glass",
    category: "advanced",
    icon: IconForms,
    component: LiquidGlassTool,
    name: { en: liquidEn.name, es: liquidEs.name },
    description: { en: liquidEn.description, es: liquidEs.description },
  },
  {
    id: "loader-maker",
    category: "advanced",
    icon: IconVariable,
    component: LoaderMakerTool,
    name: { en: loaderEn.name, es: loaderEs.name },
    description: { en: loaderEn.description, es: loaderEs.description },
  },
  {
    id: "llms-txt",
    category: "text-code",
    icon: IconFileText,
    component: LlmsTxtTool,
    name: { en: llmsEn.name, es: llmsEs.name },
    description: { en: llmsEn.description, es: llmsEs.description },
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
    id: "carousel-generator",
    category: "advanced",
    icon: IconForms,
    component: CarouselGeneratorTool,
    name: { en: carouselEn.name, es: carouselEs.name },
    description: { en: carouselEn.description, es: carouselEs.description },
  },
  {
    id: "chord-explorer",
    category: "advanced",
    icon: IconVariable,
    component: ChordExplorerTool,
    name: { en: chordEn.name, es: chordEs.name },
    description: { en: chordEn.description, es: chordEs.description },
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
