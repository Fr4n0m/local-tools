import * as React from "react";

import { cn } from "@/shared/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "lt-surface-raised rounded-lg border border-border/60 dark:border-white/22 bg-background/85",
        className,
      )}
      {...props}
    />
  );
}
