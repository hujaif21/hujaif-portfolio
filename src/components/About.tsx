/**
 * About — Section 6: Background & Philosophy
 *
 * Left: Interactive Portrait Card with hover B&W, tap toggle, and spring tilt.
 * Right: Editorial story, animated count-up stats row, "Right Now" card,
 *        3 principles, and resume/work CTA buttons.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FileDown, ArrowDown } from 'lucide-react';
import { Container } from '@/components/Container';

interface StatProps {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  sublabel?: string;
  inView: boolean;
  reducedMotion: boolean;
}

function StatCounter({
  value,
  decimals = 0,
  suffix = '',
  label,
  sublabel,
  inView,
  reducedMotion,
}: StatProps) {
  const [displayValue, setDisplayValue] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    if (!inView) return;

    let startTime: number | null = null;
    const duration = 1200; // 1.2s

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = progress === 1 ? value : ease * value;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reducedMotion]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);

  return (
    <div className="flex flex-col px-3 sm:px-4 first:pl-0 last:pr-0">
      <span className="font-serif text-3xl sm:text-4xl text-[var(--text)] font-normal leading-none tracking-tight">
        {formatted}
        {suffix}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-faint)] mt-2">
        {label}
        {sublabel && <span className="opacity-70 lowercase"> {sublabel}</span>}
      </span>
    </div>
  );
}

export default function About() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [statsInView, setStatsInView] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Safety fallback: reveal all elements within 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSafetyVisible(true);
      setStatsInView(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Stats Intersection Observer
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Tilt spring physics (max 4 degrees, desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleToggleTouch = () => {
    setIsToggled((prev) => !prev);
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section
      id="about"
      className="py-24 md:py-32 relative scroll-mt-[120px] overflow-hidden seam-navy-to-maroon"
      style={{ background: 'linear-gradient(180deg, #2A0A12 0%, #34101A 100%)' }}
      aria-label="About Hujaif Belim"
    >
      {/* Soft Section Glow: radial lift behind photo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(60% 50% at 20% 50%, rgba(122, 31, 43, 0.40), transparent)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10">
        {/* ============================================================
            1. CONSISTENT SECTION HEADER
            ============================================================ */}
        <div className="mb-14">
          <span className="label-mono font-medium text-[0.6875rem] tracking-widest mb-3 flex items-center text-[var(--text-faint)]">
            <span className="gold-diamond" aria-hidden="true" />
            04 / ABOUT
          </span>
          <h2 className="heading-lg text-[2.5rem] sm:text-[3.75rem] text-[var(--text)] leading-[1] mb-4">
            Background & Philosophy.
          </h2>
          <p className="body-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            A student who ships apps, designs interfaces and likes finishing what he starts.
          </p>
        </div>

        {/* ============================================================
            2. 12-COLUMN GRID (Cols 1-5 Left, Cols 7-12 Right)
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: PORTRAIT CARD (Cols 1-5) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleToggleTouch}
              style={{
                perspective: 1000,
                rotateX: reducedMotion ? 0 : rotateX,
                rotateY: reducedMotion ? 0 : rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full aspect-[4/5] max-h-[70vh] rounded-[28px] overflow-hidden border border-[var(--line)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] cursor-pointer select-none transition-transform duration-500 hover:-translate-y-1 group"
              data-cursor="View"
            >
              <img
                src="/pfp.jpeg"
                alt="Portrait of Hujaif Belim"
                draggable={false}
                loading="lazy"
                decoding="async"
                width={420}
                height={525}
                className={`w-full h-full object-cover select-none transition-[filter,transform] duration-500 ease-out group-hover:grayscale ${
                  isToggled ? 'grayscale' : 'grayscale-0'
                }`}
              />

              {/* Gradient vignette for bottom pill contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Overlaid Bottom Pills */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <span className="font-mono text-[11px] text-[var(--text)] bg-[rgba(20,6,10,0.85)] backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--line)] shadow-xs">
                  Ahmedabad, India
                </span>

                <span className="font-mono text-[11px] text-[var(--text)] bg-[rgba(255,90,31,0.12)] backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(255,90,31,0.25)] shadow-xs flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                  <span>Open to internships</span>
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: CONTENT BLOCKS (Cols 7-12) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* 1) Story (3 short paragraphs) */}
            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              animate={safetyVisible ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.15 }}
              custom={0}
              className="flex flex-col gap-4 text-[17px] leading-[1.7] text-[var(--text-muted)] max-w-[56ch]"
            >
              <p>
                I'm an IMCA student at LJ University in Ahmedabad. I build mobile apps with Flutter and Dart, with Python and FastAPI behind them.
              </p>
              <p>
                I like projects that become something people can actually use: a food scanner that reads real calories and macros, a step counter that counts real steps, and an interview simulator that scores real answers.
              </p>
              <p>
                Alongside code, I design interfaces in Figma with accessibility in mind, and I use LLM APIs and AI tools as part of how I build.
              </p>
            </motion.div>

            {/* 2) Stats row (animated count-up) */}
            <motion.div
              ref={statsRef}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              animate={safetyVisible ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.15 }}
              custom={1}
              className="py-6 border-y border-[var(--line)]"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[var(--line)]">
                <StatCounter
                  value={5}
                  suffix="th"
                  label="Semester"
                  inView={statsInView}
                  reducedMotion={reducedMotion}
                />
                <StatCounter
                  value={8.95}
                  decimals={2}
                  label="CGPA"
                  sublabel="(Sem 4)"
                  inView={statsInView}
                  reducedMotion={reducedMotion}
                />
                <StatCounter
                  value={7}
                  label="Projects"
                  inView={statsInView}
                  reducedMotion={reducedMotion}
                />
                <StatCounter
                  value={3}
                  label="Team Projects"
                  inView={statsInView}
                  reducedMotion={reducedMotion}
                />
              </div>
            </motion.div>

            {/* 3) "Right now" card */}
            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              animate={safetyVisible ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.15 }}
              custom={2}
              className="card-dark rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-faint)] block mb-3 font-semibold">
                RIGHT NOW
              </span>

              <div className="flex flex-col text-sm divide-y divide-[var(--line)]">
                <div className="flex flex-col sm:flex-row sm:items-baseline py-2.5 first:pt-0 gap-1 sm:gap-4">
                  <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-wider text-[var(--text-faint)]">
                    Building
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    FitZen and MockMate AI
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline py-2.5 gap-1 sm:gap-4">
                  <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-wider text-[var(--text-faint)]">
                    Studying
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    IMCA, 5th semester
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline py-2.5 last:pb-0 gap-1 sm:gap-4">
                  <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-wider text-[var(--text-faint)]">
                    Looking for
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    Flutter / App Developer and SWE internships
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 4) Principles (3 equal cards in a row, stacked on mobile) */}
            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              animate={safetyVisible ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.15 }}
              custom={3}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="card-dark rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between shadow-xs">
                <div>
                  <span className="font-mono text-xs text-[var(--text-faint)] block mb-2 font-medium">
                    01
                  </span>
                  <h4 className="font-serif text-lg text-[var(--text)] font-semibold mb-1.5 leading-snug">
                    Ship it end to end
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2">
                  I like finishing the whole thing, from idea to a working release, as with NotMyFault.
                </p>
              </div>

              <div className="card-dark rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between shadow-xs">
                <div>
                  <span className="font-mono text-xs text-[var(--text-faint)] block mb-2 font-medium">
                    02
                  </span>
                  <h4 className="font-serif text-lg text-[var(--text)] font-semibold mb-1.5 leading-snug">
                    Design for everyone
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2">
                  Contrast, spacing and readable type are part of the work. My FreshCart design system meets WCAG AA.
                </p>
              </div>

              <div className="card-dark rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between shadow-xs">
                <div>
                  <span className="font-mono text-xs text-[var(--text-faint)] block mb-2 font-medium">
                    03
                  </span>
                  <h4 className="font-serif text-lg text-[var(--text)] font-semibold mb-1.5 leading-snug">
                    Use AI as a teammate
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2">
                  I pair with AI tools to move faster, and I test and review what ships.
                </p>
              </div>
            </motion.div>

            {/* 5) Action Buttons */}
            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              animate={safetyVisible ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.15 }}
              custom={4}
              className="flex items-center gap-3 pt-2 flex-wrap"
            >
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-6 rounded-full text-sm font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>Download resume</span>
                <FileDown size={15} />
              </a>

              <button
                onClick={() => {
                  const el = document.getElementById('projects');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-11 px-6 rounded-full text-sm font-medium text-[var(--text)] border border-[var(--line)] hover:bg-[var(--surface-strong)] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>See my work</span>
                <ArrowDown size={15} />
              </button>
            </motion.div>

          </div>

        </div>
      </Container>
    </section>
  );
}

