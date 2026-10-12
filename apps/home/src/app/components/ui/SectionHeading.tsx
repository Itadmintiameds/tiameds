import type { ElementType, ReactNode } from 'react';
import Reveal from './Reveal';
import ScrambleText from './ScrambleText';
import SplitText from './SplitText';

export function Eyebrow({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) {
  return (
    <Reveal as="p" type="fade" delay={delay} className={`eyebrow ${className}`}>
      <span className="eyebrow-dot" aria-hidden="true" />
      <ScrambleText text={children} trigger="view" />
    </Reveal>
  );
}

export interface SectionHeadingProps {
  eyebrow?: string;
  /** Supports *serif italic* accents and \n line breaks (see SplitText). */
  title: string;
  lede?: ReactNode;
  as?: ElementType;
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
  ledeClassName?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  as = 'h2',
  align = 'left',
  className = '',
  titleClassName = 'h-section',
  ledeClassName = '',
}: SectionHeadingProps) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
      <SplitText as={as} text={title} className={`${titleClassName} ${center ? 'mx-auto' : ''}`} />
      {lede && (
        <Reveal as="p" delay={160} className={`lede mt-6 max-w-2xl ${center ? 'mx-auto' : ''} ${ledeClassName}`}>
          {lede}
        </Reveal>
      )}
    </div>
  );
}
