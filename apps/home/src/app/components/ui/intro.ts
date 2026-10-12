// Shared contract between the head script, the Preloader and anything that should wait for it.
export const INTRO_EVENT = 'tiameds:intro-done';
export const INTRO_STORAGE_KEY = 'tm-intro-seen';

/** Inline <head> script: runs before first paint. Flags JS and, on a first visit, the intro overlay. */
export const INTRO_HEAD_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js');var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('${INTRO_STORAGE_KEY}')){d.setAttribute('data-intro','')}}catch(e){}})();`;

/** Run `cb` once the intro overlay is gone (immediately if there is none). Returns a cleanup. */
export function whenIntroDone(cb: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  if (!document.documentElement.hasAttribute('data-intro')) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(INTRO_EVENT, handler, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, handler);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
