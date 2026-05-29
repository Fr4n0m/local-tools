"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./overview.module.css";
import { SimplePageHeader } from "@/shared/presentation/components/simple-page-header";
import { PageDisplayControls } from "@/shared/presentation/components/page-display-controls";
import { HeroSection } from "./components/hero-section";
import { StorySection } from "./components/story-section";
import { MultiBannerSection } from "./components/multi-banner-section";
import { DiscoverSection } from "./components/discover-section";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

export function OverviewExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const thirdSectionRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === "localtools.language")
        setLanguage(resolveInitialLanguage());
    };
    const onLanguageChange = () => setLanguage(resolveInitialLanguage());
    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", onLanguageChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "localtools:language-change",
        onLanguageChange,
      );
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
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

      const bannerRows = gsap.utils.toArray<HTMLElement>("[data-banner-row]");
      if (bannerRows.length > 0) {
        const bannerTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".multiBannerRows",
            start: "top 88%",
            end: "top 46%",
            scrub: 1,
          },
        });

        bannerRows.forEach((row, idx) => {
          const dir = row.dataset.bannerDir === "right" ? 1 : -1;
          const offscreenDistance = window.innerWidth + row.offsetWidth;
          bannerTl.fromTo(
            row,
            { x: dir * offscreenDistance, opacity: 1 },
            { x: 0, ease: "none", duration: 0.28 },
            idx * 0.16,
          );
        });
      }

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
          <MultiBannerSection language={language} text={t} />
        </div>

        <DiscoverSection text={t} />
      </div>
    </main>
  );
}
