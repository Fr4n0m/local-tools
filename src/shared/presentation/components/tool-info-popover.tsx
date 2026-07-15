"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { useId, type ReactNode } from "react";

type ToolInfoPopoverProps = {
  content: ReactNode;
  label: string;
};

export function ToolInfoPopover({ content, label }: ToolInfoPopoverProps) {
  const tooltipId = useId();

  return (
    <div className="tools-privacy-popover tools-info-popover">
      <button
        aria-describedby={tooltipId}
        aria-label={label}
        className="tools-privacy-trigger tools-info-trigger"
        type="button"
      >
        <IconInfoCircle aria-hidden size={15} />
      </button>
      <div
        className="tools-privacy-card tools-info-card"
        id={tooltipId}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}
