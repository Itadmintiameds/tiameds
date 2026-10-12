import { ButtonLink } from './ui/Button';
import { Activity, Clipboard, Droplet, Package, Trophy, Truck } from './ui/icons';
import Reveal from './ui/Reveal';
import { Eyebrow } from './ui/SectionHeading';
import SplitText from './ui/SplitText';

// Section 6 of the "TiaMeds Website Changes" doc — wording kept exactly
const ecosystem = [
  {
    name: 'Hospitals',
    description: 'Integrated hospital management, clinical workflows and patient records.',
    icon: <Activity size={18} />,
  },
  {
    name: 'Laboratories',
    description: 'Digital laboratory operations, reporting and AI-assisted observations.',
    icon: <Clipboard size={18} />,
  },
  {
    name: 'Pharmacies',
    description: 'Inventory visibility, stock management and replenishment intelligence.',
    icon: <Package size={18} />,
  },
  {
    name: 'Pharmaceutical Businesses',
    description: 'Digital procurement, supplier connectivity and transaction traceability.',
    icon: <Truck size={18} />,
  },
  {
    name: 'Blood Banks and Hospitals',
    description: 'Blood requirement registration, availability search and coordination.',
    icon: <Droplet size={18} />,
  },
  {
    name: 'Sports and Wellness',
    description: 'Facility discovery, digital booking and an expanding wellness ecosystem.',
    icon: <Trophy size={18} />,
  },
];

const EcosystemSection = () => {
  return (
    <section className="section relative isolate overflow-hidden border-t border-edge/10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(40%_45%_at_10%_20%,rgb(var(--signal)/0.07),transparent_70%)]" />
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <SplitText
            text={'One Technology Ecosystem.\n*Multiple Connected Solutions.*'}
            className="h-section lg:col-span-7"
          />
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-mute lg:col-span-5 lg:pt-3">
            <Reveal as="p" delay={120}>
              TiaMeds Technologies is building an integrated digital ecosystem across healthcare, pharmaceutical commerce and
              wellness. Our AI-enabled technology solutions are designed to connect hospital operations, laboratory workflows,
              pharmacy inventory, pharmaceutical procurement and sports facility management through intelligent digital
              experiences.
            </Reveal>
            <Reveal as="p" delay={200}>
              By bringing fragmented workflows together, TiaMeds aims to help organisations improve operational visibility,
              strengthen coordination and create a foundation for scalable digital services.
            </Reveal>
          </div>
        </div>

        <div className="mt-20">
          <Eyebrow className="mb-8">Our Ecosystem Connects</Eyebrow>
          <ul className="grid gap-px overflow-hidden rounded-[22px] border border-edge/10 bg-edge/10 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map((item, i) => (
              <Reveal
                as="li"
                key={item.name}
                type="fade"
                delay={i * 70}
                className="spotlight relative bg-canvas p-8 transition-colors duration-500 hover:bg-surface sm:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="mono-num text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-signal">{item.icon}</span>
                </div>
                <h3 className="mt-12 text-xl font-medium tracking-[-0.02em]">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-mute">{item.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="mt-24 flex flex-col gap-10 border-t border-edge/10 pt-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SplitText as="h3" text="Building the Digital Infrastructure of Tomorrow" className="h-sub max-w-[20ch]" />
            <Reveal as="p" delay={160} className="lede mt-4">
              Connected workflows. Intelligent technology. Scalable digital solutions.
            </Reveal>
          </div>
          <Reveal delay={240} className="flex flex-wrap gap-3">
            <ButtonLink href="/product">Explore Our Ecosystem</ButtonLink>
            <ButtonLink href="/schedule-demo" variant="ghost">
              Request a Demo
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
