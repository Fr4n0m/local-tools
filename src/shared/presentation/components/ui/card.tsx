import * as React from "react";

import { cn } from "@/shared/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-secondary/25",
        className,
      )}
      {...props}
    />
  );
}
