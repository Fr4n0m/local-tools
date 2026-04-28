"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  clampTimerInput,
  secondsToClock,
} from "@/modules/custom-timer/domain/timer";
import en from "@/modules/custom-timer/presentation/i18n/en.json";
import es from "@/modules/custom-timer/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function CustomTimerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const configuredSeconds = clampTimerInput(
    hours * 3600 + minutes * 60 + seconds,
  );

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!finished) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.03;
    osc.start();
    setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, 220);
  }, [finished]);

  const start = () => {
    if (configuredSeconds === 0 && remaining === 0) return;
    if (remaining === 0) setRemaining(configuredSeconds);
    setFinished(false);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setFinished(false);
    setRemaining(configuredSeconds);
  };

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-3">
        <ToolField label={text.hours}>
          <ToolInput
            max={24}
            min={0}
            onChange={(e) => setHours(Number(e.target.value))}
            type="number"
            value={hours}
          />
        </ToolField>
        <ToolField label={text.minutes}>
          <ToolInput
            max={59}
            min={0}
            onChange={(e) => setMinutes(Number(e.target.value))}
            type="number"
            value={minutes}
          />
        </ToolField>
        <ToolField label={text.seconds}>
          <ToolInput
            max={59}
            min={0}
            onChange={(e) => setSeconds(Number(e.target.value))}
            type="number"
            value={seconds}
          />
        </ToolField>
      </div>

      <p className="text-4xl font-semibold tabular-nums">
        {secondsToClock(remaining)}
      </p>
      {finished ? (
        <p className="text-sm text-emerald-500">{text.done}</p>
      ) : null}

      <ToolActions
        actions={[
          {
            label: text.start,
            onClick: start,
            disabled: isRunning,
          },
          {
            label: text.pause,
            onClick: pause,
            disabled: !isRunning,
          },
          {
            label: text.reset,
            onClick: reset,
          },
        ]}
      />
    </ToolSection>
  );
}
