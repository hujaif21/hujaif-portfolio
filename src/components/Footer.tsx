/**
 * Footer — Editorial light-cream footer with 3-column navigation,
 * social links, back-to-top button, copyright, and oversized display wordmark.
 */

import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { Container } from '@/components/Container';

interface NavLink {
  label: string;
  id: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', id: 'hero' },
  { label: 'Work', id: 'work' },
  { label: 'Skills', id: 'skills' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="relative overflow-hidden pt-[72px] border-t border-[var(--line)]"
      style={{
        backgroundColor: '#1F070D',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Site Footer"
    >
      <Container>
        {/* ============================================================
            ROW 1: 3-COLUMN EDITORIAL DESKTOP GRID (STACKED ON MOBILE)
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          {/* Column 1: Brand / Bio (Cols 1-5) */}
          <div className="md:col-span-5 flex flex-col">
            <h3 className="font-serif text-[28px] text-[var(--text)] leading-tight mb-2 font-normal">
              Hujaif Belim
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              Flutter developer building fast, polished mobile apps.
            </p>
          </div>

          {/* Column 2: Navigation (Cols 6-8) */}
          <div className="md:col-span-3 flex flex-col">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-faint)] mb-4 block font-semibold">
              NAVIGATE
            </span>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    className="group inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[#FF5A1F] transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-xs"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Elsewhere & Back to Top (Cols 9-12) */}
          <div className="md:col-span-4 flex flex-col">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-faint)] mb-4 block font-semibold">
              ELSEWHERE
            </span>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="https://linkedin.com/in/hujaif-belim21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[#FF5A1F] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-xs"
                >
                  <Linkedin size={15} className="text-[var(--text-faint)] group-hover:text-[#FF5A1F] transition-colors" />
                  <span className="font-medium transition-transform duration-200 group-hover:translate-x-1">
                    LinkedIn
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/hujaif21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[#FF5A1F] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-xs"
                >
                  <Github size={15} className="text-[var(--text-faint)] group-hover:text-[#FF5A1F] transition-colors" />
                  <span className="font-medium transition-transform duration-200 group-hover:translate-x-1">
                    GitHub
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hujaifbelim@gmail.com"
                  className="group inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[#FF5A1F] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-xs"
                >
                  <Mail size={15} className="text-[var(--text-faint)] group-hover:text-[#FF5A1F] transition-colors" />
                  <span className="font-medium transition-transform duration-200 group-hover:translate-x-1">
                    Email
                  </span>
                </a>
              </li>
            </ul>

            {/* Back to top outline button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={scrollToTop}
                className="h-9 px-4 rounded-full border border-[var(--line)] bg-transparent text-xs font-mono text-[var(--text)] hover:bg-[var(--surface-strong)] inline-flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
              >
                <span>Back to top</span>
                <ArrowUp size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            ROW 2: COPYRIGHT & LOCATION BAR (MARGIN-TOP 56px)
            ============================================================ */}
        <div className="mt-14 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-mono text-[11px] text-[var(--text-faint)]">
            © 2026 Hujaif Belim. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-[var(--text-faint)]">
            Ahmedabad, India · Open to Internships
          </p>
        </div>

        {/* ============================================================
            WORDMARK: GIANT CROPPED DISPLAY SERIF
            ============================================================ */}
        <div className="mt-8 -mb-4 overflow-hidden pointer-events-none select-none text-center" aria-hidden="true">
          <h2
            className="font-serif text-[clamp(64px,14vw,200px)] leading-[0.88] tracking-tight whitespace-nowrap"
            style={{ color: 'rgba(244, 238, 227, 0.05)' }}
          >
            Hujaif Belim
          </h2>
        </div>
      </Container>
    </footer>
  );
}

