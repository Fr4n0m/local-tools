import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { normalizeSubscriptionStatus } from "@/app/overview/subscription-status";
import { SubscriptionStatusModal } from "@/app/overview/components/subscription-status-modal";

const text = {
  confirmedEyebrow: "SUSCRIPCIÓN CONFIRMADA",
  confirmedTitle: "Suscripción confirmada",
  confirmedDescription: "Bienvenido a LocalTools.",
  confirmedAction: "Volver a LocalTools",
  errorEyebrow: "NO SE PUDO CONFIRMAR",
  errorTitle: "No pudimos confirmar",
  errorDescription: "El enlace no es válido o ha caducado.",
  errorAction: "Solicitar otro email",
  closeLabel: "Cerrar",
};

describe("normalizeSubscriptionStatus", () => {
  it("accepts supported subscription states", () => {
    expect(normalizeSubscriptionStatus("confirmed")).toBe("confirmed");
    expect(normalizeSubscriptionStatus("error")).toBe("error");
  });

  it("uses the first query value when Next.js provides an array", () => {
    expect(normalizeSubscriptionStatus(["confirmed", "error"])).toBe(
      "confirmed",
    );
  });

  it("ignores missing and unknown subscription states", () => {
    expect(normalizeSubscriptionStatus(undefined)).toBeNull();
    expect(normalizeSubscriptionStatus("pending")).toBeNull();
    expect(normalizeSubscriptionStatus([])).toBeNull();
  });
});

describe("SubscriptionStatusModal", () => {
  it("renders the confirmed subscription state", () => {
    render(
      <SubscriptionStatusModal
        status="confirmed"
        text={text}
        onClose={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Suscripción confirmada" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bienvenido a LocalTools.")).toBeInTheDocument();
  });

  it("renders the invalid or expired verification state", () => {
    render(
      <SubscriptionStatusModal
        status="error"
        text={text}
        onClose={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(screen.getByText("No pudimos confirmar")).toBeInTheDocument();
    expect(
      screen.getByText("El enlace no es válido o ha caducado."),
    ).toBeInTheDocument();
  });

  it("closes from Escape and the accessible close button", () => {
    const onClose = vi.fn();
    render(
      <SubscriptionStatusModal
        status="confirmed"
        text={text}
        onClose={onClose}
        onPrimaryAction={() => undefined}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("wraps keyboard focus inside the modal", () => {
    render(
      <SubscriptionStatusModal
        status="confirmed"
        text={text}
        onClose={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    const close = screen.getByRole("button", { name: "Cerrar" });
    const primary = screen.getByRole("button", {
      name: "Volver a LocalTools",
    });

    primary.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(close).toHaveFocus();

    close.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(primary).toHaveFocus();
  });
});
