/**
 * CustomCursor — Small ember dot with a trailing ring that grows
 * over interactive elements and shows contextual labels.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [label, setLabel] = useState('');
  const [isTouch, setIsTouch] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const rafRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });

  // Detect touch devices
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const updatePosition = useCallback(() => {
    cursorX.set(mousePos.current.x);
    cursorY.set(mousePos.current.y);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Track interactive elements for label and grow effect
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'a, button, [data-cursor], [role="button"], input, textarea, select'
      );

      if (interactive) {
        setIsHovering(true);
        const cursorLabel = interactive.getAttribute('data-cursor') || '';
        setLabel(cursorLabel);
      } else {
        setIsHovering(false);
        setLabel('');
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, isVisible, updatePosition]);

  // Don't render on touch devices
  if (isTouch) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#FF5A1F',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: isVisible ? 1 : 0,
          mixBlendMode: 'normal',
        }}
      />

      {/* Ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9997,
          opacity: isVisible ? 1 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={{
          width: isHovering ? 56 : 32,
          height: isHovering ? 56 : 32,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid rgba(244, 238, 227, 0.40)',
            backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: 'var(--text-faint)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </motion.span>
          )}
        </div>
      </motion.div>
    </>
  );
}

