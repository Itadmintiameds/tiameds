'use client';

import { useEffect } from 'react';

/** Feeds pointer coordinates to the nearest `.spotlight` element (CSS draws the glow). One listener site-wide. */
export default function SpotlightController() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!last) return;
      const target = last.target as Element | null;
      const el = target?.closest?.('.spotlight') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${last.clientX - rect.left}px`);
      el.style.setProperty('--my', `${last.clientY - rect.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
