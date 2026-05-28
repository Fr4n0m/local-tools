"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  IconCode,
  IconDatabase,
  IconDownload,
  IconSettings,
} from "@tabler/icons-react";
import styles from "./overview.module.css";
import { SimplePageHeader } from "@/shared/presentation/components/simple-page-header";
import { PageDisplayControls } from "@/shared/presentation/components/page-display-controls";
import { tools } from "@/modules/tool-registry/application/tools";
import { HeroSection } from "./components/hero-section";
import { StorySection } from "./components/story-section";
import { MultiBannerSection } from "./components/multi-banner-section";
import { CapabilityChaptersSection } from "./components/capability-chapters-section";
import { ToolsStripSection } from "./components/tools-strip-section";
import { DiscoverSection } from "./components/discover-section";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

const categoryOrder = [
  "files-media",
  "data-encoding",
  "text-code",
  "advanced",
] as const;

const categoryMeta = {
  "files-media": {
    icon: IconDownload,
    label: { en: "Files & Media", es: "Archivos y Multimedia" },
    summary: {
      en: "Image, PDF, and video tasks where speed and privacy matter more than cloud workflows.",
      es: "Tareas de imagen, PDF y video donde importan más la velocidad y la privacidad que la nube.",
    },
  },
  "data-encoding": {
    icon: IconDatabase,
    label: { en: "Data & Encoding", es: "Datos y Codificación" },
    summary: {
      en: "Validation and transformation utilities for JSON, URLs, payloads, and compact data formats.",
      es: "Utilidades de validación y transformación para JSON, URLs, payloads y formatos compactos.",
    },
  },
  "text-code": {
    icon: IconCode,
    label: { en: "Text & Code", es: "Texto y Código" },
    summary: {
      en: "Text-focused modules for documentation, developer writing, prompt prep, and structured content.",
      es: "Módulos centrados en texto para documentación, escritura técnica y contenido estructurado.",
    },
  },
  advanced: {
    icon: IconSettings,
    label: { en: "Advanced Utilities", es: "Utilidades Avanzadas" },
    summary: {
      en: "Specialized tools with deeper controls for creative and high-specificity utility scenarios.",
      es: "Herramientas especializadas con más control para escenarios creativos y específicos.",
    },
  },
} as const;

