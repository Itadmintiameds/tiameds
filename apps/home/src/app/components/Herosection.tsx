import { ButtonLink } from './ui/Button';
import LiveClock from './ui/LiveClock';
import Marquee from './ui/Marquee';
import { Ecg, Rings } from './ui/Ornaments';
import Reveal from './ui/Reveal';
import { Eyebrow } from './ui/SectionHeading';
import SplitText from './ui/SplitText';
import Typewriter from './ui/Typewriter';

// Who the platform serves (from the "Our Ecosystem Connects" list)
const audiences = ['hospitals.', 'laboratories.', 'pharmacies.', 'pharmaceutical businesses.', 'blood banks.', 'sports and wellness.'];

const capabilities = ['Processing', 'Cloud', 'Database', 'Security', 'AI', 'Server', 'Encryption'];

const Herosection = () => {
  return (
    <>
      <section className="grain relative isolate overflow-hidden">
        <div aria-hidden="true" className="glow-halo absolute inset-0 -z-10" />
        <Rings className="absolute -right-[34rem] top-[42%] -z-10 h-[64rem] w-[64rem] -translate-y-1/2 opacity-80 sm:-right-[26rem] lg:-right-72" />

        <div className="container-x flex min-h-[100svh] flex-col pb-8 pt-[calc(var(--header-h)+40px)]">
          <div className="flex flex-1 flex-col justify-center py-10 sm:py-16">
            <Eyebrow>Enterprise-Grade Tech Solutions</Eyebrow>

            <SplitText
              as="h1"
              text={'Building the Digital\n*Infrastructure* of Tomorrow'}
              className="display mt-8 max-w-[14ch]"
            />

            <Reveal delay={380} className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[0.95rem] text-mute sm:text-lg">
              <span className="text-faint" aria-hidden="true">
                {'//'}
              </span>
              <span>Built for</span>
              <Typewriter phrases={audiences} className="text-ink" startDelay={700} />
            </Reveal>

            <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-end">
              <Reveal delay={460} className="lg:col-span-6">
                <p className="lede max-w-xl">
                  TiaMeds Technologies Pvt. Ltd. delivers cutting-edge SaaS platforms and enterprise solutions that power
                  businesses at scale with security, reliability, and innovation.
                </p>
              </Reveal>
              <Reveal delay={540} className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
                <ButtonLink href="/contact-for-services">Start Your Project</ButtonLink>
                <ButtonLink href="/techstack" variant="ghost" icon="diag">
                  Explore Our Tech Stack
                </ButtonLink>
              </Reveal>
            </div>
          </div>

          <Ecg className="-mx-[clamp(20px,4vw,56px)] h-16 w-[calc(100%_+_2*clamp(20px,4vw,56px))] sm:h-20" />

          <div className="mt-4 flex items-center justify-between gap-6 border-t border-edge/10 pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse-dot" aria-hidden="true" />
              Mysuru, Karnataka · <LiveClock className="text-mute" />
            </p>
            <p className="hidden sm:block">Healthcare · Pharma · Wellness</p>
            <a href="#services" className="group inline-flex items-center gap-3 transition-colors hover:text-ink">
              Scroll
              <span aria-hidden="true" className="relative h-6 w-px overflow-hidden bg-edge/15">
                <span className="absolute inset-x-0 top-0 h-2 bg-signal motion-safe:animate-[scrollcue_1.8s_cubic-bezier(.65,0,.35,1)_infinite]" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section aria-label="Capabilities" className="border-y border-edge/10 py-8">
        <div className="container-x mb-6 flex items-center justify-between">
          <p className="eyebrow">Trusted by innovators worldwide</p>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:block">Core capabilities</p>
        </div>
        <Marquee
          duration={36}
          items={capabilities.map((c) => (
            <span key={c} className="text-[clamp(1.6rem,3.6vw,2.75rem)] font-medium tracking-[-0.04em] text-ink/80">
              {c}
            </span>
          ))}
          separator={<span className="text-xl text-signal">✦</span>}
        />
      </section>
    </>
  );
};

export default Herosection;
