import type { ReactNode } from 'react'
import { ButtonLink } from '../components/ui/Button'
import CtaBand from '../components/ui/CtaBand'
import { Chart, Cloud, Code, Server, Shield, Zap } from '../components/ui/icons'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'

type Product = { name: string; description: string; status?: string; highlights: string[] }

const values: { name: string; icon: ReactNode; description: string }[] = [
  {
    name: 'Innovation',
    icon: <Zap size={20} />,
    description: 'We push boundaries to deliver cutting-edge healthcare technology solutions that transform patient care.',
  },
  {
    name: 'Integrity',
    icon: <Shield size={20} />,
    description: 'We maintain the highest ethical standards in all our products and client relationships.',
  },
  {
    name: 'Excellence',
    icon: <Chart size={20} />,
    description: 'We strive for perfection in every solution we deliver, ensuring exceptional quality and performance.',
  },
]

const services: { name: string; icon: ReactNode; description: string; features: string[] }[] = [
  {
    name: 'Cloud Solutions',
    icon: <Cloud size={22} />,
    description: 'Secure, HIPAA-compliant cloud infrastructure for healthcare applications',
    features: ['AWS hosting', 'Auto-scaling', 'Disaster recovery', '99.9% uptime'],
  },
  {
    name: 'Software Development',
    icon: <Code size={22} />,
    description: 'Custom healthcare software tailored to your specific needs',
    features: ['Web & mobile apps', 'EHR integrations', 'AI-powered features', 'User-centered design'],
  },
  {
    name: 'Data Management',
    icon: <Server size={22} />,
    description: 'Secure handling and analysis of sensitive healthcare data',
    features: ['HL7/FHIR compliant', 'Real-time analytics', 'Data encryption', 'Automated backups'],
  },
]

// From the "TiaMeds Website Changes" doc
const products: Product[] = [
  {
    name: 'TiaMeds One – HIMS',
    description: 'AI-Enabled Hospital Information Management System',
    highlights: [
      'Patient registration and electronic medical records (EMR)',
      'OPD, IPD and appointment management',
      'Doctor and nursing workflow management',
      'Pharmacy and inventory integration',
    ],
  },
  {
    name: 'TiaMeds Lab',
    description: 'AI-Enabled Laboratory Management & Diagnostic Reporting',
    highlights: [
      'Digital test ordering and sample registration',
      'Automated sample tracking and real-time result management',
      'Structured laboratory results with reference ranges',
      'High, low and normal result alerts',
    ],
  },
  {
    name: 'TiaMeds Insurance',
    description: 'Simplifying Insurance Workflows for Healthcare Providers',
    status: 'Proposed',
    highlights: [
      'Patient insurance records and policy information',
      'Insurance documentation management',
      'Insurance verification workflow support',
      'Billing and insurance coordination',
    ],
  },
  {
    name: 'TiaMeds Patient Flow',
    description: 'Connected Patient Workflow Management',
    status: 'Proposed',
    highlights: [
      'Patient registration and visit tracking',
      'Appointment and consultation workflow coordination',
      'Patient movement across hospital departments',
      'Diagnostic workflow coordination',
    ],
  },
  {
    name: 'TiaMeds Marketplace',
    description: 'AI-Powered B2B Pharmaceutical Marketplace',
    highlights: [
      'B2B Pharmaceutical Connectivity',
      'Digital Product Catalogue',
      'RFQ and Price Comparison',
      'Digital Procurement and Order Management',
    ],
  },
  {
    name: 'TiaMeds Pharma Inventory',
    description: 'AI-Enabled Pharmacy Inventory Management',
    highlights: [
      'Real-time stock management and monitoring',
      'Batch tracking and expiry management',
      'Purchase and sales management',
      'Billing and inventory integration',
    ],
  },
  {
    name: 'Blood Buddy',
    description: 'AI-Enabled Blood Requirement & Blood-Bank Connectivity Platform',
    highlights: [
      'Digital blood requirement registration',
      'Blood-bank availability search',
      'Intelligent blood-bank matching',
      'Blood-bank details and location sharing',
    ],
  },
  {
    name: 'TiaMeds Sporty – Sports & Fitness App',
    description: 'Integrated Sports, Fitness & Wellness Platform',
    highlights: [
      'Indoor and outdoor sports facility management',
      'Sports and facility discovery',
      'Available time-slot viewing',
      'Online slot booking and booking confirmation',
    ],
  },
  {
    name: 'Digital Marketing & Growth Solutions',
    description: 'AI-Powered Digital Marketing Solutions',
    highlights: [
      'Search Engine Optimisation (SEO)',
      'Answer Engine Optimisation (AEO) and Generative Engine Optimisation (GEO)',
      'Google Ads and Meta Ads campaign management',
      'Social media strategy and content marketing',
    ],
  },
]

