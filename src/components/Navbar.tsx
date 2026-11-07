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
    <motion.nav
      className={`nav-bar ${isHidden ? 'nav-bar--hidden' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-link ${activeSection === item.id ? 'nav-link--active' : ''}`}
          onClick={() => scrollToSection(item.id)}
          data-cursor="View"
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}

      {/* Command palette hint (hidden under 640px on mobile) */}
      <button
        className="nav-link hidden sm:inline-flex"
        onClick={onOpenCommandPalette}
        data-cursor="Search"
        aria-label="Open command palette"
      >
        <span className="nav-kbd">Ctrl K</span>
      </button>
    </motion.nav>
  );
}

