'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './intro';
import ScrambleText from './ScrambleText';

export interface TypeLinesProps {
  lines: string[];
  /** ms per character */
  speed?: number;
  /** pause between lines (ms) */
  lineDelay?: number;
  startDelay?: number;
  /** Decode the final line with a scramble instead of typing it. */
  scrambleLast?: boolean;
  scrambleDuration?: number;
  prefix?: string;
  className?: string;
  lineClassName?: string;
  activeLineClassName?: string;
  onDone?: () => void;
}

/** Terminal-style multi-line typing, one line after another. Renders all lines instantly with reduced motion. */
export default function TypeLines({
  lines,
  speed = 18,
  lineDelay = 140,
  startDelay = 120,
  scrambleLast = false,
  scrambleDuration = 480,
  prefix = '>',
  className = '',
  lineClassName = '',
  activeLineClassName = '',
  onDone,
}: TypeLinesProps) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const [complete, setComplete] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const key = lines.join('\u0000');

  useEffect(() => {
    const list = key.split('\u0000');
    if (prefersReducedMotion()) {
      setLine(list.length - 1);
      setChars(list[list.length - 1].length);
      setComplete(true);
      doneRef.current?.();
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let l = 0;
    let c = 0;

    const finish = () => {
      setComplete(true);
      doneRef.current?.();
    };

    const tick = () => {
      if (cancelled) return;
      const isLast = l === list.length - 1;
      if (isLast && scrambleLast) {
        // last line is handed to ScrambleText; give it time to decode
        setLine(l);
        setChars(list[l].length);
        timer = setTimeout(finish, scrambleDuration + 40);
        return;
      }
      c += 1;
      setLine(l);
      setChars(c);
      if (c >= list[l].length) {
        if (isLast) return finish();
        l += 1;
        c = 0;
        timer = setTimeout(tick, lineDelay);
        return;
      }
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, startDelay);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [key, speed, lineDelay, startDelay, scrambleLast, scrambleDuration]);

  return (
    <div className={className}>
      <span className="sr-only">{lines.join('. ')}</span>
      <div aria-hidden="true">
        {lines.map((text, i) => {
          if (i > line) return null;
          const active = i === line && !complete;
          const shown = i < line ? text : text.slice(0, chars);
          const isScrambled = scrambleLast && i === lines.length - 1;
          return (
            <div key={i} className={`${lineClassName} ${active || (complete && i === lines.length - 1) ? activeLineClassName : ''}`}>
              {prefix && <span className="mr-2 opacity-50">{prefix}</span>}
              {isScrambled ? <ScrambleText text={text} trigger="mount" duration={scrambleDuration} /> : shown}
              {active && !isScrambled && <span className="caret" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
