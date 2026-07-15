import { z } from "zod";

export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarStyle = "portrait" | "initials";
export type HairStyle = "short" | "wave" | "bun" | "none";
export type EyeStyle = "round" | "happy" | "wink";
export type MouthStyle = "smile" | "neutral" | "open";
export type AvatarPresentation = "female" | "male";
export type AvatarAge = "young" | "elderly";

const avatarColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/);

export const avatarInputSchema = z.object({
  size: z.coerce.number().int().min(64).max(1024),
  initials: z.string().trim().min(1).max(4),
  background: avatarColorSchema,
  textColor: avatarColorSchema,
  shape: z.enum(["circle", "rounded", "square"]),
  style: z.enum(["portrait", "initials"]).default("portrait"),
  skinColor: avatarColorSchema.default("#f2b38f"),
  hairColor: avatarColorSchema.default("#38251f"),
  shirtColor: avatarColorSchema.default("#6857e5"),
  hair: z.enum(["short", "wave", "bun", "none"]).default("short"),
  eyes: z.enum(["round", "happy", "wink"]).default("round"),
  mouth: z.enum(["smile", "neutral", "open"]).default("smile"),
  presentation: z.enum(["female", "male"]).default("female"),
  age: z.enum(["young", "elderly"]).default("young"),
});

export type AvatarInput = z.input<typeof avatarInputSchema>;

const FIRST_NAMES = {
  female: ["Alba", "Inés", "Mara", "Nora", "Vera", "Lía"],
  male: ["Álex", "Bruno", "Hugo", "Leo", "Noel", "Teo"],
} as const;
const LAST_NAMES = [
  "Soler",
  "Vega",
  "Ríos",
  "Campos",
  "Luna",
  "Serra",
] as const;

export function fictitiousProfile(
  sequence: number,
  presentation: AvatarPresentation,
  age: AvatarAge,
): { name: string; hair: HairStyle; eyes: EyeStyle; mouth: MouthStyle } {
  const safeSequence = Math.abs(Math.trunc(sequence));
  const names = FIRST_NAMES[presentation];
  const firstName = names[safeSequence % names.length];
  const lastName =
    LAST_NAMES[
      (Math.floor(safeSequence / names.length) + safeSequence * 3) %
        LAST_NAMES.length
    ];
  const youngHair = ["short", "wave", "bun", "none"] as const;
  const elderlyHair = ["short", "wave", "bun"] as const;
  const hairOptions = age === "elderly" ? elderlyHair : youngHair;
  const eyeOptions = ["round", "happy", "wink"] as const;
  const mouthOptions = ["smile", "neutral", "open"] as const;

  return {
    name: `${firstName} ${lastName}`,
    hair: hairOptions[safeSequence % hairOptions.length],
    eyes: eyeOptions[(safeSequence * 5 + 1) % eyeOptions.length],
    mouth: mouthOptions[(safeSequence * 7 + 2) % mouthOptions.length],
  };
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "LT";
  return parts.map((part) => part[0].toUpperCase()).join("");
}

export function avatarSeedColor(seed: string): string {
  const value = seed.trim().toLowerCase() || "localtools";
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = [
    "#e5484d",
    "#e86f3a",
    "#d6a318",
    "#30a46c",
    "#0c7792",
    "#3e63dd",
    "#8e4ec6",
    "#d6409f",
  ] as const;
  return palette[Math.abs(hash) % palette.length];
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function portraitMarkup(input: z.output<typeof avatarInputSchema>): string {
  const renderedHairColor =
    input.age === "elderly" ? "#a7a7a7" : input.hairColor;
  const hair = {
    short: `<path d="M69 116c0-43 26-70 59-70 40 0 63 28 59 74-15-4-25-14-30-28-15 17-41 27-78 25Z" fill="${renderedHairColor}"/>`,
    wave: `<path d="M65 124c-7-45 20-79 62-79 43 0 69 34 63 82-9-4-15-12-19-22-9 15-21 18-33 6-17 18-36 18-54 3-4 7-10 10-19 10Z" fill="${renderedHairColor}"/>`,
    bun: `<circle cx="128" cy="45" r="25" fill="${renderedHairColor}"/><path d="M69 119c0-45 25-70 59-70 38 0 61 25 59 71-18-7-31-21-38-39-18 22-43 34-80 38Z" fill="${renderedHairColor}"/>`,
    none: "",
  }[input.hair];
  const eyes = {
    round: `<circle cx="105" cy="125" r="5" fill="#252326"/><circle cx="151" cy="125" r="5" fill="#252326"/>`,
    happy: `<path d="M96 128q9-12 18 0M142 128q9-12 18 0" fill="none" stroke="#252326" stroke-width="5" stroke-linecap="round"/>`,
    wink: `<circle cx="105" cy="125" r="5" fill="#252326"/><path d="M143 127q8 6 16 0" fill="none" stroke="#252326" stroke-width="5" stroke-linecap="round"/>`,
  }[input.eyes];
  const mouth = {
    smile: `<path d="M111 150q17 19 34 0" fill="none" stroke="#9c443d" stroke-width="5" stroke-linecap="round"/>`,
    neutral: `<path d="M116 154h24" stroke="#9c443d" stroke-width="5" stroke-linecap="round"/>`,
    open: `<ellipse cx="128" cy="153" rx="12" ry="9" fill="#9c443d"/>`,
  }[input.mouth];
  const faceRx = input.presentation === "male" ? 60 : 57;
  const ageDetails =
    input.age === "elderly"
      ? `<path d="M91 140q10 5 20 0M145 140q10 5 20 0M103 164q25 8 50 0" fill="none" stroke="#c87962" stroke-width="2" stroke-linecap="round" opacity=".7"/>`
      : "";
  return `<circle cx="128" cy="248" r="75" fill="${input.shirtColor}"/><rect x="114" y="169" width="28" height="35" rx="12" fill="${input.skinColor}"/><ellipse cx="128" cy="126" rx="${faceRx}" ry="66" fill="${input.skinColor}"/>${hair}${eyes}<path d="M125 134l-4 11h10" fill="none" stroke="#c87962" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${mouth}${ageDetails}`;
}

export function buildAvatarSvg(params: AvatarInput): string {
  const parsed = avatarInputSchema.parse(params);
  const radius =
    parsed.shape === "circle" ? 128 : parsed.shape === "rounded" ? 56 : 0;
  const content =
    parsed.style === "initials"
      ? `<text x="128" y="136" dominant-baseline="middle" text-anchor="middle" fill="${parsed.textColor}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="98" font-weight="700">${escapeXml(parsed.initials)}</text>`
      : portraitMarkup(parsed);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${parsed.size}" height="${parsed.size}" viewBox="0 0 256 256"><defs><clipPath id="avatar-frame"><rect width="256" height="256" rx="${radius}"/></clipPath></defs><g clip-path="url(#avatar-frame)"><rect width="256" height="256" fill="${parsed.background}"/>${content}</g></svg>`;
}
