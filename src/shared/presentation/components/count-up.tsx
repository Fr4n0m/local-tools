"use client";

import { animate } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
};

export function CountUp({
  to,
  from,
  duration = 0.12,
  decimals = 0,
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const format = useCallback(
    (v: number) => `${v.toFixed(decimals)}${suffix}`,
    [decimals, suffix],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = format(from);
    }
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = format(v);
        }
      },
    });
    return () => controls.stop();
  }, [to, from, duration, format]);

  return <span className={className} ref={ref} />;
}
