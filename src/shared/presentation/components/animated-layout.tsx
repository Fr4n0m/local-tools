"use client";

import type { AriaRole, CSSProperties, ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/shared/lib/utils";

type AnimatedLayoutGroupProps = {
  children: ReactNode;
  className?: string;
};

type AnimatedLayoutItemProps = {
  children: ReactNode;
  className?: string;
  role?: AriaRole;
  style?: CSSProperties;
};

export function AnimatedLayoutGroup({
  children,
  className,
}: AnimatedLayoutGroupProps) {
  return (
    <LayoutGroup>
      <div className={className}>
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

export function AnimatedLayoutItem({
  children,
  className,
  role,
  style,
}: AnimatedLayoutItemProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("min-w-0", className)}
      role={role}
      style={style}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
      initial={
        reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      layout
      transition={{
        duration: reducedMotion ? 0.01 : 0.24,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
