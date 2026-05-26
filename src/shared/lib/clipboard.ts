import { notifyCopyError, notifyCopySuccess } from "@/shared/lib/notify";

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) {
    notifyCopyError();
    return false;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      notifyCopySuccess();
      return true;
    } catch {
      notifyCopyError();
      return false;
    }
  }

  notifyCopyError();
  return false;
}
