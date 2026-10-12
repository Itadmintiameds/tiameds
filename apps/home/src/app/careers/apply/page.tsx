import { ButtonLink } from '../../components/ui/Button'
import { Briefcase, Mail, Phone } from '../../components/ui/icons'
import PageHero from '../../components/ui/PageHero'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'

const roles = ['Frontend Developers', 'Backend Engineers', 'DevOps Specialists', 'Product Managers', 'UI/UX Designers', 'QA Engineers']

const ApplyPage = () => {
  return (
    <>
      <PageHero eyebrow="Join Our Team" title={'Current Job\n*Opportunities*'} />

      <section className="border-t border-edge/10 py-16 sm:py-20">
        <div className="container-x">
          <Reveal className="card relative overflow-hidden p-8 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-edge/15 text-signal">
                  <Briefcase size={24} />
                </span>
                <h2 className="h-sub mt-8">No Open Positions Currently</h2>
                <p className="mt-4 max-w-xl text-mute">
                  We don&apos;t have any open positions at the moment, but we&apos;re always looking for talented individuals to
                  join our team.
                </p>
              </div>
              <div className="lg:col-span-5">
                <p className="eyebrow">Stay connected for future opportunities</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href="/contact">Contact Us</ButtonLink>
                  <a href="mailto:careers@tiameds.ai" className="btn btn-ghost">
                    <Mail size={16} />
                    <span>Email Us</span>
                  </a>
                  <a href="tel:+1234567890" className="btn btn-ghost">
                    <Phone size={16} />
                    <span>Call Us</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section pt-8 sm:pt-10">
        <div className="container-x">
          <SectionHeading title="Roles We Typically Hire For" titleClassName="h-sub" />
          <ul className="mt-12 hairline-list">
            {roles.map((role, i) => (
              <Reveal as="li" key={role} delay={i * 60} className="group flex items-center justify-between gap-6 py-6">
                <div className="flex items-baseline gap-6">
                  <span className="mono-num text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] transition-colors duration-300 group-hover:text-signal">
                    {role}
                  </span>
                </div>
                <span className="chip">Future openings</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default ApplyPage
