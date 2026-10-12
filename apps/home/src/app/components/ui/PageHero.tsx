import type { ReactNode } from 'react';
import { Rings } from './Ornaments';
import Reveal from './Reveal';
import { Eyebrow } from './SectionHeading';
import SplitText from './SplitText';

export interface PageHeroProps {
  eyebrow?: string;
  /** Supports *serif italic* accents and \n line breaks. */
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Extra content under the hero copy (meta row, stats…) */
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
}

/** Shared top section for inner pages: atmosphere, eyebrow, masked title, lede and actions. */
export default function PageHero({ eyebrow, title, lede, actions, children, className = '', titleClassName = '' }: PageHeroProps) {
  return (
    <section className={`grain relative isolate overflow-hidden ${className}`}>
      <div aria-hidden="true" className="glow-halo absolute inset-0 -z-10" />
      <Rings className="absolute -right-[22rem] -top-40 -z-10 h-[52rem] w-[52rem] opacity-70 sm:-right-64" />
      <div className="container-x pb-[clamp(64px,8vw,112px)] pt-[calc(var(--header-h)+clamp(56px,9vw,128px))]">
        {eyebrow && <Eyebrow className="mb-8">{eyebrow}</Eyebrow>}
        <SplitText as="h1" text={title} className={`display max-w-[15ch] ${titleClassName}`} />
        {lede && (
          <Reveal as="p" delay={220} className="lede mt-8 max-w-2xl">
            {lede}
          </Reveal>
        )}
        {actions && (
          <Reveal delay={320} className="mt-10 flex flex-wrap items-center gap-3">
            {actions}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
