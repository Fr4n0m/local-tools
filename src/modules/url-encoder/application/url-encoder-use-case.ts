import { decodeUrl, encodeUrl } from "@/modules/url-encoder/domain/url-encoder";

export const urlEncoderUseCase = {
  encode: encodeUrl,
  decode: decodeUrl,
};
