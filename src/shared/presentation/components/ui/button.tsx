import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva("lt-button", {
  variants: {
    variant: {
      default: "lt-button--solid",
      outline: "lt-button--outline",
      ghost: "lt-button--ghost",
    },
    size: {
      default: "",
      sm: "lt-button--sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
