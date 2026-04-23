import {
  decodeBase64,
  encodeBase64,
} from "@/modules/base64-tool/domain/base64";

export const base64UseCase = {
  encode: encodeBase64,
  decode: decodeBase64,
};
