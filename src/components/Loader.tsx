/**
 * Loader — Full-screen intro where particles fly in from random positions
 * and assemble into the portrait. Max 2.5s with a visible Skip button.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleEngine } from '@/engine/ParticleEngine';

interface LoaderProps {
  onComplete: () => void;
  particleEngine: ParticleEngine | null;
}

export default function Loader({ onComplete, particleEngine }: LoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  }, [onComplete]);

  useEffect(() => {
    // Max 1.2s hard timeout guarantee
    const maxTimeout = setTimeout(() => {
      handleSkip();
    }, 1200);

    return () => clearTimeout(maxTimeout);
  }, [handleSkip]);

  useEffect(() => {
    // Smooth progress timer (completes in ~850ms)
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / 850, 1);
      setProgress(p);

      if (p >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }
    }, 35);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onComplete]);

  // Respect prefers-reduced-motion: skip loader entirely
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      particleEngine?.skipToAssembled();
      setIsVisible(false);
      onComplete();
    }
  }, [particleEngine, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loader-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Progress bar */}
          <div
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              zIndex: 101,
            }}
          >
            <div
              style={{
                width: '120px',
                height: '1px',
                background: 'var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  background: 'var(--color-ember)',
                  width: `${progress * 100}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="label-mono" style={{ fontSize: '0.625rem', color: '#6B6558' }}>
              {Math.round(progress * 100)}%
            </span>
          </div>

          {/* Skip button */}
          <button
            className="skip-button"
            onClick={handleSkip}
            data-cursor="Skip"
            aria-label="Skip loading animation"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

