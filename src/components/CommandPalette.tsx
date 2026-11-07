/**
 * CommandPalette — Ctrl+K / Cmd+K command palette using cmdk.
 * Jump to sections, open links, copy email, download resume.
 */

import { useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Briefcase,
  Layout,
  Wrench,
  User,
  Mail,
  Github,
  Linkedin,
  FileDown,
  Copy,
  ArrowUp,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle is handled by parent
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      onClose();
    },
    [onClose]
  );

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText('hujaifbelim@gmail.com');
    onClose();
  }, [onClose]);

  const openLink = useCallback(
    (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(10, 14, 26, 0.45)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 201,
              width: '100%',
              maxWidth: '520px',
              padding: '0 1rem',
            }}
          >
            <Command label="Command palette" loop>
              <Command.Input placeholder="Type a command or search..." autoFocus />
              <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group heading="Navigate">
                  <Command.Item onSelect={() => scrollTo('hero')}>
                    <Home size={16} />
                    Home
                  </Command.Item>
                  <Command.Item onSelect={() => scrollTo('work')}>
                    <Briefcase size={16} />
                    Work
                  </Command.Item>
                  <Command.Item onSelect={() => scrollTo('projects')}>
                    <Layout size={16} />
                    Projects
                  </Command.Item>
                  <Command.Item onSelect={() => scrollTo('skills')}>
                    <Wrench size={16} />
                    Skills
                  </Command.Item>
                  <Command.Item onSelect={() => scrollTo('about')}>
                    <User size={16} />
                    About
                  </Command.Item>
                  <Command.Item onSelect={() => scrollTo('contact')}>
                    <Mail size={16} />
                    Contact
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      onClose();
                    }}
                  >
                    <ArrowUp size={16} />
                    Back to top
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Links">
                  <Command.Item onSelect={() => openLink('https://github.com/hujaif21')}>
                    <Github size={16} />
                    Open GitHub
                  </Command.Item>
                  <Command.Item
                    onSelect={() => openLink('https://linkedin.com/in/hujaif-belim21')}
                  >
                    <Linkedin size={16} />
                    Open LinkedIn
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Actions">
                  <Command.Item onSelect={copyEmail}>
                    <Copy size={16} />
                    Copy email address
                  </Command.Item>
                  <Command.Item onSelect={() => openLink('/resume.pdf')}>
                    <FileDown size={16} />
                    Download resume
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