const AboutPage = () => {
  return (
    <>
      <PageHero
        eyebrow="About TiaMeds"
        title={'Transforming *Healthcare*\nThrough Technology'}
        lede="TiaMeds Technologies Pvt. Ltd. is a forward-thinking healthcare and pharmaceutical IT company driving digital transformation across the medical landscape. We specialize in building scalable SaaS platforms, AI-powered solutions, and custom enterprise software that streamline clinical workflows, accelerate drug development, and enhance patient care."
      />

      {/* Mission */}
      <section className="section border-t border-edge/10">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Purpose" title="Our Mission" titleClassName="h-sub" />
          </div>
          <div className="lg:col-span-8">
            <Reveal as="p" className="text-[clamp(1.4rem,2.6vw,2.15rem)] font-medium leading-[1.25] tracking-[-0.025em] text-ink">
              At TiaMeds Technologies, our mission is to revolutionize healthcare by developing intelligent, secure, and scalable
              technology solutions that empower providers, streamline clinical workflows, and improve patient outcomes.{' '}
              <span className="text-mute">We believe technology should simplify healthcare — removing inefficiencies, not adding complexity.</span>
            </Reveal>
            <Reveal as="p" delay={140} className="mt-10 max-w-2xl leading-relaxed text-mute">
              Founded by a team of experienced healthcare professionals and technologists, TiaMeds bridges the gap between medicine
              and technology. With decades of combined expertise, we develop practical, high-impact solutions tailored for
              real-world clinical environments — ensuring our innovations deliver measurable value where it matters most.
            </Reveal>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section border-t border-edge/10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Capabilities"
            title="Our Services"
            lede="Custom technology solutions designed specifically for healthcare organizations"
          />
          <ul className="mt-14 grid gap-4 md:grid-cols-3">
            {services.map((service, index) => (
              <Reveal as="li" key={service.name} delay={index * 90} className="card card-hover spotlight flex flex-col p-7 sm:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                  {service.icon}
                </span>
                <h3 className="mt-10 text-2xl font-medium tracking-[-0.03em]">{service.name}</h3>
                <p className="mt-3 text-mute">{service.description}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="chip">
                      {feature}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Products */}
      <section className="section border-t border-edge/10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Platform"
            title="Our Products"
            lede="Innovative SaaS solutions designed specifically to address challenges in healthcare and pharmacy."
          />
          <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <Reveal as="li" key={product.name} delay={(index % 3) * 80} className="card card-hover flex flex-col p-7">
                <div className="flex items-center justify-between gap-4">
                  <span className="mono-num text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
                  {product.status && <span className="chip border-signal/40 text-signal">{product.status}</span>}
                </div>
                <h3 className="mt-8 text-xl font-medium tracking-[-0.02em]">{product.name}</h3>
                <p className="mt-2 text-sm text-mute">{product.description}</p>
                <ul className="mt-6 hairline-list">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="py-2.5 text-sm leading-6 text-ink/80">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Values */}
      <section className="section border-t border-edge/10">
        <div className="container-x">
          <SectionHeading eyebrow="Principles" title="Our Values" lede="The principles that guide everything we do at Tiameds Technology" />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-edge/10 bg-edge/10 md:grid-cols-3">
            {values.map((value, index) => (
              <Reveal as="li" key={value.name} type="fade" delay={index * 90} className="spotlight relative bg-canvas p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="mono-num text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-signal">{value.icon}</span>
                </div>
                <h3 className="mt-14 text-3xl font-medium tracking-[-0.03em]">{value.name}</h3>
                <p className="mt-3 text-mute">{value.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        title="Ready to transform your healthcare technology?"
        lede="Whether you need a custom solution or want to learn more about our products, our team is ready to help."
        actions={<ButtonLink href="/contact-for-services">Contact Us</ButtonLink>}
      />
    </>
  )
}

export default AboutPage
