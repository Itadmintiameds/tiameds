import type { ReactNode } from 'react';
import { ButtonLink } from './ui/Button';
import { Activity, Bag, Droplet, Trend, Trophy } from './ui/icons';
import { Ecg } from './ui/Ornaments';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';

type Solution = {
  icon: ReactNode;
  name: string;
  description: string;
  items?: string[];
  layout: string;
};

// Product list + one-line descriptors from the "TiaMeds Website Changes" doc
const solutions: Solution[] = [
  {
    icon: <Activity size={20} />,
    name: 'TiaMeds One – HIMS',
    description: 'AI-Enabled Hospital Information Management System',
    items: ['TiaMeds Patient Flow', 'TiaMeds Lab', 'TiaMeds Insurance', 'TiaMeds EMR and integrated hospital workflows'],
    layout: 'md:col-span-2 lg:col-span-7 lg:row-span-2',
  },
  {
    icon: <Bag size={20} />,
    name: 'TiaMeds Marketplace',
    description: 'AI-Powered B2B Pharmaceutical Marketplace',
    items: ['TiaMeds Pharma Inventory', 'TiaMeds Pharma Marketplace'],
    layout: 'lg:col-span-5',
  },
  {
    icon: <Droplet size={20} />,
    name: 'Blood Buddy',
    description: 'AI-Enabled Blood Requirement & Blood-Bank Connectivity Platform',
    layout: 'lg:col-span-5',
  },
  {
    icon: <Trophy size={20} />,
    name: 'TiaMeds Sporty – Sports & Fitness App',
    description: 'Integrated Sports, Fitness & Wellness Platform',
    layout: 'lg:col-span-6',
  },
  {
    icon: <Trend size={20} />,
    name: 'Digital Marketing & Growth Solutions',
    description: 'AI-Powered Digital Marketing Solutions',
    layout: 'lg:col-span-6',
  },
];

const DemoTrialSection = () => {
  return (
    <section className="section relative isolate overflow-hidden border-t border-edge/10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(45%_60%_at_85%_0%,rgb(var(--halo)/0.14),transparent_70%)]" />
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            className="lg:col-span-8"
            eyebrow="Pharmaceutical Innovation"
            title={'Advanced Digital Solutions for\n*Modern Healthcare*'}
          />
          <Reveal as="p" delay={180} className="lede lg:col-span-4">
            Experience how our specialized platforms can optimize your pharmaceutical and healthcare operations through a
            personalized demonstration.
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-5">
          {solutions.map((solution, index) => (
            <Reveal
              as="li"
              key={solution.name}
              delay={index * 80}
              className={`card card-hover spotlight flex flex-col overflow-hidden p-7 sm:p-9 ${solution.layout}`}
            >
              <div className="flex items-center justify-between">
                <span className="mono-num text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/15 text-signal">
                  {solution.icon}
                </span>
              </div>

              <div className={index === 0 ? 'mt-14 lg:mt-24' : 'mt-10'}>
                <h3 className={`font-medium tracking-[-0.03em] ${index === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
                  {solution.name}
                </h3>
                <p className="mt-3 max-w-md text-mute">{solution.description}</p>
              </div>

              {solution.items && (
                <ul className="mt-8 hairline-list">
                  {solution.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 py-3 text-[0.95rem] text-ink/85">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {index === 0 && <Ecg beats={3} className="-mx-9 mt-auto h-16 w-[calc(100%_+_4.5rem)] pt-8 opacity-80" />}
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center">
          <ButtonLink href="/schedule-demo" variant="signal">
            Request Personalized Demo
          </ButtonLink>
          <p className="text-sm text-faint">See how our solutions can be tailored to your specific needs</p>
        </Reveal>
      </div>
    </section>
  );
};

export default DemoTrialSection;
