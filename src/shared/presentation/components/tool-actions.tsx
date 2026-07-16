"use client";

import type { ReactNode } from "react";
import {
  IconArrowsShuffle,
  IconBraces,
  IconCheck,
  IconClipboardText,
  IconDownload,
  IconEraser,
  IconFileExport,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconRepeat,
  IconSearch,
  IconSparkles,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";

import { cn } from "@/shared/lib/utils";
import {
  Button,
  type ButtonProps,
} from "@/shared/presentation/components/ui/button";

type ToolAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: ButtonProps["variant"];
};

type Props = {
  actions: ToolAction[];
  align?: "start" | "end";
};

function inferActionIcon(label: string): ReactNode {
  const normalized = label.toLowerCase();
  const iconClassName = "h-4 w-4";

  if (/(aleatorio|aleator|random|shuffle)/i.test(normalized)) {
    return <IconArrowsShuffle className={iconClassName} />;
  }
  if (/(copiar|copy)/i.test(normalized)) {
    return <IconClipboardText className={iconClassName} />;
  }
  if (
    /(descargar|download|export|png|svg|jpeg|jpg|webp|zip)/i.test(normalized)
  ) {
    return <IconDownload className={iconClassName} />;
  }
  if (/(limpiar|clear|borrar|reset|reiniciar)/i.test(normalized)) {
    return <IconTrash className={iconClassName} />;
  }
  if (/(generar|generate|crear|create)/i.test(normalized)) {
    return <IconSparkles className={iconClassName} />;
  }
  if (/(convertir|convert|exportar|export)/i.test(normalized)) {
    return <IconFileExport className={iconClassName} />;
  }
  if (
    /(reparar|repair|format|formatear|normalizar|normalize)/i.test(normalized)
  ) {
    return <IconWand className={iconClassName} />;
  }
  if (
    /(validar|validate|check|analizar|analyze|inspect|inspeccionar)/i.test(
      normalized,
    )
  ) {
    return <IconCheck className={iconClassName} />;
  }
  if (/(buscar|search|fetch|extraer|extract)/i.test(normalized)) {
    return <IconSearch className={iconClassName} />;
  }
  if (/(codificar|encode|decode|decodificar)/i.test(normalized)) {
    return <IconBraces className={iconClassName} />;
  }
  if (/(start|iniciar|play)/i.test(normalized)) {
    return <IconPlayerPlay className={iconClassName} />;
  }
  if (/(pause|pausar)/i.test(normalized)) {
    return <IconPlayerPause className={iconClassName} />;
  }
  if (/(swap|intercambiar)/i.test(normalized)) {
    return <IconRepeat className={iconClassName} />;
  }
  if (/(trim|recortar)/i.test(normalized)) {
    return <IconEraser className={iconClassName} />;
  }

  return <IconRefresh className={iconClassName} />;
}

export function ToolActions({ actions, align = "start" }: Props) {
  return (
    <div
      className={cn("flex flex-wrap gap-3", align === "end" && "justify-end")}
      data-tool-actions
    >
      {actions.map((action) => {
        const icon = action.icon ?? inferActionIcon(action.label);

        return (
          <Button
            disabled={action.disabled}
            size="sm"
            variant={action.variant ?? "outline"}
            key={action.label}
            onClick={action.onClick}
            type="button"
          >
            <span aria-hidden>{icon}</span>
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
