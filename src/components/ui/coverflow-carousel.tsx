import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, Github, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/Container";

// Lazy-load VideoModal
const VideoModal = React.lazy(() => import("@/components/VideoModal"));

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  /** Optional. When empty, a clean placeholder card is shown instead. */
  src?: string;
  alt: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Small mono index shown on cards, e.g. "01". */
  index?: string;
  status?: string;
  /** Primary project URL */
  href?: string;
  repoUrl?: string;
  appUrl?: string;
  designUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  linkLabel?: string;
  meta?: { label: string; value: string }[];
  /** Sizing fit for image cards: "cover" (default, 9:16 portrait) or "contain" (for wide web screens). */
  fit?: "cover" | "contain";
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width. Smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it. */
  cardWidth?: string;
  /** Card height divided by card width. 16/9 is a 9:16 portrait. */
  cardRatio?: number;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  /** Text shown on placeholder cards. */
  placeholderHint?: string;
  /** Called when the already-centered card is clicked or tapped. */
  onActivate?: (slide: CoverflowSlide, index: number) => void;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.07,
  cardWidth = "clamp(170px, 17vw, 250px)",
  cardRatio = 16 / 9,
  gap = 0.08,
  loop = true,
  placeholderHint = "Drop screenshot here",
  onActivate,
  label = "Projects carousel",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    y: number;
    pos: number;
    v: number;
    t: number;
    movedX: number;
    movedY: number;
    downIndex: number | null;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [videoModal, setVideoModal] = React.useState<{
    isOpen: boolean;
    url: string;
    title: string;
  } | null>(null);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM so 60 updates a second never re-render React.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on so a far card never turns its back.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      // Emphasize the center card: scale 1.04 and stage halo lighting
      const centerFactor = Math.max(0, 1 - distance);
      const scale = 1 + centerFactor * 0.04;

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg) scale(${scale})`;

      if (distance < 0.5) {
        card.style.boxShadow =
          "0 0 0 1px rgba(255,90,31,0.35), 0 30px 80px -20px rgba(255,90,31,0.25), 0 0 120px rgba(122,31,43,0.5)";
      } else {
        card.style.boxShadow = "none";
      }

      // Card is teleported across the ring at half a turn out
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      const baseOpacity = Math.max(0.4, 1 - fade * distance);
      card.style.opacity = String(baseOpacity * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const hit = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-index]",
    );
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      movedX: 0,
      movedY: 0,
      downIndex: hit ? Number(hit.dataset.index) : null,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    drag.movedX = Math.max(drag.movedX, Math.abs(event.clientX - drag.x));
    drag.movedY = Math.max(drag.movedY, Math.abs(event.clientY - drag.y));

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;

    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

    // Any movement in X or Y greater than 8px indicates dragging or scrolling, NOT a tap
    const totalMovement = Math.hypot(drag.movedX, drag.movedY);

    if (totalMovement < 8 && drag.downIndex !== null) {
      const centre = indexAt(posRef.current);
      if (drag.downIndex === centre) {
        settle(clamp(Math.round(posRef.current)));
        // On touch devices, disable tapping the card directly to open links!
        // Permanent action buttons below the card are used instead.
        if (!isTouch) {
          const slide = slides[centre];
          if (slide?.repoUrl || slide?.appUrl || slide?.designUrl || slide?.liveUrl || slide?.href) {
            onActivate?.(slide, centre);
          }
        }
      } else {
        goTo(drag.downIndex);
      }
      return;
    }

    const pitch = widthRef.current * (1 + gap);
    const fling = Math.min(1.5, Math.abs(drag.v) / 600);
    const throwDistance = pitch ? (-drag.v * 0.18) / pitch : 0;
    const destination = Math.round(
      posRef.current + Math.sign(throwDistance) * fling,
    );
    settle(clamp(destination));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        nudge(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        nudge(1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(count - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        const slide = slides[selected];
        if (slide?.repoUrl || slide?.appUrl || slide?.designUrl || slide?.liveUrl || slide?.href) {
          onActivate?.(slide, selected);
        }
        break;
      default:
        break;
    }
  };

  // Re-measure on mount, resize, and font load.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const card = cardRefs.current.find(Boolean);
      if (card) {
        // Use offsetWidth which returns the un-transformed CSS layout width!
        // getBoundingClientRect().width returns the 3D-rotated projection which crushes cards.
        const layoutWidth = card.offsetWidth;
        if (layoutWidth > 0) {
          widthRef.current = layoutWidth;
          paint();
        }
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [paint]);

  const active = slides[selected] ?? slides[0];
  const activeStatus =
    active?.status ??
    active?.meta?.find((m) => m.label.toLowerCase() === "status")?.value;
  const filteredMeta =
    active?.meta?.filter((m) => m.label.toLowerCase() !== "status") ?? [];

  return (
    <div
      className={cn("w-full flex flex-col", className)}
      style={
        {
          "--cf-card": cardWidth,
          "--cf-perspective": `${perspective * 1000}px`,
        } as React.CSSProperties
      }
    >
      {/* ============================================================
          FULL-BLEED 3D CAROUSEL STAGE
          Spans full width, symmetric, cards fade out evenly left and right.
          py-14 so shadows are not clipped.
          ============================================================ */}
      <div
        className="w-full overflow-x-hidden py-14 select-none relative flex flex-col items-center justify-center"
        style={{ perspective: "var(--cf-perspective)" }}
      >
        {/* Floor Glow and Horizon Line (directly under stage behind cards) */}
        <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[1200px] px-6 md:px-10 z-0 flex flex-col items-center">
          {/* (a) Ellipse Floor Glow: about 60% of container width, 90px tall */}
          <div
            className="w-[60%] h-[90px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 90, 31, 0.22), transparent 70%)',
              filter: 'blur(24px)',
            }}
          />
          {/* (b) 1px Horizon Line across container width */}
          <div
            className="w-full h-[1px] -mt-[45px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(244, 238, 227, 0.10) 20%, rgba(244, 238, 227, 0.10) 80%, transparent)',
            }}
          />
        </div>

        <div
          ref={frameRef}
          tabIndex={0}
          role="region"
          aria-label={label}
          aria-roledescription="carousel"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="relative z-10 w-full flex items-center justify-center cursor-grab active:cursor-grabbing outline-none"
          style={{
            height: `calc(var(--cf-card) * ${cardRatio})`,
            transformStyle: "preserve-3d",
            touchAction: "pan-y",
          }}
        >
          {slides.map((slide, index) => {
            const isNearCenter =
              Math.abs(index - selected) <= 1 ||
              Math.abs(index - selected) >= count - 1;
            const isEager = isNearCenter;
            const slideFit = slide.fit ?? "cover";

            return (
              <div
                key={index}
                data-index={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}: ${slide.title}`}
                className={cn(
                  "absolute left-1/2 top-0 overflow-hidden rounded-[28px] bg-[var(--surface)] will-change-transform cursor-pointer border border-[rgba(244,238,227,0.14)]",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  height: `calc(var(--cf-card) * ${cardRatio})`,
                }}
              >
                {slide.src ? (
                  slideFit === "contain" ? (
                    /* WIDE WEB SCREEN CARD: Browser header + object-contain image */
                    <div className="relative w-full h-full bg-[var(--surface)] flex flex-col justify-between overflow-hidden rounded-[28px]">
                      {/* Slim browser top bar */}
                      <div className="h-6 px-3 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-strong)] shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--line)]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--line)]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--line)]" />
                        </div>
                        <span className="font-mono text-[9px] text-[var(--text-faint)] tracking-wider truncate max-w-[110px]">
                          {slide.title.toLowerCase().replace(/\s+/g, "")}
                        </span>
                        <div className="w-4" />
                      </div>

                      {/* Center the screenshot below using object-contain with its natural aspect ratio */}
                      <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={slide.src}
                          alt={slide.alt}
                          draggable={false}
                          loading={isEager ? "eager" : "lazy"}
                          decoding="async"
                          className="max-w-full max-h-full object-contain rounded-lg select-none shadow-xs border border-[var(--line)]"
                        />
                      </div>

                      {slide.index && (
                        <span className="absolute bottom-2.5 left-3 z-10 font-mono text-[10px] tracking-widest text-[var(--text)] bg-[rgba(20,6,10,0.85)] backdrop-blur-md px-2 py-0.5 rounded border border-[var(--line)]">
                          {slide.index}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* PHONE SCREEN CARD: Full card object-cover object-top (no padding, no beige bands) */
                    <div className="relative w-full h-full overflow-hidden rounded-[28px]">
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        draggable={false}
                        loading={isEager ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full select-none object-cover object-top"
                      />
                      {slide.index && (
                        <span className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-widest text-[var(--text)] bg-[rgba(20,6,10,0.85)] backdrop-blur-md px-2 py-0.5 rounded border border-[var(--line)]">
                          {slide.index}
                        </span>
                      )}
                    </div>
                  )
                ) : (
                  /* PLACEHOLDER CARD: Clean portrait layout */
                  <div className="flex h-full w-full flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-5 select-none rounded-[28px]">
                    <span className="font-mono text-[11px] tracking-widest text-[var(--text-faint)]">
                      {slide.index}
                    </span>
                    <span className="font-display text-center text-[clamp(18px,2.2vw,26px)] leading-tight text-[var(--text)] font-normal">
                      {slide.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)] text-center">
                      {placeholderHint}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          CAPTION PANEL (Inside Container, max-w-[1000px])
          Wrapped in a centered panel, mt-10 (40px margin top)
          border-radius 28px, background rgba(255,255,255,0.05),
          1px border rgba(244,238,227,0.12),
          padding 32px on mobile (p-8) and 40px on desktop (md:p-10),
          min-h prevents layout jumping during transitions.
          ============================================================ */}
      <Container className="mt-10">
        <div className="mx-auto w-full max-w-[1000px] rounded-[28px] border border-[rgba(244,238,227,0.12)] bg-[rgba(255,255,255,0.05)] p-8 md:p-10 relative overflow-hidden min-h-[460px] sm:min-h-[380px] md:min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full flex flex-col"
            >
              {/* Decorative Project Index in Panel's Top-Left */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-serif text-[56px] leading-none text-[rgba(244,238,227,0.18)] select-none font-normal">
                  {active?.index ?? String(selected + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-sm tracking-widest text-[var(--text-faint)] select-none">
                  / {String(count).padStart(2, "0")}
                </span>
              </div>

              {/* Two-Column Arrangement inside panel with 40px gap (gap-10) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                {/* Left Column: Status, Title, Description, Buttons (7/12) */}
                <div className="md:col-span-7 flex flex-col items-start text-left">
                  {activeStatus && (
                    <span className="label-mono px-3 py-1 rounded-full text-[0.625rem] font-semibold mb-3 inline-block status-chip">
                      {activeStatus}
                    </span>
                  )}

                  <h3 className="font-serif text-[clamp(32px,3.8vw,44px)] leading-[1.05] tracking-tight text-[var(--text)] mb-3">
                    {active?.title}
                  </h3>

                  <p className="text-[15px] leading-[1.65] text-[var(--text-muted)] max-w-[46ch]">
                    {active?.description || active?.subtitle}
                  </p>

                  {/* Action buttons — permanently visible beneath description for flawless touch & desktop UX */}
                  <div className="mt-6 flex items-center gap-3 flex-wrap">
                    {/* If repoUrl exists: show "View Repo" (GitHub icon) */}
                    {Boolean(active?.repoUrl && active.repoUrl.trim() !== "") && (
                      <a
                        href={active.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-11 min-h-[44px] px-5 rounded-full text-xs font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm"
                      >
                        <Github className="size-4" />
                        <span>View Repo</span>
                      </a>
                    )}

                    {/* If appUrl exists: show "Live App" (arrow-up-right icon) */}
                    {Boolean(active?.appUrl && active.appUrl.trim() !== "") && (
                      <a
                        href={active.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-11 min-h-[44px] px-5 rounded-full text-xs font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm"
                      >
                        <span>Live App</span>
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}

                    {/* If designUrl exists: show "View Design" */}
                    {Boolean(active?.designUrl && active.designUrl.trim() !== "") && (
                      <a
                        href={active.designUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-11 min-h-[44px] px-5 rounded-full text-xs font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm"
                      >
                        <span>View Design</span>
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}

                    {/* If liveUrl exists: show "Live App" */}
                    {Boolean(active?.liveUrl && active.liveUrl.trim() !== "") && (
                      <a
                        href={active.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-11 min-h-[44px] px-5 rounded-full text-xs font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm"
                      >
                        <span>Live App</span>
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}

                    {/* If videoUrl exists: show "Watch Demo" (play icon, outline style) */}
                    {Boolean(active?.videoUrl && active.videoUrl.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() =>
                          setVideoModal({
                            isOpen: true,
                            url: active.videoUrl!,
                            title: active.title,
                          })
                        }
                        className="inline-flex items-center gap-2 h-11 min-h-[44px] px-5 rounded-full text-xs font-medium text-[var(--text)] border border-[rgba(244,238,227,0.28)] hover:bg-[var(--surface-strong)] transition-colors cursor-pointer"
                      >
                        <Play className="size-3.5 fill-current" />
                        <span>Watch Demo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Definition List (5/12) */}
                <div className="md:col-span-5 w-full">
                  <dl className="w-full text-[13px] border-t border-[var(--line)] md:border-t-0">
                    {filteredMeta.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-[10px]"
                      >
                        <dt className="w-[96px] shrink-0 font-mono text-[11px] uppercase tracking-wider text-[var(--text-faint)] text-left">
                          {row.label}
                        </dt>
                        <dd className="text-right font-medium text-[var(--text)] flex-1 break-words">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ============================================================
            CONTROLS ROW: Prev button + dots + Next button
            32px below caption
            ============================================================ */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => nudge(-1)}
            className="size-10 rounded-full border border-[var(--line)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] hover:bg-[#FF5A1F] hover:text-white hover:border-[#FF5A1F] transition-all cursor-pointer shadow-none"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to ${slide.title}`}
                aria-current={index === selected}
                onClick={() => goTo(index)}
                className={cn(
                  "rounded-full transition-all cursor-pointer",
                  index === selected
                    ? "w-6 h-2 bg-[#FF5A1F]"
                    : "size-2 bg-[var(--line)] hover:bg-[rgba(244,238,227,0.3)]",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next project"
            onClick={() => nudge(1)}
            className="size-10 rounded-full border border-[var(--line)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] hover:bg-[#FF5A1F] hover:text-white hover:border-[#FF5A1F] transition-all cursor-pointer shadow-none"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* ============================================================
            INTERACTION HINT
            24px below controls row
            ============================================================ */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
            DRAG, SWIPE OR USE THE ARROW KEYS. CLICK THE CENTERED CARD TO OPEN IT.
          </p>
        </div>
      </Container>

      {/* Watch Demo Video Modal */}
      {videoModal?.isOpen && (
        <React.Suspense fallback={null}>
          <VideoModal
            isOpen={Boolean(videoModal?.isOpen)}
            onClose={() => setVideoModal(null)}
            currentVideoUrl={videoModal?.url}
          />
        </React.Suspense>
      )}
    </div>
  );
}
