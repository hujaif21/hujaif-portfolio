/**
 * Contact — Section 7: Let's build something
 *
 * Left: Magnetic email action button, 72px copy button with check/copied toast,
 *       and quiet helper note.
 * Right: 4 Interactive rows (Email, LinkedIn, GitHub, Resume) with 3px sliding ember indicator,
 *        and Availability card with Ahmedabad live clock (Asia/Kolkata).
 */

import { useState, useEffect, useRef, useId } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { Container } from '@/components/Container';

interface ContactRow {
  label: string;
  handle: string;
  href: string;
  isExternal?: boolean;
  isDownload?: boolean;
  downloadName?: string;
}

const CONTACT_ROWS: ContactRow[] = [
  {
    label: 'EMAIL',
    handle: 'hujaifbelim@gmail.com',
    href: 'mailto:hujaifbelim@gmail.com?subject=Internship%20opportunity&body=Hi%20Hujaif,%20I%20came%20across%20your%20portfolio%20and%20would%20like%20to%20talk%20about...',
  },
  {
    label: 'LINKEDIN',
    handle: 'linkedin.com/in/hujaif-belim21',
    href: 'https://linkedin.com/in/hujaif-belim21',
    isExternal: true,
  },
  {
    label: 'GITHUB',
    handle: 'github.com/hujaif21',
    href: 'https://github.com/hujaif21',
    isExternal: true,
  },
  {
    label: 'RESUME',
    handle: 'Download PDF',
    href: '/resume.pdf',
    isDownload: true,
    downloadName: 'Hujaif_Belim_Resume.pdf',
  },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [kolkataTime, setKolkataTime] = useState({ hours: '', minutesPeriod: '' });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(false);

  // Magnetic button physics
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const smoothX = useSpring(magneticX, springConfig);
  const smoothY = useSpring(magneticY, springConfig);

  // prefers-reduced-motion detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 2-second safety fallback: ensure all content reveals
  useEffect(() => {
    const timer = setTimeout(() => {
      setSafetyVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Live Asia/Kolkata Clock
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        const formatted = formatter.format(now);
        const [h, rest] = formatted.split(':');
        setKolkataTime({ hours: h, minutesPeriod: rest });
      } catch (e) {
        console.error('Timezone format error', e);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Copy Email with fallback
  const handleCopyEmail = async () => {
    const email = 'hujaifbelim@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email', err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.22;
    const distY = (e.clientY - centerY) * 0.22;
    magneticX.set(Math.max(-14, Math.min(14, distX)));
    magneticY.set(Math.max(-14, Math.min(14, distY)));
  };

  const handleMouseLeave = () => {
    magneticX.set(0);
    magneticY.set(0);
  };

  // Header word stagger
  const headingWords = ["Let's", "build", "something."];

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: reducedMotion ? 0 : custom * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: reducedMotion ? 0 : custom * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  const mailtoHref =
    'mailto:hujaifbelim@gmail.com?subject=Internship%20opportunity&body=Hi%20Hujaif,%20I%20came%20across%20your%20portfolio%20and%20would%20like%20to%20talk%20about...';

  return (
    <section
      id="contact"
      className="py-24 md:py-32 relative scroll-mt-[120px] overflow-hidden seam-to-contact"
      style={{ background: 'linear-gradient(180deg, #0A0A0C 0%, #2A0A12 100%)' }}
      aria-label="Contact Information"
    >
      {/* Soft Section Glow: ember top-right plus maroon lift bottom-left */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 50% at 85% 15%, rgba(255, 90, 31, 0.08), transparent), radial-gradient(60% 50% at 15% 85%, rgba(122, 31, 43, 0.20), transparent)',
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
            05 / CONTACT
          </span>
          <h2 className="heading-lg text-[2.5rem] sm:text-[3.75rem] text-[var(--text)] leading-[1] mb-4 flex flex-wrap gap-x-3">
            {headingWords.map((word, wIdx) => (
              <motion.span
                key={word}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                animate={safetyVisible ? 'visible' : undefined}
                viewport={{ once: true, amount: 0.15 }}
                custom={wIdx}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <p className="body-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            I'm open to Flutter / App Developer and SWE internships. Email is the fastest way to reach me.
          </p>
        </div>

        {/* ============================================================
            2. 12-COLUMN GRID (Cols 1-7 Left, Cols 8-12 Right)
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* --------------------------------------------------------
              LEFT: PRIMARY ACTION (Cols 1-7)
              -------------------------------------------------------- */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            animate={safetyVisible ? 'visible' : undefined}
            viewport={{ once: true, amount: 0.15 }}
            custom={0}
            className="lg:col-span-7 flex flex-col gap-5"
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Magnetic Email Pill Button */}
              <motion.a
                href={mailtoHref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  x: reducedMotion ? 0 : smoothX,
                  y: reducedMotion ? 0 : smoothY,
                }}
                className="group relative flex-1 h-16 sm:h-[72px] px-6 sm:px-8 rounded-full bg-[#FF5A1F] hover:bg-[#D9420A] text-white flex items-center justify-between gap-3 transition-colors shadow-sm cursor-pointer select-none"
              >
                <span className="font-serif text-[19px] sm:text-[22px] tracking-tight truncate font-normal">
                  hujaifbelim@gmail.com
                </span>
                <ArrowUpRight
                  size={22}
                  className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </motion.a>

              {/* 72px Circular Outline Copy Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] flex items-center justify-center transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
                >
                  {copied ? (
                    <Check size={22} className="text-[#FF5A1F] animate-in zoom-in-50 duration-200" />
                  ) : (
                    <Copy size={22} className="text-[var(--text)] transition-colors" />
                  )}
                </button>

                {/* Animated "Copied" Pill Indicator */}
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[var(--bg-black)] border border-[var(--line)] text-[var(--text)] text-[11px] font-mono shadow-md z-20"
                    aria-live="polite"
                  >
                    Copied
                  </motion.div>
                )}
              </div>
            </div>

            {/* Helper Note */}
            <p className="font-mono text-xs text-[var(--text-faint)] select-none pl-1">
              Usually the quickest way to start a conversation.
            </p>
          </motion.div>

          {/* --------------------------------------------------------
              RIGHT: CONTACT ROWS & AVAILABILITY (Cols 8-12)
              -------------------------------------------------------- */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            animate={safetyVisible ? 'visible' : undefined}
            viewport={{ once: true, amount: 0.15 }}
            custom={1}
            className="lg:col-span-5 flex flex-col"
          >
            {/* 4 Contact Rows with Hairline Dividers */}
            <div className="flex flex-col border-t border-[var(--line)]">
              {CONTACT_ROWS.map((row) => (
                <a
                  key={row.label}
                  href={row.href}
                  target={row.isExternal ? '_blank' : undefined}
                  rel={row.isExternal ? 'noopener noreferrer' : undefined}
                  download={row.isDownload ? row.downloadName : undefined}
                  className="group relative h-[72px] px-2 flex items-center justify-between border-b border-[var(--line)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-xs transition-colors duration-400 hover:bg-[var(--surface)]"
                >
                  {/* Sliding 3px Ember indicator on left */}
                  <span className="w-[3px] bg-[#FF5A1F] rounded-full absolute left-0 top-3 bottom-3 scale-y-0 group-hover:scale-y-100 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none" />

                  <div className="flex items-center gap-4 min-w-0 pr-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-faint)] w-20 shrink-0 transition-colors duration-300 group-hover:text-[#FF5A1F]">
                      {row.label}
                    </span>
                    <span className="text-[16px] text-[var(--text)] font-medium truncate transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                      {row.handle}
                    </span>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-[var(--text-muted)] shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[var(--text)] group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>
              ))}
            </div>

            {/* Availability Card with Live Ahmedabad Clock */}
            <div className="card-dark mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[var(--text)] bg-[rgba(255,90,31,0.12)] border border-[rgba(255,90,31,0.25)] mb-4 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider font-medium">
                  Open to internships
                </span>
              </div>

              {/* Detail Rows */}
              <div className="flex flex-col divide-y divide-[var(--line)] text-sm">
                <div className="py-2.5 flex items-center justify-between first:pt-0">
                  <span className="font-mono text-xs text-[var(--text-faint)] uppercase tracking-wider">
                    Based in
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    Ahmedabad, India
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between last:pb-0">
                  <span className="font-mono text-xs text-[var(--text-faint)] uppercase tracking-wider">
                    Local time
                  </span>
                  <span className="font-mono text-sm font-medium text-[var(--text)] flex items-center gap-0.5">
                    {mounted ? (
                      <>
                        <span>{kolkataTime.hours}</span>
                        <span className="animate-pulse text-[#FF5A1F] font-bold mx-0.5">:</span>
                        <span>{kolkataTime.minutesPeriod} IST</span>
                      </>
                    ) : (
                      <span>--:-- IST</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

