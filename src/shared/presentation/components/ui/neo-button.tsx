import * as React from "react";

import { cn } from "@/shared/lib/utils";

type NeoButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  compact?: boolean;
};

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, compact = false, ...props }, ref) => (
    <button
      className={cn("neu-button", compact && "neu-button--compact", className)}
      ref={ref}
      {...props}
    />
  ),
);

NeoButton.displayName = "NeoButton";
