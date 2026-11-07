/**
 * Projects — Section 4: Projects Carousel Showcase
 *
 * Full-bleed 3D Coverflow Carousel with 9:16 portrait cards,
 * responsive card widths, and centered pagination & navigation controls.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/Container";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { PROJECTS } from "@/data/projects";

export default function Projects() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section
      id="projects"
      className="py-24 md:py-32 relative scroll-mt-[120px] overflow-hidden"
      style={{
        background: `
          radial-gradient(60% 45% at 50% 42%, rgba(122, 31, 43, 0.50) 0%, rgba(58, 16, 27, 0.28) 40%, transparent 72%),
          linear-gradient(180deg, #2A0A12 0%, #0A0A0C 22%, #0A0A0C 78%, #0B1226 100%)
        `,
      }}
      aria-label="Projects Showcase"
    >
      {/* Decorative Grid Texture (Behind content, z-0) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(244, 238, 227, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244, 238, 227, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)',
        }}
      />

      {/* 1. Consistent Section Header (inside Container, 56px bottom margin) */}
      <Container className="relative z-10">
        <div className="mb-14 text-center flex flex-col items-center">
          <span className="label-mono font-medium text-[0.6875rem] tracking-widest mb-3 flex items-center justify-center gap-2 text-[var(--text-faint)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" aria-hidden="true" />
            PROJECTS
          </span>
          <h2 className="heading-lg text-[2.5rem] sm:text-[3.75rem] text-[var(--text)] leading-[1] mb-4">
            Crafted with attention.
          </h2>
          <p className="body-sm text-[var(--text-muted)] max-w-lg leading-relaxed text-center">
            Selected mobile applications, system architectures, and client deliverables.
          </p>
        </div>
      </Container>

      {/* 2. Full-bleed 3D Carousel & Controls */}
      <div className="w-full relative z-10">
        <CoverflowCarousel
          slides={PROJECTS}
          cardWidth={isMobile ? "clamp(140px, 42vw, 190px)" : "clamp(170px, 17vw, 250px)"}
          cardRatio={16 / 9}
          gap={0.08}
          fade={0.07}
          onActivate={(slide) => {
            const url = slide.repoUrl || slide.appUrl || slide.designUrl || slide.liveUrl || slide.href;
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          }}
          label="Selected Projects"
        />
      </div>
    </section>
  );
}
