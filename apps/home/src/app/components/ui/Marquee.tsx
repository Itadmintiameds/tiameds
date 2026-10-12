import type { CSSProperties, ReactNode } from 'react';

export interface MarqueeProps {
  items: ReactNode[];
  /** seconds per loop */
  duration?: number;
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
}

/** CSS-only infinite strip; pauses on hover, becomes a static wrapped list with reduced motion. */
export default function Marquee({ items, duration = 42, className = '', itemClassName = '', separator }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className={`flex shrink-0 items-center gap-[var(--gap)] ${itemClassName}`}>
          {item}
          {separator && <span aria-hidden="true">{separator}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee ${className}`} style={{ ['--marquee-duration' as string]: `${duration}s` } as CSSProperties}>
      {row(false)}
      {row(true)}
    </div>
  );
}
