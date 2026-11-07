/**
 * Navbar — Floating pill nav, hides on scroll down, shows on scroll up.
 * Active section indicator with an ember dot.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export default function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('hero');
  const [isHidden, setIsHidden] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const lastScrollY = useRef(0);

  // Show nav after loader completes (delay a bit)
  useEffect(() => {
    const timer = setTimeout(() => setShowNav(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;

    // Hide/show on scroll direction
    if (currentY > lastScrollY.current && currentY > 100) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    lastScrollY.current = currentY;

    // Detect active section
    const sections = NAV_ITEMS.map((item) => ({
      id: item.id,
      el: document.getElementById(item.id),
    }));

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = sections[i].el;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!showNav) return null;

  return (
    <div className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-3">
      <motion.nav
        className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-full border border-[var(--line)] bg-[rgba(20,6,10,0.88)] backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] max-w-full overflow-x-auto scrollbar-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isHidden ? 0 : 1, y: isHidden ? -40 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`relative font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[var(--text-faint)] hover:text-[var(--text)] px-2.5 sm:px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer shrink-0 whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F] rounded-full ${
              activeSection === item.id ? 'text-[var(--text)] font-semibold' : ''
            }`}
            onClick={() => scrollToSection(item.id)}
            data-cursor="View"
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.label}
            {activeSection === item.id && (
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF5A1F]"
                aria-hidden="true"
              />
            )}
          </button>
        ))}

        {/* Command palette hint (hidden under 640px on mobile) */}
        <button
          className="hidden sm:inline-flex items-center justify-center px-2 py-1 min-h-[32px] rounded border border-[var(--line)] font-mono text-[10px] text-[var(--text-faint)] hover:text-[var(--text)] hover:border-[var(--line-strong)] transition-colors cursor-pointer shrink-0 ml-1"
          onClick={onOpenCommandPalette}
          data-cursor="Search"
          aria-label="Open command palette"
        >
          <span>Ctrl K</span>
        </button>
      </motion.nav>
    </div>
  );
}

