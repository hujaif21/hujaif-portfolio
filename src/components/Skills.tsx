/**
 * Skills — Section 5: Toolkit & Competencies (The Ledger)
 *
 * 1) Core Stack Row: Flutter, Dart, Python, FastAPI, Supabase, Figma.
 * 2) Legend: FitZen · MockMate AI · Dhikr Counter Pro · NotMyFault · FreshCart · Friends Cafe.
 * 3) The Ledger: 6 category cards (Mobile, Languages, Backend & Web, AI / LLM, UI/UX Design, Tools & Certs).
 *    Segmented proof bars showing exact portfolio usage per skill, interactive hover/tap accordion.
 * 4) Footer Note: Contextual explanation of segments and coursework badges.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/Container';

const PROJECT_NAMES = [
  'FitZen',
  'MockMate AI',
  'Dhikr Counter Pro',
  'NotMyFault',
  'FreshCart',
  'Friends Cafe',
] as const;

interface SkillData {
  name: string;
  segments: (0 | 1)[] | null;
  label: string;
  note: string;
}

interface CategoryData {
  id: string;
  category: string;
  count: string;
  skills: SkillData[];
  certifications?: string[];
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'mobile',
    category: 'MOBILE',
    count: '3',
    skills: [
      {
        name: 'Flutter',
        segments: [1, 0, 1, 1, 0, 0],
        label: '3 projects',
        note: 'Used in FitZen, Dhikr Counter Pro, NotMyFault.',
      },
      {
        name: 'Dart',
        segments: [1, 0, 1, 1, 0, 0],
        label: '3 projects',
        note: 'Used in FitZen, Dhikr Counter Pro, NotMyFault.',
      },
      {
        name: 'FastAPI',
        segments: [0, 0, 1, 0, 0, 0],
        label: '1 project',
        note: 'Backend API for Dhikr Counter Pro.',
      },
    ],
  },
  {
    id: 'languages',
    category: 'LANGUAGES',
    count: '6',
    skills: [
      {
        name: 'Python',
        segments: [0, 1, 1, 0, 0, 0],
        label: '2 projects',
        note: 'Backend logic in MockMate AI and the FastAPI backend of Dhikr Counter Pro. Also a Coursera certification.',
      },
      {
        name: 'Java',
        segments: [0, 0, 0, 0, 0, 1],
        label: '1 project',
        note: 'Spring (Java) backend for Friends Cafe. Also coursework.',
      },
      {
        name: 'JavaScript',
        segments: [0, 1, 0, 0, 0, 1],
        label: '2 projects',
        note: 'MockMate AI and Friends Cafe. Also a Coursera certification.',
      },
      {
        name: 'SQL',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'Postgres data layer in MockMate AI. Also a Coursera certification.',
      },
      {
        name: 'DSA',
        segments: null,
        label: 'Coursework',
        note: 'Learned through college coursework.',
      },
      {
        name: 'PHP',
        segments: null,
        label: 'Coursework',
        note: 'Learned through college coursework.',
      },
    ],
  },
  {
    id: 'backend',
    category: 'BACKEND & WEB',
    count: '6',
    skills: [
      {
        name: 'Supabase',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'Auth and row-level security in MockMate AI.',
      },
      {
        name: 'PostgreSQL',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'Data layer in MockMate AI.',
      },
      {
        name: 'Google Sheets (data store)',
        segments: [1, 0, 0, 0, 0, 0],
        label: '1 project',
        note: 'Used as the data store for FitZen.',
      },
      {
        name: 'Spring',
        segments: [0, 0, 0, 0, 0, 1],
        label: '1 project',
        note: 'Backend for the Friends Cafe client website.',
      },
      {
        name: 'HTML',
        segments: [0, 0, 0, 0, 0, 1],
        label: '1 project',
        note: 'Friends Cafe.',
      },
      {
        name: 'CSS',
        segments: [0, 0, 0, 0, 0, 1],
        label: '1 project',
        note: 'Friends Cafe.',
      },
    ],
  },
  {
    id: 'ai',
    category: 'AI / LLM',
    count: '4',
    skills: [
      {
        name: 'LLM API integration (Gemini)',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'Answer feedback and rubric scoring in MockMate AI.',
      },
      {
        name: 'Prompt engineering',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'MockMate AI.',
      },
      {
        name: 'Text-to-speech integration',
        segments: [0, 1, 0, 0, 0, 0],
        label: '1 project',
        note: 'Voice flow in MockMate AI.',
      },
      {
        name: 'AI-assisted development',
        segments: null,
        label: 'Practice',
        note: 'Used as part of how I build and debug across my projects.',
      },
    ],
  },
  {
    id: 'design',
    category: 'UI/UX DESIGN',
    count: '6',
    skills: [
      {
        name: 'Figma',
        segments: [0, 0, 0, 0, 1, 0],
        label: '1 project',
        note: 'FreshCart.',
      },
      {
        name: 'Design systems',
        segments: [0, 0, 0, 0, 1, 0],
        label: '1 project',
        note: 'FreshCart (reusable components, color and text styles).',
      },
      {
        name: 'WCAG AA accessibility',
        segments: [0, 0, 0, 0, 1, 0],
        label: '1 project',
        note: 'FreshCart (contrast-checked palette).',
      },
      {
        name: 'Wireframing',
        segments: null,
        label: 'Case studies',
        note: 'Practiced in UX case studies.',
      },
      {
        name: 'User research',
        segments: null,
        label: 'Case studies',
        note: 'Practiced in UX case studies.',
      },
      {
        name: 'Miro and Penpot',
        segments: null,
        label: 'Case studies',
        note: 'Used in UX case studies and design practice.',
      },
    ],
  },
  {
    id: 'tools',
    category: 'TOOLS & CERTIFICATIONS',
    count: '5',
    skills: [
      {
        name: 'Git',
        segments: null,
        label: 'Everyday tools',
        note: 'Version control for my projects.',
      },
      {
        name: 'GitHub',
        segments: null,
        label: 'Everyday tools',
        note: 'Hosting and collaboration for my projects.',
      },
    ],
    certifications: ['SQL, Coursera', 'Python, Coursera', 'JavaScript, Coursera'],
  },
];

const CORE_STACK = ['Flutter', 'Dart', 'Python', 'FastAPI', 'Supabase', 'Figma'];

export default function Skills() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(false);
  // Track open row per card for mobile/touch/keyboard accordion
  const [openSkills, setOpenSkills] = useState<{ [cardId: string]: string | null }>({});
  // Track hovered row per card on desktop
  const [hoveredSkills, setHoveredSkills] = useState<{ [cardId: string]: string | null }>({});

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

  const handleToggleRow = (cardId: string, skillName: string) => {
    setOpenSkills((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === skillName ? null : skillName,
    }));
  };

  const handleHoverRow = (cardId: string, skillName: string | null) => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    setHoveredSkills((prev) => ({
      ...prev,
      [cardId]: skillName,
    }));
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: reducedMotion ? 0 : custom * 0.05,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section
      id="skills"
      className="py-24 md:py-32 relative scroll-mt-[120px] overflow-hidden seam-to-navy"
      style={{ backgroundColor: '#0B1226' }}
      aria-label="Skills & Technologies"
    >
      <Container className="relative z-10">
        {/* ============================================================
            HEADER PATTERN
            ============================================================ */}
        <div className="mb-14">
          <span className="label-mono font-medium text-[0.6875rem] tracking-widest mb-3 flex items-center text-[var(--text-faint)]">
            03 / SKILLS
          </span>
          <h2 className="heading-lg text-[2.5rem] sm:text-[3.75rem] text-[var(--text)] leading-[1] mb-4">
            Toolkit & Competencies.
          </h2>
          <p className="body-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Everything below comes from projects I have built or coursework I have completed. Hover a skill to see where I used it.
          </p>
        </div>

        {/* ============================================================
            1) CORE STACK ROW (Top, always visible, static, no scrolling)
            ============================================================ */}
        <div className="mb-12">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-faint)] block mb-3 font-semibold">
            CORE STACK
          </span>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {CORE_STACK.map((tech, idx) => (
              <motion.div
                key={tech}
                variants={staggerVariants}
                initial="hidden"
                whileInView="visible"
                animate={safetyVisible ? 'visible' : undefined}
                viewport={{ once: true, amount: 0.15 }}
                custom={idx}
                className="h-11 px-5 rounded-full border border-[var(--line)] bg-[var(--surface)] flex items-center gap-2.5 shadow-none transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text)] font-medium">
                  {tech}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================================
            2) LEGEND (Directly above the grid)
            ============================================================ */}
        <div className="mb-6">
          <p className="font-mono text-[11px] text-[var(--text-faint)] leading-relaxed">
            Each segment is one project: FitZen · MockMate AI · Dhikr Counter Pro · NotMyFault · FreshCart · Friends Cafe
          </p>
        </div>

        {/* ============================================================
            3) THE LEDGER: 6 Category Cards in a Responsive Grid
               (3 cols on desktop at 1200px, 2 cols on tablet, 1 on mobile)
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, catIdx) => {
            const activeSkillName = hoveredSkills[cat.id] || openSkills[cat.id] || null;
            const activeIndex = cat.skills.findIndex((s) => s.name === activeSkillName);

            return (
              <motion.div
                key={cat.id}
                variants={staggerVariants}
                initial="hidden"
                whileInView="visible"
                animate={safetyVisible ? 'visible' : undefined}
                viewport={{ once: true, amount: 0.15 }}
                custom={catIdx}
                className="card-gold-hover rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-none"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[var(--line)]">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-faint)] font-semibold">
                      {cat.category}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-faint)]/80 font-medium">
                      {cat.count}
                    </span>
                  </div>

                  {/* Skills Rows */}
                  <div className="flex flex-col">
                    {cat.skills.map((skill, sIdx) => {
                      const isActive = activeSkillName === skill.name;
                      // Hairlines above and below active row fade out
                      const isDividerHidden =
                        activeIndex !== -1 && (sIdx === activeIndex || sIdx === activeIndex + 1);

                      return (
                        <div key={skill.name} className="relative">
                          {/* Top Hairline divider for rows 1..n */}
                          {sIdx > 0 && (
                            <div
                              className={`h-px bg-[var(--line)] transition-opacity duration-300 ${isDividerHidden ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                          )}

                          {/* Interactive Skill Row */}
                          <div
                            tabIndex={0}
                            role="button"
                            aria-expanded={isActive}
                            onMouseEnter={() => handleHoverRow(cat.id, skill.name)}
                            onMouseLeave={() => handleHoverRow(cat.id, null)}
                            onClick={() => handleToggleRow(cat.id, skill.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToggleRow(cat.id, skill.name);
                              }
                            }}
                            className={`group relative py-3.5 px-3 rounded-lg cursor-pointer transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] ${isActive ? 'bg-[var(--surface-strong)]' : 'bg-transparent'
                              }`}
                          >
                            {/* 3px Ember vertical indicator on left */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  initial={
                                    reducedMotion
                                      ? { opacity: 1, scaleY: 1 }
                                      : { opacity: 0, scaleY: 0.5 }
                                  }
                                  animate={{ opacity: 1, scaleY: 1 }}
                                  exit={
                                    reducedMotion
                                      ? { opacity: 0 }
                                      : { opacity: 0, scaleY: 0.5 }
                                  }
                                  transition={{
                                    duration: 0.5,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#FF5A1F] rounded-full pointer-events-none"
                                />
                              )}
                            </AnimatePresence>

                            {/* Main Row Content */}
                            <div className="flex items-center justify-between gap-3">
                              {/* Skill Name with 6px right shift */}
                              <motion.span
                                animate={{
                                  x: isActive && !reducedMotion ? 6 : 0,
                                }}
                                transition={{
                                  duration: 0.5,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="text-[15px] font-medium text-[var(--text)] select-none leading-snug flex-1 min-w-0 pr-2"
                              >
                                {skill.name}
                              </motion.span>

                              {/* Right: Segmented Proof Bar OR Badge */}
                              <div className="flex items-center gap-2.5 shrink-0 select-none">
                                {skill.segments ? (
                                  <div className="relative flex items-center gap-1 overflow-hidden p-0.5 rounded-sm">
                                    {/* Subtle shine sweep once across bar when active */}
                                    {isActive && !reducedMotion && (
                                      <motion.span
                                        initial={{ x: '-120%', opacity: 0 }}
                                        animate={{ x: '220%', opacity: [0, 0.7, 0] }}
                                        transition={{
                                          duration: 0.7,
                                          ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10"
                                      />
                                    )}

                                    {/* 6 Segments for the 6 projects */}
                                    {skill.segments.map((isFilled, pIdx) => (
                                      <div
                                        key={pIdx}
                                        className="group/seg relative flex items-center"
                                        title={`${PROJECT_NAMES[pIdx]}: ${isFilled ? 'Used' : 'Not used'
                                          }`}
                                      >
                                        <motion.span
                                          initial={false}
                                          animate={
                                            isActive && isFilled && !reducedMotion
                                              ? {
                                                scaleY: [0.4, 1.15, 1],
                                                opacity: [0.5, 1],
                                              }
                                              : { scaleY: 1, opacity: 1 }
                                          }
                                          transition={{
                                            duration: 0.4,
                                            delay: pIdx * 0.06,
                                            ease: [0.16, 1, 0.3, 1],
                                          }}
                                          className={`w-[10px] h-[6px] rounded-[1.5px] block transition-colors duration-300 ${isFilled
                                              ? 'bg-[#FF5A1F]'
                                              : 'bg-[var(--line)]'
                                            }`}
                                        />

                                        {/* Segment Hover Tooltip */}
                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/seg:flex flex-col items-center z-40">
                                          <span className="whitespace-nowrap px-2 py-1 rounded bg-[#0A0E1A] text-white text-[10px] font-mono shadow-md">
                                            {PROJECT_NAMES[pIdx]}
                                            {isFilled ? '' : ' (not used)'}
                                          </span>
                                          <span className="w-1.5 h-1 border-x-4 border-x-transparent border-t-4 border-t-[#0A0E1A]" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}

                                {/* Mono Label */}
                                <span
                                  className={`font-mono text-[11px] whitespace-nowrap transition-colors duration-300 ${isActive
                                      ? 'text-[var(--text)] font-semibold'
                                      : 'text-[var(--text-faint)]'
                                    }`}
                                >
                                  {skill.label}
                                </span>
                              </div>
                            </div>

                            {/* Expanded "Used in" / Note Line (Accordion) */}
                            <AnimatePresence initial={false}>
                              {isActive && (
                                <motion.div
                                  initial={
                                    reducedMotion
                                      ? { opacity: 1, height: 'auto' }
                                      : { opacity: 0, height: 0 }
                                  }
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={
                                    reducedMotion
                                      ? { opacity: 0 }
                                      : { opacity: 0, height: 0 }
                                  }
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                  className="overflow-hidden"
                                >
                                  <p className="pt-2.5 pb-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                                    {skill.note}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Category 6 Certifications Block */}
                  {cat.certifications && (
                    <div className="mt-5 pt-4 border-t border-[var(--line)]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] block mb-2 font-semibold">
                        CERTIFICATIONS
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {cat.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="font-mono text-[11px] text-[var(--text)] bg-[var(--surface-strong)] border border-[var(--line)] px-2.5 py-1 rounded-full shadow-none"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ============================================================
            4) FOOTER NOTE BELOW THE GRID
            ============================================================ */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[11px] text-[var(--text-faint)] leading-relaxed max-w-xl mx-auto">
            Segments show which of my 6 portfolio projects use each skill. Coursework and case-study skills are labeled instead.
          </p>
        </div>
      </Container>
    </section>
  );
}
