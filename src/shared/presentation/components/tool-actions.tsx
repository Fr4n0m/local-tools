"use client";

import type { ReactNode } from "react";

import { Button } from "@/shared/presentation/components/ui/button";

type ToolAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
};

type Props = {
  actions: ToolAction[];
};

export function ToolActions({ actions }: Props) {
  return (
    <div className="flex flex-wrap gap-3" data-tool-actions>
      {actions.map((action) => (
        <Button
          disabled={action.disabled}
          size="sm"
          variant="outline"
          key={action.label}
          onClick={action.onClick}
          type="button"
        >
          {action.icon ? <span aria-hidden>{action.icon}</span> : null}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
