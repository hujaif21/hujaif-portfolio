/**
 * PhoneShowcase — Section 3: Mobile Engineering Lab & Pinned Phone Showcase
 *
 * One shared container, two-column grid (5/12 text, 7/12 phone),
 * 48px app switcher row, external phone caption, and 32px top margin above phone.
 */

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  RotateCcw,
  Copy,
  Check,
  Flame,
  Activity,
  Users,
  Layers,
  Eye,
  Sliders,
  Play,
  ArrowUpRight,
} from 'lucide-react';

import { Container } from '@/components/Container';

// Lazy-load VideoModal
const VideoModal = lazy(() => import('@/components/VideoModal'));

interface ScreenShot {
  id: string;
  label: string;
  src: string;
  caption: string;
}

interface AppStory {
  id: string;
  step: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  status: 'In Progress' | 'Completed' | 'Shipped';
  team?: string;
  backend?: string;
  repoUrl?: string;
  appUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  screenshots: ScreenShot[];
}

const STORIES: AppStory[] = [
  {
    id: 'fitzen',
    step: '01 / 03',
    name: 'FitZen',
    tagline: 'AI Food Vision & Sensor-Driven Activity Suite',
    description:
      'A multi-module Flutter health suite engineered with a 3-person team. Integrates on-device computer vision to identify meals in real-time and compute calories, protein, and carbohydrates without subscription walls. Features native pedometer hardware sensor tracking with custom daily step targets and streak retention.',
    tags: ['Flutter', 'Dart', 'Vision AI', 'Hardware Sensors', 'State Management'],
    status: 'In Progress',
    team: 'Team of 3',
    repoUrl: 'https://github.com/hujaif21/fitzen',
    videoUrl: 'https://www.youtube.com/embed/G7MkNjrm1bg?autoplay=1',
    screenshots: [
      {
        id: 'home',
        label: 'Dashboard',
        src: '/projects/fitzen-home.jpeg',
        caption: 'DAILY NUTRITION RING & ACTIVE STREAK TRACKING',
      },
      {
        id: 'scanner',
        label: 'AI Food Scanner',
        src: '/projects/fitzen-scanner.jpeg',
        caption: 'ON-DEVICE VISION MODEL RECOGNIZING MEAL MACROS',
      },
      {
        id: 'pedometer',
        label: 'Pedometer',
        src: '/projects/fitzen-pedometer.jpeg',
        caption: 'NATIVE HARDWARE SENSOR STEP & ACTIVITY TRACKER',
      },
    ],
  },
  {
    id: 'dhikar',
    step: '02 / 03',
    name: 'Dhikr Counter Pro',
    tagline: 'Minimalist High-Precision Digital Tasbih',
    description:
      'A distraction-free digital tasbih engineered with authentic Arabic typography rendering, persistent multi-target goal tracking (including 200,000 Astaghfirullah pacing and 100-cycle SubhanAllah trackers), tactile haptic intervals, and session history synchronization via a Python FastAPI backend.',
    tags: ['Flutter', 'Dart', 'FastAPI', 'Python', 'REST API'],
    status: 'Completed',
    backend: 'FastAPI Cloud Sync',
    appUrl: 'https://drive.google.com/file/d/1ycYErMIZotnG92o_W69fHTVbMV123YoH/view',
    videoUrl: 'https://www.youtube.com/embed/ZMq-WaDlYEA?autoplay=1',
    screenshots: [
      {
        id: 'home',
        label: 'Counter Interface',
        src: '/projects/dhikar-home.jpeg',
        caption: 'ARABIC TYPOGRAPHY, DUAL GOAL TRACKING & DARK EMERALD UI',
      },
    ],
  },
  {
    id: 'notmyfault',
    step: '03 / 03',
    name: 'NotMyFault',
    tagline: 'Instant Contextual Excuse Engine & Snitch Mode',
    description:
      'An end-to-end shipped mobile utility built in Flutter. Generates witty, context-aware excuses with a causality-inverting "Snitch Mode" switch, multi-crisis category triggers (Late arrival, missed Deadlines, Gym skips, delayed Slack replies), and one-tap clipboard export.',
    tags: ['Flutter', 'Dart', 'State Management', 'Clipboard API'],
    status: 'Shipped',
    appUrl: 'https://drive.google.com/file/d/1s0_m3MilTJaYPLe1eFvdpjKL_Qzx5pr8/view',
    videoUrl: 'https://www.youtube.com/embed/ae7GW9QFV5E?autoplay=1',
    screenshots: [
      {
        id: 'home',
        label: 'App Interface',
        src: '/projects/notmyfault-home.jpeg',
        caption: 'CRISIS SELECTOR, SNITCH MODE TOGGLE & DARK PURPLE AESTHETIC',
      },
    ],
  },
];

