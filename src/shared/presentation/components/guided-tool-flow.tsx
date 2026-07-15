"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/presentation/components/ui/button";

export type GuidedToolStep = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  canContinue?: boolean;
  blockedMessage?: string;
  scrollable?: boolean;
  onEnter?: () => void;
};

type GuidedToolFlowProps = {
  steps: GuidedToolStep[];
  backLabel: string;
  continueLabel: string;
  exitLabel: string;
  progressLabel: string;
  stepLabel: (current: number, total: number) => string;
  onExit: () => void;
  className?: string;
};

function GuidedScrollArea({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ top: false, bottom: false });

  const updateOverflow = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    setOverflow({
      top: viewport.scrollTop > 2,
      bottom: maxScroll - viewport.scrollTop > 2,
    });
  }, []);

  useEffect(() => {
    updateOverflow();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflow);
      return () => window.removeEventListener("resize", updateOverflow);
    }
    const observer = new ResizeObserver(updateOverflow);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [updateOverflow]);

  const maskImage =
    overflow.top && overflow.bottom
      ? "linear-gradient(to bottom, transparent 0, black 0.75rem, black calc(100% - 0.75rem), transparent 100%)"
      : overflow.top
        ? "linear-gradient(to bottom, transparent 0, black 0.75rem, black 100%)"
        : overflow.bottom
          ? "linear-gradient(to bottom, black 0, black calc(100% - 0.75rem), transparent 100%)"
          : undefined;

  return (
    <div
      className="hide-scrollbar h-full min-h-0 overflow-y-auto overscroll-contain pr-1"
      onScroll={updateOverflow}
      ref={viewportRef}
      style={{ maskImage, WebkitMaskImage: maskImage }}
    >
      <div className="pb-6" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

export function GuidedToolFlow({
  steps,
  backLabel,
  continueLabel,
  exitLabel,
  progressLabel,
  stepLabel,
  onExit,
  className,
}: GuidedToolFlowProps) {
  const [{ currentIndex, direction }, setNavigation] = useState({
    currentIndex: 0,
    direction: 1 as 1 | -1,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

  if (!currentStep) return null;

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= steps.length) return;
    steps[nextIndex]?.onEnter?.();
    setNavigation({
      currentIndex: nextIndex,
      direction: nextIndex > currentIndex ? 1 : -1,
    });
  };

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby={`guided-step-${currentStep.id}`}
        className={cn(
          "flex h-[calc(100dvh-12rem)] min-h-0 flex-col overflow-hidden rounded-3xl bg-secondary/45 dark:bg-[#111] md:h-[calc(100dvh-10rem)]",
          className,
        )}
      >
        <header className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 dark:border-white/12 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/48">
                {stepLabel(currentIndex + 1, steps.length)}
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground/72">
                {progressLabel}
              </p>
            </div>
            <Button
              aria-label={exitLabel}
              className="shrink-0"
              onClick={onExit}
              size="sm"
              variant="ghost"
            >
              <IconX aria-hidden className="h-4 w-4" />
              <span>{exitLabel}</span>
            </Button>
          </div>

          <ol
            aria-label={progressLabel}
            className="grid grid-flow-col auto-cols-fr gap-1.5"
          >
            {steps.map((step, index) => {
              const active = index === currentIndex;
              const available = index <= currentIndex;
              return (
                <li key={step.id}>
                  <button
                    aria-current={active ? "step" : undefined}
                    aria-label={`${index + 1}. ${step.title}`}
                    className="group grid h-6 w-full place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    disabled={!available || active}
                    onClick={() => goTo(index)}
                    type="button"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-2 w-full rounded-full transition-[background-color,transform] duration-200 motion-reduce:transition-none",
                        active
                          ? "scale-y-125 bg-foreground"
                          : index < currentIndex
                            ? "bg-foreground/42 group-hover:bg-foreground/58"
                            : "bg-foreground/12",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <m.div
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6 lg:px-8",
                currentStep.scrollable ? "py-2.5" : "py-4",
              )}
              custom={direction}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction > 0 ? -24 : 24 }
              }
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction > 0 ? 24 : -24 }
              }
              key={currentStep.id}
              onAnimationComplete={() =>
                headingRef.current?.focus({ preventScroll: true })
              }
              transition={{
                duration: reducedMotion ? 0.01 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="guided-tool-content mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
                <div
                  className={cn(
                    "grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3",
                    currentStep.scrollable ? "mb-2.5" : "mb-4",
                  )}
                >
                  {currentStep.icon ? (
                    <span
                      aria-hidden
                      className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/55 text-foreground/78 [&>svg]:h-6 [&>svg]:w-6 dark:bg-[#1b1b1b]"
                    >
                      {currentStep.icon}
                    </span>
                  ) : (
                    <span aria-hidden />
                  )}
                  <div className="min-w-0">
                    <h2
                      className="text-xl font-semibold leading-tight tracking-[-0.025em] outline-none sm:text-2xl"
                      id={`guided-step-${currentStep.id}`}
                      ref={headingRef}
                      tabIndex={-1}
                    >
                      {currentStep.title}
                    </h2>
                  </div>
                  {currentStep.description ? (
                    <p className="col-start-2 mt-1 max-w-2xl text-sm leading-5 text-foreground/62">
                      {currentStep.description}
                    </p>
                  ) : null}
                </div>
                <div
                  className={cn(
                    "flex-1",
                    currentStep.scrollable && "min-h-0 overflow-hidden",
                  )}
                >
                  {currentStep.scrollable ? (
                    <GuidedScrollArea>{currentStep.content}</GuidedScrollArea>
                  ) : (
                    currentStep.content
                  )}
                </div>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between gap-3 px-4 pb-3 pt-2 sm:px-6">
          <Button
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
            size="sm"
            variant="outline"
          >
            <IconArrowLeft aria-hidden className="h-4 w-4" />
            <span>{backLabel}</span>
          </Button>

          {!isLastStep ? (
            <div className="flex flex-col items-end gap-1.5">
              <Button
                disabled={currentStep.canContinue === false}
                onClick={() => goTo(currentIndex + 1)}
                size="sm"
              >
                <span>{continueLabel}</span>
                <IconArrowRight aria-hidden className="h-4 w-4" />
              </Button>
              {currentStep.canContinue === false &&
              currentStep.blockedMessage ? (
                <p className="text-xs text-foreground/52" role="status">
                  {currentStep.blockedMessage}
                </p>
              ) : null}
            </div>
          ) : (
            <Button onClick={onExit} size="sm" variant="outline">
              <span>{exitLabel}</span>
            </Button>
          )}
        </footer>
      </section>
    </LazyMotion>
  );
}
