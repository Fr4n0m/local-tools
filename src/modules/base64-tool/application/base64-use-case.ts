import {
  decodeBase64Url,
  decodeBase64,
  encodeBase64Url,
  encodeBase64,
  isValidBase64,
  isValidBase64Url,
  normalizeBase64,
  normalizeBase64Url,
  parseDataUrl,
  toDataUrl,
} from "@/modules/base64-tool/domain/base64";

export const base64UseCase = {
  encode: encodeBase64,
  decode: decodeBase64,
  encodeUrl: encodeBase64Url,
  decodeUrl: decodeBase64Url,
  normalize: normalizeBase64,
  normalizeUrl: normalizeBase64Url,
  isValid: isValidBase64,
  isValidUrl: isValidBase64Url,
  toDataUrl,
  parseDataUrl,
};
