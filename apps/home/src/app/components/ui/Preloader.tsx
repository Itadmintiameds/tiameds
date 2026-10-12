'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INTRO_EVENT, INTRO_STORAGE_KEY } from './intro';
import TypeLines from './TypeLines';

const STATUS_LINES = [
  'Initialising tiameds.ai',
  'Connecting hospitals, laboratories & pharmacies',
  'Syncing blood banks, sports & wellness',
  'Systems online',
];

const ECG_PATH =
  'M0 40 H120 l10 -6 l10 6 H170 l6 4 l8 -34 l8 48 l7 -18 H250 l12 -9 l12 9 H330 H400 l10 -6 l10 6 H450 l6 4 l8 -34 l8 48 l7 -18 H530 l12 -9 l12 9 H640';

/**
 * First-visit intro (once per session). The head script decides whether it shows, so there is no flash;
 * any key or click skips it, and CSS hides it on its own if JavaScript never arrives.
 */
export default function Preloader() {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [count, setCount] = useState(0);
  const finishedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    } catch {}
    setCount(100);
    setLeaving(true);
    document.body.style.overflow = '';
    window.dispatchEvent(new Event(INTRO_EVENT));
    timers.current.push(
      setTimeout(() => {
        document.documentElement.removeAttribute('data-intro');
        setActive(false);
      }, 1000),
    );
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute('data-intro')) return;
    setActive(true);
    document.body.style.overflow = 'hidden';

    // counter 000 -> 099 while the lines type; finish() snaps it to 100
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1500);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 99));
      if (p < 1 && !finishedRef.current) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // hard cap so the intro never overstays
    timers.current.push(setTimeout(finish, 2600));

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    const list = timers.current;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      list.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, [finish]);

  return (
    <div className={`preloader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="container-x flex flex-1 flex-col justify-between py-6 sm:py-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[#7C8392]">
          <span>TiaMeds Technologies</span>
          <span>Mysuru · India</span>
        </div>

        <div className="flex flex-col items-center gap-7">
          <Image
            src="/tiamed1.svg"
            alt=""
            width={64}
            height={64}
            unoptimized
            priority
            className="preloader-mark h-14 w-auto [filter:brightness(0)_invert(1)]"
          />
          <svg viewBox="0 0 640 80" className="h-10 w-[min(520px,80vw)]" fill="none" aria-hidden="true">
            <path d={ECG_PATH} className="stroke-white/10" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            {active && (
              <path
                d={ECG_PATH}
                pathLength={1200}
                className="ecg-draw stroke-[#4FE3B0] [filter:drop-shadow(0_0_6px_rgba(79,227,176,.7))]"
                style={{ ['--len' as string]: 1200 }}
                strokeWidth="1.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>

        <div className="flex items-end justify-between gap-6">
          {active ? (
            <TypeLines
              lines={STATUS_LINES}
              speed={9}
              lineDelay={70}
              startDelay={160}
              scrambleLast
              scrambleDuration={380}
              className="font-mono text-[12px] leading-6 sm:text-[13px]"
              lineClassName="text-[#7C8392]"
              activeLineClassName="text-white"
              onDone={() => timers.current.push(setTimeout(finish, 180))}
            />
          ) : (
            <span />
          )}
          <span className="mono-num text-5xl font-light leading-none text-white/90 sm:text-7xl">
            {String(count).padStart(3, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
