/**
 * Hero — The particle portrait section.
 *
 * Left side: big headline, subline, labels, CTA buttons.
 * Right side: canvas with the particle portrait (interactive).
 * Press-and-hold reveals the real photo through a circular clip.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, FileDown } from 'lucide-react';
import { ParticleEngine } from '@/engine/ParticleEngine';
import MagneticButton from './MagneticButton';
import { Container } from './Container';

interface HeroProps {
  particleEngine?: ParticleEngine | null;
  setParticleEngine?: (engine: ParticleEngine) => void;
  loaderDone?: boolean;
}

/** Word-by-word reveal animation */
const headlineVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Hero({ particleEngine, setParticleEngine }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  // Keep the latest callback in a ref so a new function from the parent never re-creates the engine
  const setParticleEngineRef = useRef(setParticleEngine);
  setParticleEngineRef.current = setParticleEngine;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const isVisible = true;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Initialize particle engine
  useEffect(() => {
    if (!canvasRef.current || reducedMotion) return;

    const canvas = canvasRef.current;
    const isMobile = window.innerWidth < 768;
    const isLowPower = typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const maxParticles = isMobile || isLowPower ? 3000 : 9000;
    const spacing = isMobile || isLowPower ? 5 : 4;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const engine = new ParticleEngine({
      canvas,
      imageSrc: '/pfp.jpeg',
      maxParticles,
      spacing,
      cursorRadius: isMobile ? 65 : 80,
      springStiffness: 0.08,
      damping: 0.85,
      repulsionForce: isMobile ? 8 : 6,
      onReady: () => {
        engine.start();
      },
      onFirstFrame: () => {
        setCanvasReady(true);
        // Re-measure geometry right after fade-in finishes
        setTimeout(() => {
          engine.resize();
        }, 420);
      },
    });

    engineRef.current = engine;
    setParticleEngineRef.current?.(engine);

    // Geometry handlers
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Re-measure after fonts load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        engine.resize();
      });
    }

    // ResizeObserver on the portrait container for exact geometry syncing
    let ro: ResizeObserver | null = null;
    if (portraitContainerRef.current) {
      ro = new ResizeObserver(() => {
        engine.resize();
      });
      ro.observe(portraitContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      ro?.disconnect();
      engine.destroy();
    };
  }, [reducedMotion]);

  // Passive pointer listeners attached directly to the portrait container
  useEffect(() => {
    const container = portraitContainerRef.current;
    if (!container || reducedMotion) return;

    const onPointerMove = (e: PointerEvent) => {
      engineRef.current?.start();
      engineRef.current?.setCursor(e.clientX, e.clientY);
      if (e.pointerType === 'touch' || e.buttons > 0) {
        engineRef.current?.setHolding(true, e.clientX, e.clientY);
      }
    };

    const onPointerLeave = () => {
      engineRef.current?.clearCursor();
      engineRef.current?.setHolding(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
      } catch {}
      engineRef.current?.start();
      engineRef.current?.setHolding(true, e.clientX, e.clientY);
      engineRef.current?.setCursor(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}
      engineRef.current?.clearCursor();
      engineRef.current?.setHolding(false);
    };

    const onPointerCancel = (e: PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}
      engineRef.current?.clearCursor();
      engineRef.current?.setHolding(false);
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    container.addEventListener('pointerup', onPointerUp, { passive: true });
    container.addEventListener('pointercancel', onPointerCancel, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  // Synchronous visibility gate & off-screen pausing via IntersectionObserver
  useEffect(() => {
    if (!sectionRef.current) return;

    // Hero starts active immediately on page load
    engineRef.current?.start();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          engineRef.current?.start();
        } else {
          // Never stop the animation loop if we are at or near the top of the page
          if (window.scrollY < 300) {
            engineRef.current?.start();
            return;
          }
          engineRef.current?.stop();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Stream particles on scroll past hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 40 && scrollY < 900) {
        engineRef.current?.streamOnScroll(scrollY - 40);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pause when tab is hidden, resume when tab is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        engineRef.current?.stop();
      } else if (window.scrollY < 300) {
        engineRef.current?.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const scrollToWork = () => {
    const el = document.getElementById('work');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center py-20 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #34101A 0%, #2A0A12 100%)',
      }}
      aria-label="Introduction"
    >
      {/* Soft radial highlight behind the portrait */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] z-0 opacity-80"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255, 90, 31, 0.10), rgba(122, 31, 43, 0.35) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            zIndex: 2,
          }}
        >
          {/* Mono labels */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            custom={0}
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span className="label-mono">Ahmedabad, India</span>
            <span className="label-mono flex items-center gap-1.5 status-chip px-3 py-1 rounded-full text-[0.625rem] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
              Open to internships
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="heading-xl"
            variants={headlineVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          >
            {['Hujaif', 'Belim'].map((word) => (
              <motion.span
                key={word}
                variants={wordVariants}
                style={{ display: 'inline-block', marginRight: '0.3em' }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              variants={wordVariants}
              style={{ display: 'inline-block' }}
            >
              <span className="italic-accent">Flutter</span>
              {' '}
              Developer
            </motion.span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            className="body-lg"
            variants={fadeUpVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            custom={0.4}
            style={{ maxWidth: '440px', color: 'var(--text-muted)' }}
          >
            I build fast, polished mobile apps.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            custom={0.6}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <MagneticButton
              variant="primary"
              onClick={scrollToWork}
              cursorLabel="View"
              aria-label="View my work"
            >
              <span>View my work</span>
              <ArrowDown size={16} />
            </MagneticButton>

            <MagneticButton
              href="/resume.pdf"
              cursorLabel="Download"
              aria-label="Download resume"
            >
              <span>Download resume</span>
              <FileDown size={16} />
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right: Particle Canvas Portrait with Press-and-Hold Reveal */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          custom={0.2}
          className="relative w-full aspect-[4/5] max-h-[70vh] flex items-center justify-center lg:justify-end"
        >
          <div
            ref={portraitContainerRef}
            className="relative w-full max-w-[420px] aspect-[4/5] rounded-[28px] overflow-hidden border border-[var(--line)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] cursor-crosshair select-none"
            style={{ touchAction: 'none' }}
          >
            {reducedMotion ? (
              <img
                src="/pfp.jpeg"
                alt="Portrait of Hujaif Belim"
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover block relative z-10"
                style={{
                  touchAction: 'none',
                  opacity: canvasReady ? 1 : 0,
                  transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'auto',
                }}
              />
            )}

            {/* Subtle gradient vignette at bottom */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-20"
              aria-hidden="true"
            />

            {/* Overlaid Bottom Pills */}
            <div
              className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <span className="font-mono text-[11px] text-[var(--text)] bg-[rgba(20,6,10,0.85)] backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--line)] shadow-xs pointer-events-none">
                Hold to reveal
              </span>

              <span className="font-mono text-[11px] text-[var(--text)] bg-[rgba(255,90,31,0.12)] backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(255,90,31,0.25)] shadow-xs flex items-center gap-1.5 font-medium pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                <span>Interactive</span>
              </span>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}