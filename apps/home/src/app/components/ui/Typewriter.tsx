'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, whenIntroDone } from './intro';

export interface TypewriterProps {
  /** One or more phrases. With several phrases and `loop`, they are typed, held and deleted in turn. */
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  /** How long a finished phrase stays on screen (ms). */
  hold?: number;
  startDelay?: number;
  loop?: boolean;
  cursor?: boolean;
  /** Start only once the element scrolls into view. */
  startOnView?: boolean;
  /** Wait for the first-visit preloader to finish (default true). */
  waitForIntro?: boolean;
  className?: string;
  onDone?: () => void;
}

/**
 * Accessible typewriter: screen readers get the full text once (sr-only), the animated copy is aria-hidden.
 * Without JavaScript the first phrase is shown; with reduced motion it renders statically.
 */
export default function Typewriter({
  phrases,
  typeSpeed = 58,
  deleteSpeed = 32,
  hold = 1900,
  startDelay = 350,
  loop = true,
  cursor = true,
  startOnView = false,
  waitForIntro = true,
  className = '',
  onDone,
}: TypewriterProps) {
  const [text, setText] = useState(phrases[0] ?? '');
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const key = phrases.join('\u0000');

  useEffect(() => {
    const list = key.split('\u0000');
    if (prefersReducedMotion()) {
      setText(list[0] ?? '');
      setReady(true);
      doneRef.current?.();
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let phrase = 0;
    let chars = 0;
    let deleting = false;

    const tick = () => {
      if (cancelled) return;
      const full = list[phrase] ?? '';
      if (!deleting) {
        chars += 1;
        setText(full.slice(0, chars));
        if (chars >= full.length) {
          const last = phrase === list.length - 1;
          if (!loop && last) {
            doneRef.current?.();
            return;
          }
          deleting = true;
          timer = setTimeout(tick, hold);
          return;
        }
        timer = setTimeout(tick, typeSpeed + Math.random() * typeSpeed * 0.6);
      } else {
        chars -= 1;
        setText(full.slice(0, Math.max(0, chars)));
        if (chars <= 0) {
          deleting = false;
          phrase = (phrase + 1) % list.length;
          timer = setTimeout(tick, 360);
          return;
        }
        timer = setTimeout(tick, deleteSpeed);
      }
    };

    const begin = () => {
      if (cancelled) return;
      setText('');
      setReady(true);
      timer = setTimeout(tick, startDelay);
    };

    let io: IntersectionObserver | undefined;
    const arm = () => {
      if (!startOnView || !rootRef.current) return begin();
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            begin();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      io.observe(rootRef.current);
    };

    const cancelIntro = waitForIntro ? whenIntroDone(arm) : (arm(), () => {});

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      io?.disconnect();
      cancelIntro();
    };
  }, [key, typeSpeed, deleteSpeed, hold, startDelay, loop, startOnView, waitForIntro]);

  const srText = phrases.length > 1 ? phrases.join(', ') : phrases[0];

  return (
    <span ref={rootRef} className={className} data-typewriter="" data-ready={ready ? '' : undefined}>
      <span className="sr-only">{srText}</span>
      <span aria-hidden="true" className="tw-display">
        {text}
        {cursor && <span className="caret" />}
      </span>
    </span>
  );
}
