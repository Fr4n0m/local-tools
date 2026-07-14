import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FaviconGeneratorTool } from "@/modules/favicon-generator/presentation/components/favicon-generator-tool";

vi.mock(
  "@/modules/favicon-generator/application/validate-favicon-image",
  () => ({
    validateFaviconImageFile: vi.fn().mockResolvedValue({ ok: true }),
  }),
);

describe("FaviconGeneratorTool guided experience", () => {
  it("keeps the complete editor as the normal experience", () => {
    render(
      <FaviconGeneratorTool
        experienceMode="comfortable"
        language="es"
        onExperienceModeChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Generador de Favicons" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Paso 1 de 6")).not.toBeInTheDocument();
  });

  it("shows the guided source step in compact mode and exits to normal", () => {
    const onExperienceModeChange = vi.fn();
    render(
      <FaviconGeneratorTool
        experienceMode="compact"
        language="es"
        onExperienceModeChange={onExperienceModeChange}
      />,
    );

    expect(screen.getByText("Paso 1 de 6")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Elige la imagen principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Volver al editor" }));
    expect(onExperienceModeChange).toHaveBeenCalledWith("comfortable");
  });

  it("walks through every guided step after selecting an image", async () => {
    render(
      <FaviconGeneratorTool
        experienceMode="compact"
        language="es"
        onExperienceModeChange={() => undefined}
      />,
    );

    const image = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" />'],
      "icon.svg",
      { type: "image/svg+xml" },
    );
    fireEvent.change(screen.getByLabelText("Selecciona imagen origen"), {
      target: { files: [image] },
    });

    expect(
      await screen.findByRole("img", { name: "Archivo actual: icon.svg" }),
    ).toBeInTheDocument();

    const continueButton = screen.getByRole("button", { name: "Continuar" });
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(
      await screen.findByRole("heading", {
        name: "Define la identidad de la app",
      }),
    ).toBeInTheDocument();
    screen.getAllByRole("textbox").forEach((input, index) => {
      fireEvent.change(input, { target: { value: `valor-${index}` } });
    });
    screen.getAllByRole("switch").forEach((input) => fireEvent.click(input));

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(
      await screen.findByRole("heading", {
        name: "Revisa el navegador",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Crop" }));
    fireEvent.click(screen.getByRole("radio", { name: "Squircle" }));
    screen.getAllByRole("slider").forEach((slider) => {
      fireEvent.change(slider, { target: { value: "72" } });
    });

    for (const heading of [
      "Ajusta Apple",
      "Ajusta Android",
      "Genera y descarga",
    ]) {
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
      expect(
        await screen.findByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }

    expect(screen.getByText("Paso 6 de 6")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Volver al editor" }),
    ).toHaveLength(2);
  });

  it("preserves the same work when switching between normal and compact", async () => {
    const onExperienceModeChange = vi.fn();
    const { rerender } = render(
      <FaviconGeneratorTool
        experienceMode="comfortable"
        language="es"
        onExperienceModeChange={onExperienceModeChange}
      />,
    );
    const image = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" />'],
      "shared-icon.svg",
      { type: "image/svg+xml" },
    );

    fireEvent.change(screen.getByLabelText("Selecciona imagen origen"), {
      target: { files: [image] },
    });
    fireEvent.change(screen.getByLabelText("Nombre de la app"), {
      target: { value: "Proyecto compartido" },
    });

    rerender(
      <FaviconGeneratorTool
        experienceMode="compact"
        language="es"
        onExperienceModeChange={onExperienceModeChange}
      />,
    );
    expect(
      await screen.findByRole("img", {
        name: "Archivo actual: shared-icon.svg",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(await screen.findByLabelText("Nombre de la app")).toHaveValue(
      "Proyecto compartido",
    );

    fireEvent.change(screen.getByLabelText("Nombre de la app"), {
      target: { value: "Ajustado en compacto" },
    });
    rerender(
      <FaviconGeneratorTool
        experienceMode="comfortable"
        language="es"
        onExperienceModeChange={onExperienceModeChange}
      />,
    );

    expect(screen.getByLabelText("Nombre de la app")).toHaveValue(
      "Ajustado en compacto",
    );
    expect(
      screen.getByText("Archivo actual: shared-icon.svg"),
    ).toBeInTheDocument();
  });
});
