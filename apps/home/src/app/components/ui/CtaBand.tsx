import type { ReactNode } from 'react';
import { Rings } from './Ornaments';
import Reveal from './Reveal';
import SplitText from './SplitText';

export interface CtaBandProps {
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Closing statement for a page: large headline, short lede, one or two actions. */
export default function CtaBand({ title, lede, actions, className = '' }: CtaBandProps) {
  return (
    <section className={`section relative isolate overflow-hidden border-t border-edge/10 ${className}`}>
      <Rings className="absolute left-1/2 top-1/2 -z-10 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_50%_50%,rgb(var(--halo)/0.12),transparent_70%)]" />
      <div className="container-x text-center">
        <SplitText text={title} className="h-section mx-auto max-w-[18ch]" />
        {lede && (
          <Reveal as="p" delay={160} className="lede mx-auto mt-6 max-w-xl">
            {lede}
          </Reveal>
        )}
        {actions && (
          <Reveal delay={260} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </Reveal>
        )}
      </div>
    </section>
  );
}
