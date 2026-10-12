import { ButtonLink } from './ui/Button';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';

const services = [
  {
    title: 'Custom Software Development',
    description: 'Tailored solutions built to your exact specifications and business requirements.',
  },
  {
    title: 'Enterprise Systems',
    description: 'Scalable architecture designed for large organizations with complex needs.',
  },
  {
    title: 'Security Solutions',
    description: 'End-to-end protection for your digital assets and infrastructure.',
  },
  {
    title: 'Cloud Services',
    description: 'Migration, optimization, and management of cloud infrastructure.',
  },
  {
    title: 'AI Integration',
    description: 'Implementing intelligent automation and machine learning capabilities.',
  },
  {
    title: 'Data Analytics',
    description: 'Transforming raw data into actionable business insights.',
  },
];

/** Home: technology services. */
const About = () => {
  return (
    <section id="services" className="section">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="self-start lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:col-span-5">
          <SectionHeading
            eyebrow="Technology Services"
            title={'Enterprise-Grade\n*Technical* Expertise'}
            lede="We architect, build, and maintain sophisticated technology solutions for businesses that demand reliability, security, and scalability."
          />
          <Reveal delay={260} className="mt-10">
            <ButtonLink href="/services">Explore Our Services</ButtonLink>
          </Reveal>
        </div>

        <ol className="hairline-list lg:col-span-7">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.title}
              delay={i * 70}
              className="group grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 py-7 sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-x-8 sm:py-9"
            >
              <span className="mono-num pt-1.5 text-sm text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-xl font-medium tracking-[-0.02em] transition-colors duration-300 group-hover:text-signal sm:text-2xl">
                {service.title}
              </h3>
              <p className="col-start-2 text-mute sm:col-start-auto sm:pt-1">{service.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default About;
