"use client";

import {
  IconArrowsShuffle,
  IconBrackets,
  IconFileAnalytics,
  IconFileUpload,
  IconRocket,
} from "@tabler/icons-react";
import { useId } from "react";
import styles from "./story-section.module.css";

type StoryCopy = {
  storyTitle: string;
};

type StorySectionProps = {
  text: StoryCopy;
  onScrollNext?: () => void;
};

const journeyItems = [
  {
    step: "01",
    titlePrimary: "Archivo",
    titleSecondary: "Multimedia",
    icon: IconFileUpload,
    bodyPrimary: "Convierte formatos y prepara entregables en segundos.",
    bodySecondary: "Comprime imagen, PDF o video sin salir del navegador.",
  },
  {
    step: "02",
    titlePrimary: "Datos",
    titleSecondary: "Codificación",
    icon: IconBrackets,
    bodyPrimary: "Valida estructuras y limpia payloads antes de enviarlos.",
    bodySecondary: "Codifica y decodifica valores para APIs sin errores.",
  },
  {
    step: "03",
    titlePrimary: "Texto",
    titleSecondary: "Código",
    icon: IconArrowsShuffle,
    bodyPrimary: "Transforma contenido para escribir más rápido.",
    bodySecondary: "Genera salidas limpias, copiables y listas para usar.",
  },
  {
    step: "04",
    titlePrimary: "Utilidades",
    titleSecondary: "Visuales",
    icon: IconFileAnalytics,
    bodyPrimary: "Resuelve microtareas técnicas del día a día sin fricción.",
    bodySecondary: "Valida color, contraste y gradientes con control directo.",
  },
  {
    step: "05",
    titlePrimary: "Salida",
    titleSecondary: "Continuidad",
    icon: IconRocket,
    bodyPrimary: "Copia o descarga resultados listos para compartir.",
    bodySecondary: "Encadena pasos, sin cuentas ni subidas.",
  },
];

export function StorySection({ onScrollNext }: StorySectionProps) {
  const gradientId = useId();

  return (
    <section className={styles.story} data-fade>
      <div className={styles.storyHead}>
        <p className={`${styles.kicker} storyHeadItem`}>
          <span className={styles.kickerPrimary}>RECORRIDO</span>{" "}
          <span className={styles.kickerSecondary}>DE TOOLS</span>
        </p>
        <h2 className="storyHeadItem">
          <span>Construido para developers.</span>
          <span>Evoluciona con la comunidad.</span>
        </h2>
        <p className={`${styles.lead} storyHeadItem`}>
          Gratis, sin anuncios y sin cuentas. Un entorno limpio para resolver
          microtareas técnicas sin fricción ni ruido.
        </p>
        <p className={`${styles.storyMetaLine} storyHeadItem`}>
          100% NAVEGADOR · SIN SUBIDAS · SIN CUENTA
        </p>
      </div>

      <div
        className={`${styles.timeline} storyTimeline`}
        aria-label="Flujo de herramientas"
      >
        <svg
          aria-hidden="true"
          className={styles.timelineCurve}
          preserveAspectRatio="none"
          viewBox="0 0 1000 220"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="var(--story-line-stop-1)" />
              <stop offset="14%" stopColor="var(--story-line-stop-2)" />
              <stop offset="30%" stopColor="var(--story-line-stop-3)" />
              <stop offset="48%" stopColor="var(--story-line-stop-4)" />
              <stop offset="66%" stopColor="var(--story-line-stop-5)" />
              <stop offset="84%" stopColor="var(--story-line-stop-6)" />
              <stop offset="100%" stopColor="var(--story-line-stop-7)" />
            </linearGradient>
          </defs>
          <path
            className="storyLinePath"
            d="M0 205 C 110 154, 220 220, 335 146 C 450 80, 560 158, 670 92 C 770 36, 848 62, 910 34 C 944 18, 970 10, 992 8"
            stroke={`url(#${gradientId})`}
          />
        </svg>
        {journeyItems.map((item) => (
          <article
            className={`${styles.node} ${styles[`node${item.step}` as keyof typeof styles]} storyNode`}
            key={item.step}
          >
            <div className={`${styles.bubble} storyNodeBubble`}>
              <item.icon size={26} stroke={2} />
            </div>
            <h3>
              <span>{item.titlePrimary}</span>
              <span className={styles.nodeTitleSecondary}>
                {" "}
                / {item.titleSecondary}
              </span>
            </h3>
            <p className={styles.nodePrimary}>{item.bodyPrimary}</p>
            <p className={styles.nodeSecondary}>{item.bodySecondary}</p>
          </article>
        ))}
      </div>
      <button className={styles.storyCue} onClick={onScrollNext} type="button">
        <span className={styles.storyCuePrimary}>EXPLORAR MÁS</span>{" "}
        <span className={styles.storyCueSecondary}>
          / CATEGORÍAS Y CAPACIDADES
        </span>
      </button>
    </section>
  );
}
