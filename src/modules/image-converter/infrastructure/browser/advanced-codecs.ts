import avifEncoderFactory from "@jsquash/avif/codec/enc/avif_enc.js";
import { defaultOptions as avifDefaultOptions } from "@jsquash/avif/meta.js";
import { initEmscriptenModule as initAvifModule } from "@jsquash/avif/utils.js";
import jxlEncoderFactory from "@jsquash/jxl/codec/enc/jxl_enc.js";
import { defaultOptions as jxlDefaultOptions } from "@jsquash/jxl/meta.js";
import { initEmscriptenModule as initJxlModule } from "@jsquash/jxl/utils.js";
import qoiEncoderFactory from "@jsquash/qoi/codec/enc/qoi_enc.js";
import { initEmscriptenModule as initQoiModule } from "@jsquash/qoi/utils.js";

type AdvancedOutputFormat = "image/avif" | "image/jxl" | "image/qoi";

type AvifModule = {
  encode: (
    data: Uint8Array,
    width: number,
    height: number,
    options: Record<string, unknown>,
  ) => Uint8Array | null;
};

type JxlModule = {
  encode: (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: Record<string, unknown>,
  ) => Uint8Array | null;
};

type QoiModule = {
  encode: (
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ) => Uint8Array;
};

let avifModulePromise: Promise<AvifModule> | null = null;
let jxlModulePromise: Promise<JxlModule> | null = null;
let qoiModulePromise: Promise<QoiModule> | null = null;

function asBlobBytes(output: Uint8Array): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(output.byteLength);
  bytes.set(output);
  return bytes;
}

function getAvifModule(): Promise<AvifModule> {
  avifModulePromise ??= Promise.resolve(
    initAvifModule(avifEncoderFactory) as Promise<AvifModule>,
  );
  return avifModulePromise;
}

function getJxlModule(): Promise<JxlModule> {
  jxlModulePromise ??= Promise.resolve(
    initJxlModule(jxlEncoderFactory) as Promise<JxlModule>,
  );
  return jxlModulePromise;
}

function getQoiModule(): Promise<QoiModule> {
  qoiModulePromise ??= Promise.resolve(
    initQoiModule(qoiEncoderFactory) as Promise<QoiModule>,
  );
  return qoiModulePromise;
}

export async function encodeAdvancedCodec(
  imageData: ImageData,
  format: AdvancedOutputFormat,
  quality: number,
): Promise<Blob> {
  if (format === "image/avif") {
    const codecModule = await getAvifModule();
    const output = codecModule.encode(
      new Uint8Array(imageData.data.buffer),
      imageData.width,
      imageData.height,
      {
        ...avifDefaultOptions,
        quality: Math.round(quality * 100),
      },
    );
    if (!output) throw new Error("avif-encode-failed");
    return new Blob([asBlobBytes(output)], { type: format });
  }

  if (format === "image/jxl") {
    const codecModule = await getJxlModule();
    const output = codecModule.encode(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        ...jxlDefaultOptions,
        quality: Math.round(quality * 100),
      },
    );
    if (!output) throw new Error("jxl-encode-failed");
    return new Blob([asBlobBytes(output)], { type: format });
  }

  const codecModule = await getQoiModule();
  const output = codecModule.encode(
    imageData.data,
    imageData.width,
    imageData.height,
  );
  return new Blob([asBlobBytes(output)], { type: format });
}
