import type { ReactNode } from 'react'
import { ButtonLink } from '../components/ui/Button'
import CtaBand from '../components/ui/CtaBand'
import { Bag, Cloud, Code, Cpu, Lock, Package, Server, Clipboard } from '../components/ui/icons'
import Marquee from '../components/ui/Marquee'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'

const techCategories: { name: string; icon: ReactNode; items: string[]; description: string }[] = [
  {
    name: 'Cloud & Infrastructure',
    icon: <Cloud size={20} />,
    items: ['AWS', 'Google Cloud', 'Azure', 'Kubernetes', 'Docker', 'Terraform'],
    description: 'Scalable, resilient cloud architectures for enterprise workloads.',
  },
  {
    name: 'AI & Machine Learning',
    icon: <Cpu size={20} />,
    items: ['TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'Computer Vision', 'NLP'],
    description: 'Intelligent systems that learn and adapt to your needs.',
  },
  {
    name: 'Security & Compliance',
    icon: <Lock size={20} />,
    items: ['Zero Trust', 'OAuth 2.0', 'GDPR Tools', 'HIPAA Compliance', 'Pen Testing', 'E2E Encryption'],
    description: 'Military-grade security built into every layer.',
  },
  {
    name: 'Frontend & UX',
    icon: <Code size={20} />,
    items: ['React', 'Next.js', 'Flutter', 'TailwindCSS', 'Framer Motion', 'WebAssembly'],
    description: 'Pixel-perfect interfaces with buttery smooth performance.',
  },
  {
    name: 'Backend & Databases',
    icon: <Server size={20} />,
    items: ['Node.js', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL'],
    description: 'High-throughput systems that never sleep.',
  },
]

const projects: { name: string; icon: ReactNode; items: string[]; description: string }[] = [
  {
    name: 'TiaMeds Lab',
    icon: <Clipboard size={20} />,
    items: ['Next.js', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
    description: 'AI-Enabled Laboratory Management & Diagnostic Reporting',
  },
  {
    name: 'TiaMeds Pharma Inventory',
    icon: <Package size={20} />,
    items: ['Next.js', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
    description: 'AI-Enabled Pharmacy Inventory Management',
  },
  {
    name: 'TiaMeds Marketplace',
    icon: <Bag size={20} />,
    items: ['Next.js', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
    description: 'AI-Powered B2B Pharmaceutical Marketplace',
  },
]

const allTech = Array.from(new Set(techCategories.flatMap((c) => c.items)))

const TechStackPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Technology Stack"
        title={'Our *Technology*\nArsenal'}
        lede="We leverage cutting-edge tools to build secure, scalable, and future-proof solutions."
        actions={<ButtonLink href="/contact">Get Custom Solution</ButtonLink>}
      />

      <section aria-label="Technologies" className="border-y border-edge/10 py-8">
        <Marquee
          duration={60}
          items={allTech.map((t) => (
            <span key={t} className="text-[clamp(1.4rem,3vw,2.25rem)] font-medium tracking-[-0.04em] text-ink/75">
              {t}
            </span>
          ))}
          separator={<span className="text-lg text-signal">✦</span>}
        />
      </section>

      <section className="section">
        <div className="container-x">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {techCategories.map((category, index) => (
              <Reveal
                as="li"
                key={category.name}
                delay={(index % 3) * 80}
                className={`card card-hover spotlight flex flex-col p-7 sm:p-8 ${index === 0 ? 'lg:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono-num text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                    {category.icon}
                  </span>
                </div>
                <h2 className="mt-10 text-2xl font-medium tracking-[-0.03em]">{category.name}</h2>
                <p className="mt-3 text-mute">{category.description}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-t border-edge/10">
        <div className="container-x">
          <SectionHeading
            eyebrow="In production"
            title="Powering Real-World Solutions"
            lede={<>See how we&apos;ve leveraged these technologies for our clients.</>}
          />
          <ul className="mt-14 grid gap-4 md:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal as="li" key={project.name} delay={index * 90} className="card card-hover flex flex-col p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                  {project.icon}
                </span>
                <h3 className="mt-10 text-xl font-medium tracking-[-0.02em]">{project.name}</h3>
                <p className="mt-2 text-sm text-mute">{project.description}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {project.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Ready to Build Something Amazing?"
        lede="Our engineers will help you select the perfect tech stack for your project."
        actions={<ButtonLink href="/contact-for-services">Get Started</ButtonLink>}
      />
    </>
  )
}

export default TechStackPage
