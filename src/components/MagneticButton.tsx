/**
 * MagneticButton — Button that subtly follows the cursor when hovered,
 * creating a magnetic pull effect.
 */

import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  cursorLabel?: string;
  'aria-label'?: string;
}

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  variant = 'default',
  cursorLabel = 'View',
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Magnetic pull: 20% of distance from center
    const x = (e.clientX - centerX) * 0.2;
    const y = (e.clientY - centerY) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const classes = `magnetic-btn ${variant === 'primary' ? 'magnetic-btn--primary' : ''} ${className}`;

  const content = (
    <motion.div
      ref={ref}
      className={classes}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor={cursorLabel}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', display: 'inline-block' }}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, display: 'inline-block' }}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

