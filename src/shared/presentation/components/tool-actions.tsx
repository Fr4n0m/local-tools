"use client";

import { NeoButton } from "@/shared/presentation/components/ui/neo-button";

type ToolAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type Props = {
  actions: ToolAction[];
};

export function ToolActions({ actions }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <NeoButton
          compact
          disabled={action.disabled}
          key={action.label}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </NeoButton>
      ))}
    </div>
  );
}
