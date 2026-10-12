'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './intro';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';

export interface ScrambleTextProps {
  text: string;
  /** 'view' decodes when scrolled into view, 'hover' re-decodes on pointer enter, 'mount' runs immediately. */
  trigger?: 'view' | 'hover' | 'mount';
  duration?: number;
  className?: string;
}

/**
 * Decode effect: characters resolve left to right out of random glyphs.
 * The real text is always in the DOM for assistive tech and no-JS visitors.
 */
export default function ScrambleText({ text, trigger = 'view', duration = 650, className = '' }: ScrambleTextProps) {
  const [out, setOut] = useState(text);
  const rootRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  const run = useCallback(() => {
    if (prefersReducedMotion()) return;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < revealed || ch === ' ' || ch === '·' || ch === '.') s += ch;
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setOut(text);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [text, duration]);

  useEffect(() => {
    setOut(text);
    if (trigger === 'mount') run();
    let io: IntersectionObserver | undefined;
    if (trigger === 'view' && rootRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            run();
          }
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      io.observe(rootRef.current);
    }
    return () => {
      io?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, trigger, run]);

  return (
    <span ref={rootRef} className={className} onPointerEnter={trigger === 'hover' ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
