import Link from 'next/link'
import type { ReactNode } from 'react'
import { ButtonLink } from '../components/ui/Button'
import CtaBand from '../components/ui/CtaBand'
import { ArrowRight, Chart, Cloud, Code, Cpu, Network, Shield } from '../components/ui/icons'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SplitText from '../components/ui/SplitText'

const serviceCategories: { title: string; description: string; icon: ReactNode; services: string[] }[] = [
  {
    title: 'Custom Development',
    description: 'Tailored software solutions designed to your exact business requirements',
    icon: <Code size={20} />,
    services: [
      'Enterprise Application Development',
      'Legacy System Modernization',
      'API Development & Integration',
      'Microservices Architecture',
      'Custom CRM/ERP Solutions',
    ],
  },
  {
    title: 'Cloud Services',
    description: 'End-to-end cloud solutions for scalability and reliability',
    icon: <Cloud size={20} />,
    services: ['Cloud Migration Strategy', 'Multi-Cloud Architecture', 'Serverless Implementations', 'Cloud Security & Compliance', 'Cost Optimization'],
  },
  {
    title: 'Security Solutions',
    description: 'Comprehensive protection for your digital infrastructure',
    icon: <Shield size={20} />,
    services: ['Security Audits & Assessments', 'Data Encryption Solutions', 'IAM & Access Control', 'Threat Detection Systems', 'Compliance Management'],
  },
  {
    title: 'AI & Automation',
    description: 'Intelligent systems to transform your operations',
    icon: <Cpu size={20} />,
    services: ['Machine Learning Solutions', 'Process Automation', 'Predictive Analytics', 'Natural Language Processing', 'Computer Vision Systems'],
  },
  {
    title: 'Data Engineering',
    description: 'Turn your data into a strategic asset',
    icon: <Chart size={20} />,
    services: ['Data Warehouse Solutions', 'ETL Pipeline Development', 'Real-time Analytics', 'Business Intelligence', 'Data Governance'],
  },
  {
    title: 'Infrastructure',
    description: 'Robust foundations for your technology stack',
    icon: <Network size={20} />,
    services: ['DevOps Implementation', 'Containerization Strategy', 'IaC & Configuration Management', 'High Availability Systems', 'Disaster Recovery'],
  },
]

const ServicesPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={'Enterprise Technology\n*Services & Solutions*'}
        lede="We deliver comprehensive technology services designed to solve complex business challenges and drive digital transformation at scale."
      />

      <section className="section border-t border-edge/10 pt-16 sm:pt-20">
        <div className="container-x">
          <ol className="hairline-list">
            {serviceCategories.map((category, index) => (
              <Reveal
                as="li"
                key={category.title}
                className="group grid gap-8 py-12 sm:py-14 lg:grid-cols-12 lg:gap-10"
              >
                <div className="flex items-start justify-between gap-6 lg:col-span-5 lg:block">
                  <div>
                    <span className="mono-num text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
                    <SplitText as="h2" text={category.title} className="h-sub mt-5" />
                    <p className="mt-4 max-w-md text-mute">{category.description}</p>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-edge/15 text-signal transition-colors duration-500 group-hover:border-signal/50 lg:mt-10">
                    {category.icon}
                  </span>
                </div>

                <ul className="grid content-start gap-x-8 sm:grid-cols-2 lg:col-span-5 lg:pt-10">
                  {category.services.map((service) => (
                    <li key={service} className="flex items-baseline gap-3 border-b border-edge/10 py-3 text-ink/85">
                      <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-signal" aria-hidden="true" />
                      {service}
                    </li>
                  ))}
                </ul>

                <div className="lg:col-span-2 lg:flex lg:justify-end lg:pt-10">
                  <Link
                    href="/contact-for-services"
                    className="group/link inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-signal"
                  >
                    <span className="link-sweep">Discuss this service</span>
                    <ArrowRight size={15} className="transition-transform duration-500 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        title="Ready to transform your technology infrastructure?"
        lede="Our team of experts is ready to discuss your project requirements and propose tailored solutions."
        actions={<ButtonLink href="/contact-for-services">Get in Touch</ButtonLink>}
      />
    </>
  )
}

export default ServicesPage
