/**
 * App — Root component. Manages loader state, Lenis smooth scroll,
 * GSAP ScrollTrigger ticker integration, command palette, and sections.
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PhoneShowcase from '@/components/PhoneShowcase';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { ParticleEngine } from '@/engine/ParticleEngine';

// Lazy-load heavy dialog components
const CommandPalette = lazy(() => import('@/components/CommandPalette'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [particleEngine, setParticleEngine] = useState<ParticleEngine | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleXSpring = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const progressScaleX = reducedMotion ? scrollYProgress : scaleXSpring;

  // Initialize Lenis smooth scroll & sync with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    // Notify GSAP ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's unified ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  return (
    <>
      {/* Accessibility: Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FF5A1F] focus:text-white focus:font-mono focus:text-xs focus:rounded-full focus:shadow-xl focus:outline-none"
      >
        Skip to content
      </a>

      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Scroll Progress Line (fixed 2px bar, ember only, z-40 below nav z-50) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] origin-left pointer-events-none z-40"
        style={{
          scaleX: progressScaleX,
          background: 'var(--ember)',
        }}
        aria-hidden="true"
      />

      {/* Floating Navigation */}
      <Navbar onOpenCommandPalette={handleOpenCommandPalette} />

      {/* Lazy-loaded Command Palette (Ctrl+K) */}
      <Suspense fallback={null}>
        {commandPaletteOpen && (
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
        )}
      </Suspense>

      {/* Main Content Landmark */}
      <main id="main-content" role="main" className="overflow-x-clip">
        {/* Section 2: Hero & Particle Portrait */}
        <Hero
          particleEngine={particleEngine}
          setParticleEngine={setParticleEngine}
        />

        {/* Section 3: Pinned Phone Showcase (Scroll-Driven GSAP) */}
        <PhoneShowcase />

        {/* Section 4: Projects Showcase (3D Coverflow Carousel) */}
        <Projects />

        {/* Section 5: Skills (Infinite Marquee & Categorized Groups) */}
        <Skills />

        {/* Section 6: About */}
        <About />

        {/* Section 7: Contact */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