export function OverviewExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const thirdSectionRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>(() =>
    typeof window === "undefined" ? "en" : resolveInitialLanguage(),
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "localtools.language")
        setLanguage(resolveInitialLanguage());
    };
    const onLanguageChange = () => setLanguage(resolveInitialLanguage());
    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", onLanguageChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "localtools:language-change",
        onLanguageChange,
      );
    };
  }, []);

  const chapters = useMemo(
    () =>
      categoryOrder.map((category) => {
        const data = tools.filter((tool) => tool.category === category);
        const names = data.slice(0, 6).map((tool) => tool.name[language]);
        const rest = data.length > 6 ? data.length - 6 : 0;
        return {
          category,
          icon: categoryMeta[category].icon,
          label: categoryMeta[category].label[language],
          summary: categoryMeta[category].summary[language],
          names,
          rest,
        };
      }),
    [language],
  );

  useEffect(() => {
    const root = rootRef.current;
    const strip = horizontalRef.current;
    if (!root || !strip) return;
    const cleanupFns: Array<() => void> = [];

    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          "[data-fade], [data-slide], .horizontalStrip, .stripCard, .heroAssetShape",
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            clipPath: "inset(0% 0% 0% 0%)",
          },
        );
        return;
      }

      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(
          ".heroCopy h1 span",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.62, stagger: 0.08 },
        )
        .fromTo(
          ".subLead",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.48 },
          "-=0.25",
        )
        .fromTo(
          ".heroText",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.52 },
          "-=0.3",
        )
        .fromTo(
          ".heroMeta article",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.42, stagger: 0.08 },
          "-=0.2",
        )
        .fromTo(
          ".heroAsset",
          { opacity: 0, x: 56, scale: 0.97 },
          { opacity: 1, x: 0, scale: 1, duration: 0.82, ease: "power2.out" },
          "-=0.6",
        )
        .fromTo(
          ".heroActions > *",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.38, stagger: 0.1 },
          "-=0.45",
        );

      gsap.to(".heroAssetShape", {
        yPercent: -8,
        rotate: -1.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.9,
        },
      });

      gsap.fromTo(
        "[data-fade]:not(.hero)",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: root,
            start: "top top+=220",
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-slide]").forEach((el, idx) => {
        const lead = el.querySelector<HTMLElement>(".chapterLead");
        const media = el.querySelector<HTMLElement>(".chapterMedia");

        const sectionTl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        });

        sectionTl
          .fromTo(
            lead,
            { opacity: 0, x: idx % 2 === 0 ? -58 : 58, y: 16 },
            { opacity: 1, x: 0, y: 0, duration: 0.78, ease: "power3.out" },
          )
          .fromTo(
            media,
            { opacity: 0, x: idx % 2 === 0 ? 46 : -46, y: 10, scale: 0.985 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.82,
              ease: "power2.out",
            },
            "-=0.56",
          );
      });

      const storyPath = root.querySelector<SVGPathElement>(".storyLinePath");
      const storyNodes = gsap.utils.toArray<HTMLElement>(".storyNode");
      const storyTimelineEl = root.querySelector<HTMLElement>(".storyTimeline");
      const storyCurveSvg = root.querySelector<SVGSVGElement>(".timelineCurve");

      const syncStoryNodePositions = () => {
        if (
          !storyPath ||
          !storyTimelineEl ||
          !storyCurveSvg ||
          storyNodes.length === 0
        )
          return;

        const pathLength = storyPath.getTotalLength();
        const pathBox = storyPath.getBBox();
        const curveRect = storyCurveSvg.getBoundingClientRect();
        if (curveRect.width <= 0) return;

        storyNodes.forEach((node) => {
          const nodeRect = node.getBoundingClientRect();
          const nodeCenterXInCurve =
            nodeRect.left - curveRect.left + nodeRect.width / 2;
          const xInViewBox = (nodeCenterXInCurve / curveRect.width) * 1000;
          const xClamped = Math.min(
            pathBox.x + pathBox.width,
            Math.max(pathBox.x, xInViewBox),
          );
          const progress = (xClamped - pathBox.x) / pathBox.width;
          const point = storyPath.getPointAtLength(pathLength * progress);
          const bubbleTopPx = (point.y / 220) * 220 - 27;
          node.style.setProperty(
            "--bubble-top",
            `${Math.max(0, bubbleTopPx)}px`,
          );
        });
      };

      gsap.fromTo(
        ".storyHeadItem",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.62,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".story",
            start: "top 84%",
          },
        },
      );

      if (storyPath && storyNodes.length > 0) {
        syncStoryNodePositions();
        const resizeObserver = new ResizeObserver(() =>
          syncStoryNodePositions(),
        );
        if (storyTimelineEl) resizeObserver.observe(storyTimelineEl);
        if (storyCurveSvg) resizeObserver.observe(storyCurveSvg);
        window.addEventListener("resize", syncStoryNodePositions);
        cleanupFns.push(() => resizeObserver.disconnect());
        cleanupFns.push(() =>
          window.removeEventListener("resize", syncStoryNodePositions),
        );

        const length = storyPath.getTotalLength();
        gsap.set(storyPath, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.set(storyNodes, { opacity: 0, y: 14, scale: 0.94 });
        gsap.set(".storyNodeBubble", { scale: 0.72, opacity: 0.35 });

        const storyTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".storyTimeline",
            start: "top 86%",
            end: "top 34%",
            scrub: 1.05,
          },
        });

        storyTl.to(
          storyPath,
          {
            strokeDashoffset: 0,
            ease: "none",
            duration: 1,
          },
          0,
        );

        storyNodes.forEach((node, idx) => {
          const at = 0.14 + idx * 0.17;
          const bubble = node.querySelector<HTMLElement>(".storyNodeBubble");

          storyTl.to(
            node,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.16,
              ease: "power2.out",
            },
            at,
          );

          if (bubble) {
            storyTl.to(
              bubble,
              {
                opacity: 1,
                scale: 1.12,
                duration: 0.1,
                ease: "power2.out",
              },
              at + 0.02,
            );
            storyTl.to(
              bubble,
              {
                scale: 1,
                duration: 0.12,
                ease: "back.out(2.8)",
              },
              at + 0.11,
            );
            storyTl.fromTo(
              bubble,
              { boxShadow: "0 0 0px rgba(118,131,154,0)" },
              {
                boxShadow: "0 0 18px rgba(118,131,154,0.42)",
                duration: 0.11,
                yoyo: true,
                repeat: 1,
                ease: "power1.out",
              },
              at + 0.06,
            );
          }
        });

        storyTl.eventCallback("onUpdate", syncStoryNodePositions);
      }

      const totalShift = Math.max(strip.scrollWidth - strip.clientWidth, 0);
      if (totalShift > 0) {
        const stripTween = gsap.to(".horizontalStrip", {
          x: -totalShift,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-horizontal-wrap]",
            start: "top top",
            end: `+=${Math.min(totalShift * 1.2, 3400)}`,
            pin: true,
            scrub: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>(".stripCard").forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0.74, y: 24, scale: 0.975 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: stripTween,
                start: "left 86%",
                end: "left 50%",
                scrub: 0.45,
              },
            },
          );

          gsap.to(card, {
            y: i % 2 === 0 ? -7 : -4,
            rotate: i % 2 === 0 ? 0.7 : -0.7,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: stripTween,
              start: "left right",
              end: "right left",
              scrub: 1,
            },
          });
        });
      }
    }, root);

    return () => {
      cleanupFns.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ctx.revert();
    };
  }, [language]);

  const t = sharedMessages[language].overview;

  return (
    <main className={styles.page} ref={rootRef}>
      <div className="page-frame">
        <SimplePageHeader rightSlot={<PageDisplayControls />} />

        <HeroSection
          onScrollNext={() => {
            if (!storyRef.current) return;
            const targetTop =
              storyRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(targetTop, 0),
              behavior: "smooth",
            });
          }}
          text={t}
        />

        <div ref={storyRef}>
          <StorySection
            onScrollNext={() =>
              thirdSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            text={t}
          />
        </div>

        <div ref={thirdSectionRef}>
          <MultiBannerSection />
        </div>

        <CapabilityChaptersSection chapters={chapters} text={t} />

        <ToolsStripSection
          language={language}
          stripRef={horizontalRef}
          text={t}
        />

        <DiscoverSection text={t} />
      </div>
    </main>
  );
}
