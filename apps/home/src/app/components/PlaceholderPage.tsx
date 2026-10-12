import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from './ui/icons';
import { Ecg } from './ui/Ornaments';
import { Eyebrow } from './ui/SectionHeading';
import Reveal from './ui/Reveal';

export interface PlaceholderPageProps {
  eyebrow: string;
  title: ReactNode;
  message: ReactNode;
  back?: { href: string; label: string };
}

/** Shell for routes that do not have real content yet (dynamic stubs, events). */
export default function PlaceholderPage({ eyebrow, title, message, back }: PlaceholderPageProps) {
  return (
    <section className="grain relative isolate overflow-hidden">
      <div aria-hidden="true" className="glow-halo absolute inset-0 -z-10" />
      <div className="container-x flex min-h-[78vh] flex-col justify-center pb-24 pt-[calc(var(--header-h)+72px)]">
        <Eyebrow className="mb-8">{eyebrow}</Eyebrow>
        <Reveal as="h1" className="display max-w-[16ch] break-words">
          {title}
        </Reveal>
        <Reveal as="p" delay={160} className="lede mt-8 max-w-xl">
          {message}
        </Reveal>
        {back && (
          <Reveal delay={240} className="mt-10">
            <Link href={back.href} className="btn btn-ghost">
              <ArrowLeft size={16} />
              <span>{back.label}</span>
            </Link>
          </Reveal>
        )}
      </div>
      <Ecg beats={5} className="absolute inset-x-0 bottom-10 -z-10 h-16 w-full opacity-70" />
    </section>
  );
}
