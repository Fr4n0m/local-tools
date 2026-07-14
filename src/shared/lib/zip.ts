import { zipSync } from "fflate";

type ZipInputFile = {
  name: string;
  blob: Blob;
};

export async function createZipBlob(files: ZipInputFile[]): Promise<Blob> {
  const entries = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [
        file.name,
        new Uint8Array(await file.blob.arrayBuffer()),
      ]),
    ),
  ) as Record<string, Uint8Array>;

  const archive = zipSync(entries, { level: 6 });
  const copy = new Uint8Array(archive.length);
  copy.set(archive);
  return new Blob([copy], { type: "application/zip" });
}