const EXCUSES = [
  'It worked on my machine. It must be an environmental variance in container runtime.',
  'A rogue Redis cache TTL expired mid-transaction during the demo.',
  'The third-party API returned an undocumented 418 I\'m a teapot response.',
  'Upstream merge conflict in an unmaintained transitive dependency.',
  'DNS propagation is taking longer than the cosmic speed of light.',
  'My code was actively compiling, so I took a mandatory espresso break.',
];

const DHIKAR_PHRASES = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'Astaghfirullah'];

export default function PhoneShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  // View mode per app: 'screenshot' or 'simulator'
  const [viewMode, setViewMode] = useState<'screenshot' | 'simulator'>('screenshot');
  const [activeSubScreen, setActiveSubScreen] = useState(0);

  // FitZen Interactive Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Dhikar Counter Interactive State
  const [count, setCount] = useState(33);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // NotMyFault Interactive State
  const [excuseIndex, setExcuseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  } | null>(null);

  const activeStory = STORIES[activeIndex];

  // Reset subscreen when app changes
  const handleSelectApp = (index: number) => {
    setActiveIndex(index);
    setActiveSubScreen(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % STORIES.length);
    setActiveSubScreen(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + STORIES.length) % STORIES.length);
    setActiveSubScreen(0);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -400) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      handlePrev();
    }
  };

  // FitZen scan action
  const handleScanMeal = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  // Dhikar count action
  const handleIncrementCount = () => {
    setCount((prev) => prev + 1);
  };

  const handleResetCount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const handleNextPhrase = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhraseIndex((prev) => (prev + 1) % DHIKAR_PHRASES.length);
  };

  // NotMyFault generate action
  const handleGenerateExcuse = () => {
    setExcuseIndex((prev) => (prev + 1) % EXCUSES.length);
    setCopied(false);
  };

  const handleCopyExcuse = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(EXCUSES[excuseIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentScreenshot =
    activeStory.screenshots[activeSubScreen] || activeStory.screenshots[0];

  return (
    <section
      id="work"
      className="py-24 md:py-32 relative scroll-mt-[120px] overflow-hidden seam-maroon-hairline"
      style={{ background: 'linear-gradient(180deg, #2A0A12 0%, #34101A 100%)' }}
      aria-label="Interactive Mobile Work"
    >
      <Container className="relative z-10">
        {/* ============================================================
            1. SECTION HEADER (Consistent pattern with 56px bottom margin)
            ============================================================ */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="label-mono font-medium flex items-center text-[var(--text-faint)]">
              01 / MOBILE ENGINEERING LAB
            </span>
            <div className="h-[1px] w-8 bg-[var(--line)]" />
            <span className="label-mono text-[0.625rem] status-chip px-2.5 py-0.5 rounded-full font-semibold">
              REAL APP BUILDS
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="heading-lg text-[2.5rem] sm:text-[3.75rem] text-[var(--text)] leading-[1]">
              Engineered in Flutter.
            </h2>
            <p className="body-sm text-[var(--text-muted)] max-w-[420px] leading-relaxed">
              Actual production screens and architecture. Swipe between apps and explore multi-screen flows.
            </p>
          </div>
        </div>

        {/* ============================================================
            2. APP SWITCHER ROW (48px high, margin-bottom 48px)
            ============================================================ */}
        <div className="mb-12 min-h-12 py-1.5 px-3 rounded-full bg-[var(--surface)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-3 shadow-none">
          {/* Left: App Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {STORIES.map((story, i) => (
              <button
                key={story.id}
                onClick={() => handleSelectApp(i)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  activeIndex === i
                    ? 'text-[var(--text)] font-semibold bg-[var(--surface-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeIndex === i ? 'bg-[#FF5A1F]' : 'bg-[var(--line)]'
                  }`}
                />
                <span>{story.name}</span>
              </button>
            ))}
          </div>

          {/* Right: Hint + Prev/Next */}
          <div className="flex items-center gap-3">
            <span className="hidden xl:block font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              SWIPE LEFT OR RIGHT TO SWITCH APPS
            </span>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--text)] hover:bg-[#FF5A1F] hover:text-white transition-colors cursor-pointer"
                aria-label="Previous app"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--text)] hover:bg-[#FF5A1F] hover:text-white transition-colors cursor-pointer"
                aria-label="Next app"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. TWO-COLUMN GRID: Text Column (5/12) & Phone Column (7/12)
            ============================================================ */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Specs (5/12) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col gap-4 text-left"
              >
                {/* Step & Category */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-semibold tracking-wider text-[var(--text)]">
                    {activeStory.step}
                  </span>
                  <div className="h-[1px] w-8 bg-[var(--line)]" />
                  <span className="label-mono text-[0.6875rem] text-[var(--text-faint)]">
                    FEATURED MOBILE PROJECT
                  </span>
                </div>

                {/* Status chip & Team */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="label-mono px-3 py-1 rounded-full text-[0.625rem] font-semibold status-chip">
                    {activeStory.status}
                  </span>

                  {activeStory.team && (
                    <span className="label-mono flex items-center gap-1.5 text-[0.625rem] text-[var(--text-faint)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--line)]">
                      <Users size={12} /> {activeStory.team}
                    </span>
                  )}

                  {activeStory.backend && (
                    <span className="label-mono flex items-center gap-1.5 text-[0.625rem] text-[var(--text-faint)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--line)]">
                      <Layers size={12} /> {activeStory.backend}
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="heading-lg text-[2.5rem] sm:text-[3.25rem] text-[var(--text)] leading-[1]">
                    {activeStory.name}
                  </h3>
                  <p className="font-sans text-sm sm:text-base font-medium text-[var(--text-muted)] mt-1.5">
                    {activeStory.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[var(--text-muted)] text-base leading-[1.7] max-w-[50ch]">
                  {activeStory.description}
                </p>

                {/* Multi-screen selector for apps with multiple screens */}
                {activeStory.screenshots.length > 1 && (
                  <div className="pt-1">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-2">
                      Available App Screens:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeStory.screenshots.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveSubScreen(idx);
                            setViewMode('screenshot');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeSubScreen === idx && viewMode === 'screenshot'
                              ? 'bg-[var(--surface-strong)] text-[var(--text)] border border-[rgba(255,90,31,0.45)]'
                              : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--line)]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              activeSubScreen === idx && viewMode === 'screenshot'
                                ? 'bg-[#FF5A1F]'
                                : 'bg-[var(--line)]'
                            }`}
                          />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech Tags in Mono */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeStory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="label-mono text-[0.6875rem] px-3 py-1 rounded bg-[var(--surface)] text-[var(--text-faint)] border border-[var(--line)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons in One Row (height 44px, gap 12px, margin-top 28px) */}
                <div className="mt-7 flex items-center gap-3 flex-wrap">
                  {Boolean(activeStory.repoUrl) && (
                    <a
                      href={activeStory.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-6 rounded-full text-sm font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <Github size={15} />
                      <span>View Repository</span>
                    </a>
                  )}

                  {Boolean(activeStory.appUrl) && (
                    <a
                      href={activeStory.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-6 rounded-full text-sm font-medium text-white bg-[#FF5A1F] hover:bg-[#D9420A] transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <span>View App</span>
                      <ArrowUpRight size={15} />
                    </a>
                  )}

                  {Boolean(activeStory.videoUrl) && (
                    <button
                      type="button"
                      onClick={() =>
                        setVideoModal({
                          isOpen: true,
                          url: activeStory.videoUrl!,
                          title: activeStory.name,
                        })
                      }
                      className="h-11 px-6 rounded-full text-sm font-medium text-[var(--text)] border border-[rgba(244,238,227,0.28)] hover:bg-[var(--surface-strong)] transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Watch Demo</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Phone Column (7/12, Phone Centered with 32px top margin) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2 mt-8">
            
            {/* Phone Outer Chassis Frame */}
            <div
              className="relative w-[300px] sm:w-[325px] h-[610px] sm:h-[640px] rounded-[48px] p-[10px] bg-[#0A0E1A] shadow-[0_30px_70px_-15px_rgba(10,14,26,0.28),0_0_0_1px_rgba(10,14,26,0.15)] flex flex-col select-none"
              style={{ touchAction: 'pan-y' }}
            >
              {/* Dynamic Island Pill at Top */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#1e293b] border border-white/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#334155]" />
              </div>

              {/* Inside Screen Container: Supports Drag/Swipe */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={handleDragEnd}
                className="w-full h-full rounded-[38px] overflow-hidden relative flex flex-col justify-between cursor-grab active:cursor-grabbing bg-[#0A0E1A]"
              >
                {/* 1. SCREENSHOT MODE */}
                {viewMode === 'screenshot' ? (
                  <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeStory.id}-${currentScreenshot.id}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <img
                          src={currentScreenshot.src}
                          alt={currentScreenshot.caption}
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          width={325}
                          height={640}
                          className="w-full h-full object-cover object-top select-none"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Floating Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/50 rounded-full z-40" />
                  </div>
                ) : (
                  /* 2. PLAYABLE SIMULATOR MODE */
                  <div
                    className="w-full h-full flex flex-col justify-between"
                    style={{ backgroundColor: '#FAF7F2' }}
                  >
                    {/* Status Bar */}
                    <div className="pt-2.5 px-6 flex items-center justify-between text-[0.625rem] font-semibold text-[#0A0E1A]/70 font-sans z-30">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.5625rem] font-mono">5G</span>
                        <span className="inline-block w-4 h-2 border border-[#0A0E1A]/60 rounded-xs p-0.5">
                          <span className="block w-full h-full bg-[#0A0E1A]/60 rounded-3xs" />
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Screen Contents Based on activeIndex */}
                    <div className="flex-1 px-4 pt-4 pb-2 flex flex-col justify-between overflow-hidden">
                      
                      {/* APP 1: FITZEN INTERACTIVE SCREEN */}
                      {activeIndex === 0 && (
                        <motion.div
                          key="screen-fitzen"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex-1 flex flex-col justify-between"
                        >
                          {/* App Bar */}
                          <div className="flex items-center justify-between pb-2 border-b border-[#0A0E1A]/8">
                            <div>
                              <span className="font-serif italic text-lg text-[#0A0E1A] font-bold">FitZen</span>
                              <p className="text-[0.5625rem] text-[#6B6558] font-mono">Vision Food Classifier</p>
                            </div>
                            <span className="label-mono text-[0.5625rem] text-[#D9420A] bg-[#FF5A1F]/10 px-2 py-0.5 rounded-full font-semibold">
                              AI SCAN
                            </span>
                          </div>

                          {/* Food Plate Scanner Interactive Frame */}
                          <div className="my-2.5 relative rounded-2xl bg-[#EBE4D6] p-3.5 flex flex-col items-center justify-center text-center overflow-hidden border border-[#0A0E1A]/8">
                            {/* Scanning Laser Beam */}
                            {isScanning && (
                              <motion.div
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-0 right-0 h-[2px] bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F] z-20"
                              />
                            )}

                            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#FF5A1F] shadow-sm mb-2">
                              <Flame size={26} />
                            </div>

                            <span className="font-serif text-sm font-semibold text-[#0A0E1A]">
                              {scanComplete ? 'Roasted Paneer & Macro Bowl' : 'Ready to Analyze Meal'}
                            </span>
                            <p className="text-[0.625rem] text-[#4A5266] mt-0.5 max-w-[200px]">
                              {scanComplete
                                ? 'Vision model detected roasted paneer cubes (94% confidence).'
                                : 'Tap simulate scan to trigger real-time meal inference.'}
                            </p>

                            {/* Interactive Trigger Button */}
                            <button
                              onClick={handleScanMeal}
                              disabled={isScanning}
                              className="mt-3 px-3.5 py-1.5 rounded-full bg-[#0A0E1A] text-white text-[0.6875rem] font-medium flex items-center gap-1.5 hover:bg-[#FF5A1F] transition-colors shadow-sm cursor-pointer"
                            >
                              <Camera size={12} />
                              <span>{isScanning ? 'Analyzing plate...' : 'Simulate Scan'}</span>
                            </button>
                          </div>

                          {/* Real-Time Macro Wheels */}
                          <div className="grid grid-cols-3 gap-2 text-center mb-2">
                            <div className="p-2 rounded-xl bg-[#EBE4D6] border border-[#0A0E1A]/6">
                              <span className="block text-[0.5625rem] text-[#6B6558] font-mono">CALORIES</span>
                              <span className="font-mono text-xs font-bold text-[#0A0E1A]">
                                {scanComplete ? '485' : '0'} <span className="text-[0.5rem] font-normal">kcal</span>
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#EBE4D6] border border-[#0A0E1A]/6">
                              <span className="block text-[0.5625rem] text-[#6B6558] font-mono">PROTEIN</span>
                              <span className="font-mono text-xs font-bold text-[#D9420A]">
                                {scanComplete ? '38g' : '0g'}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#EBE4D6] border border-[#0A0E1A]/6">
                              <span className="block text-[0.5625rem] text-[#6B6558] font-mono">CARBS</span>
                              <span className="font-mono text-xs font-bold text-[#0A0E1A]">
                                {scanComplete ? '42g' : '0g'}
                              </span>
                            </div>
                          </div>

                          {/* Live Pedometer Card */}
                          <div className="p-2.5 rounded-xl bg-[#EBE4D6] border border-[#0A0E1A]/8 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Activity size={16} className="text-[#FF5A1F]" />
                              <div>
                                <span className="block font-sans text-[0.6875rem] font-semibold text-[#0A0E1A]">
                                  Pedometer Sensor
                                </span>
                                <span className="text-[0.5625rem] text-[#4A5266] font-mono">
                                  Goal: 7,455 steps · 84% done
                                </span>
                              </div>
                            </div>
                            <span className="label-mono text-[0.5625rem] text-[#10b981] font-semibold">Active</span>
                          </div>
                        </motion.div>
                      )}

                      {/* APP 2: DHIKAR COUNTER INTERACTIVE SCREEN */}
                      {activeIndex === 1 && (
                        <motion.div
                          key="screen-dhikar"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex-1 flex flex-col justify-between"
                        >
                          {/* App Bar */}
                          <div className="flex items-center justify-between pb-2 border-b border-[#0A0E1A]/8">
                            <div>
                              <span className="font-serif italic text-lg text-[#0A0E1A] font-bold">Dhikr Pro</span>
                              <p className="text-[0.5625rem] text-[#6B6558] font-mono">Digital Tasbih Counter</p>
                            </div>
                            <span className="label-mono text-[0.5625rem] text-[#0A0E1A] bg-[#0A0E1A]/8 px-2 py-0.5 rounded-full font-semibold">
                              FASTAPI SYNC
                            </span>
                          </div>

                          {/* Current Dhikar Phrase Bar */}
                          <div className="my-1.5 p-2 rounded-xl bg-[#EBE4D6] flex items-center justify-between text-xs">
                            <span className="font-serif italic text-sm font-semibold text-[#0A0E1A]">
                              {DHIKAR_PHRASES[phraseIndex]}
                            </span>
                            <button
                              onClick={handleNextPhrase}
                              className="label-mono text-[0.5625rem] text-[#FF5A1F] hover:underline cursor-pointer"
                            >
                              Change Phrase
                            </button>
                          </div>

                          {/* Interactive Tactile Big Counter Button */}
                          <div className="my-auto py-2 flex flex-col items-center justify-center">
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={handleIncrementCount}
                              className="w-32 h-32 rounded-full bg-[#0A0E1A] text-white shadow-xl flex flex-col items-center justify-center relative cursor-pointer group border-4 border-[#FAF7F2]"
                            >
                              <span className="font-mono text-3xl font-bold tracking-tight group-hover:scale-105 transition-transform">
                                {count}
                              </span>
                              <span className="label-mono text-[0.5625rem] opacity-70 mt-1">TAP TO COUNT</span>
                            </motion.button>
                            <p className="text-[0.625rem] text-[#4A5266] mt-2 font-mono">
                              Goal: 200,000 · Current cycle: {count}
                            </p>
                          </div>

                          {/* Counter Controls */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#0A0E1A]/8 text-xs">
                            <button
                              onClick={handleResetCount}
                              className="flex items-center gap-1.5 text-[0.6875rem] text-[#4A5266] hover:text-[#0A0E1A] py-1 cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Reset Count</span>
                            </button>
                            <span className="label-mono text-[0.5625rem] text-[#10b981] font-medium">Haptics: Active</span>
                          </div>
                        </motion.div>
                      )}

                      {/* APP 3: NOTMYFAULT INTERACTIVE SCREEN */}
                      {activeIndex === 2 && (
                        <motion.div
                          key="screen-notmyfault"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex-1 flex flex-col justify-between"
                        >
                          {/* App Bar */}
                          <div className="flex items-center justify-between pb-2 border-b border-[#0A0E1A]/8">
                            <div>
                              <span className="font-serif italic text-lg text-[#0A0E1A] font-bold">NotMyFault</span>
                              <p className="text-[0.5625rem] text-[#6B6558] font-mono">Smart Excuse Generator</p>
                            </div>
                            <span className="label-mono text-[0.5625rem] text-[#D9420A] bg-[#FF5A1F]/10 px-2 py-0.5 rounded-full font-semibold">
                              SHIPPED
                            </span>
                          </div>

                          {/* Interactive Excuse Card */}
                          <div className="my-auto p-4 rounded-2xl bg-[#EBE4D6] border border-[#0A0E1A]/10 text-center relative shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#FF5A1F] mx-auto mb-2">
                              <Sparkles size={16} />
                            </div>
                            <span className="label-mono text-[0.5625rem] text-[#6B6558] block mb-1">
                              SNITCH MODE EXCUSE #{excuseIndex + 1}
                            </span>
                            <p className="font-sans text-xs sm:text-sm font-medium text-[#0A0E1A] leading-relaxed italic">
                              "{EXCUSES[excuseIndex]}"
                            </p>

                            <div className="mt-4 flex items-center justify-center gap-2">
                              <button
                                onClick={handleCopyExcuse}
                                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] text-[#0A0E1A] border border-[#0A0E1A]/10 text-[0.6875rem] font-medium flex items-center gap-1.5 hover:bg-[#0A0E1A] hover:text-white transition-colors cursor-pointer"
                              >
                                {copied ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Generate New Button */}
                          <button
                            onClick={handleGenerateExcuse}
                            className="w-full py-2.5 rounded-xl bg-[#0A0E1A] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#FF5A1F] transition-colors cursor-pointer shadow-md"
                          >
                            <Sparkles size={14} />
                            <span>Shuffle Next Excuse</span>
                          </button>
                        </motion.div>
                      )}

                    </div>

                    {/* Bottom Screen Indicator Bar */}
                    <div className="pb-2.5 flex items-center justify-center gap-1.5 z-30">
                      {STORIES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectApp(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            activeIndex === i ? 'w-5 bg-[#0A0E1A]' : 'w-1.5 bg-[#0A0E1A]/20'
                          }`}
                          aria-label={`Go to screen ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Moved OUT of the phone: Centered Mono Caption (11px, 16px top margin) */}
            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-[#6B6558]">
              {currentScreenshot.caption}
            </p>
          </div>

        </div>
      </Container>

      {/* Watch Demo Video Modal */}
      {videoModal?.isOpen && (
        <Suspense fallback={null}>
          <VideoModal
            isOpen={Boolean(videoModal?.isOpen)}
            onClose={() => setVideoModal(null)}
            currentVideoUrl={videoModal?.url}
          />
        </Suspense>
      )}
    </section>
  );
}
