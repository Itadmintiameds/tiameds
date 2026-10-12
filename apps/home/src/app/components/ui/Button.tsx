import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from './icons';

type Variant = 'primary' | 'signal' | 'ghost';

export interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  /** 'arrow' → horizontal arrow, 'diag' → ↗, 'none' → text only */
  icon?: 'arrow' | 'diag' | 'none';
  className?: string;
  ariaLabel?: string;
}

// Literal class names so Tailwind's content scanner keeps them (no `btn-${variant}` interpolation)
const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  signal: 'btn-signal',
  ghost: 'btn-ghost',
};

/** Pill CTA. Internal routes use next/link; mailto:, tel: and absolute URLs render a plain anchor. */
export function ButtonLink({ href, children, variant = 'primary', icon = 'arrow', className = '', ariaLabel }: ButtonLinkProps) {
  const cls = `btn ${VARIANT_CLASS[variant]} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {icon === 'arrow' && <ArrowRight size={16} className="btn-icon" />}
      {icon === 'diag' && <ArrowUpRight size={16} className="btn-icon btn-icon-diag" />}
    </>
  );
  const external = /^(https?:|mailto:|tel:|#)/.test(href);
  if (external) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}
