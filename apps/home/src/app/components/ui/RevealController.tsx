'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { prefersReducedMotion, whenIntroDone } from './intro';

/**
 * One IntersectionObserver for the whole site: any element with [data-reveal] gets `.is-in` when it
 * enters the viewport. Server components only need the attribute, no client code per element.
 */
export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    const track = (el: Element) => {
      if (el.classList.contains('is-in')) return;
      if (reduce) el.classList.add('is-in');
      else io.observe(el);
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]').forEach(track);
    };

    let mo: MutationObserver | undefined;
    const start = () => {
      scan(document);
      mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.hasAttribute('data-reveal')) track(node);
            scan(node);
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };

    const cancel = whenIntroDone(start);
    return () => {
      cancel();
      io.disconnect();
      mo?.disconnect();
    };
  }, [pathname]);

  return null;
}
