import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FaviconInstallationAssistant } from "@/modules/favicon-generator/presentation/components/favicon-installation-assistant";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";

describe("FaviconInstallationAssistant", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies a contextual AI prompt for the selected technology", () => {
    const onCopy = vi.fn();
    render(
      <FaviconInstallationAssistant
        faviconPath="/icons/"
        htmlSnippet='<link rel="icon" href="/icons/favicon.ico" />'
        language="es"
        onCopy={onCopy}
        onTargetChange={vi.fn()}
        target="nextjs"
        text={es.installation}
      />,
    );

    expect(screen.getByLabelText(es.installation.guide)).toHaveTextContent(
      "src/app/layout.tsx",
    );

    fireEvent.click(
      screen.getByRole("button", { name: es.installation.copyPrompt }),
    );
    expect(onCopy).toHaveBeenCalledWith(
      expect.stringContaining("proyecto (nextjs)"),
    );
  });

  it("reports the required public favicon checks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          summary: { icon: true, apple: true, manifest: true, config: false },
        }),
      }),
    );
    render(
      <FaviconInstallationAssistant
        faviconPath="/"
        htmlSnippet='<link rel="icon" href="/favicon.ico" />'
        language="es"
        onCopy={vi.fn()}
        onTargetChange={vi.fn()}
        target="html"
        text={es.installation}
      />,
    );

    fireEvent.change(screen.getByLabelText(es.installation.urlLabel), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: es.installation.check }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(es.installation.checkSuccess),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(es.installation.statusManifest),
    ).toBeInTheDocument();
  });
});
