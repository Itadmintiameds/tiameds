'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import BrandMark from './ui/BrandMark';
import { ArrowRight, Mail, Phone } from './ui/icons';
import LiveClock from './ui/LiveClock';

const navigation = [
  { name: 'About Us', href: '/about' },
  { name: 'Product', href: '/product' },
  { name: 'Services', href: '/services' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact Us', href: '/contact' },
];

const HeaderNav = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // solid background after a little scroll; hide on scroll down, reveal on scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // close the menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // menu: lock scroll, focus first link, trap focus, Escape closes
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const shell = shellRef.current;
    const focusables = () =>
      Array.from(shell?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter(
        (el) => el.offsetParent !== null,
      );
    requestAnimationFrame(() => shell?.querySelector<HTMLElement>('[data-menu-link]')?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const solid = scrolled || open;

  return (
    <div ref={shellRef}>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ease-out-quint ${
          solid ? 'border-edge/10 bg-canvas/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
        } ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <nav aria-label="Primary" className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <BrandMark onClick={() => setOpen(false)} />

          <ul className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`link-sweep text-[0.9rem] transition-colors ${isActive(item.href) ? 'text-ink' : 'text-mute hover:text-ink'}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint xl:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse-dot" aria-hidden="true" />
              Mysuru
              <LiveClock seconds={false} className="text-mute" />
            </span>
            <Link href="/schedule-demo" className="btn btn-primary hidden min-h-[40px] px-4 text-[0.85rem] sm:inline-flex">
              <span>Request a Demo</span>
              <ArrowRight size={15} className="btn-icon" />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              <span
                aria-hidden="true"
                className={`absolute h-px w-6 bg-ink transition-transform duration-500 ease-out-quint ${open ? 'rotate-45' : '-translate-y-[4px]'}`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-px w-6 bg-ink transition-transform duration-500 ease-out-quint ${open ? '-rotate-45' : 'translate-y-[4px]'}`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile / tablet menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        // visibility only transitions on close: when opening it must flip at once, or focusing the first link fails
        className={`fixed inset-0 z-40 bg-canvas duration-700 ease-out-quint lg:hidden ${
          open
            ? 'visible transition-[clip-path] [clip-path:inset(0_0_0_0)]'
            : 'invisible transition-[clip-path,visibility] [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="container-x flex h-full flex-col justify-between pb-10 pt-[calc(var(--header-h)+40px)]">
          <ul className="space-y-1">
            {navigation.map((item, i) => (
              <li key={item.name} className="overflow-hidden">
                <Link
                  href={item.href}
                  data-menu-link=""
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  style={{ transitionDelay: open ? `${120 + i * 55}ms` : '0ms' }}
                  className={`group flex items-baseline gap-4 py-2 text-[clamp(2.2rem,9vw,3.5rem)] font-medium leading-tight tracking-[-0.04em] transition-[transform,color] duration-700 ease-out-quint ${
                    open ? 'translate-y-0' : 'translate-y-full'
                  } ${isActive(item.href) ? 'text-ink' : 'text-mute hover:text-ink'}`}
                >
                  <span className="mono-num text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`space-y-6 transition-opacity duration-700 ${open ? 'opacity-100 delay-300' : 'opacity-0'}`}>
            <Link
              href="/schedule-demo"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="btn btn-signal w-full"
            >
              <span>Request a Demo</span>
              <ArrowRight size={16} className="btn-icon" />
            </Link>
            <div className="grid gap-3 text-sm text-mute">
              <a href="mailto:support@tiameds.ai" tabIndex={open ? 0 : -1} className="inline-flex items-center gap-3 hover:text-ink">
                <Mail size={16} /> support@tiameds.ai
              </a>
              <a href="tel:7678325053" tabIndex={open ? 0 : -1} className="inline-flex items-center gap-3 hover:text-ink">
                <Phone size={16} /> +91 7678325053
              </a>
            </div>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              Mysuru, India · <LiveClock className="text-mute" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
