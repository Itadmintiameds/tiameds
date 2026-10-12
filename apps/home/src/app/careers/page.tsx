import { ButtonLink } from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'

const benefits = [
  'Make an impact in the healthcare industry',
  'Work with cutting-edge technology',
  'Collaborate with a passionate team',
  'Flexible work arrangements',
  'Competitive compensation & benefits',
  'Continuous learning opportunities',
]

const CareerSection = () => {
  return (
    <>
      <PageHero
        eyebrow="Join Our Growing Team"
        title={'Transform Healthcare\n*With Your Talent*'}
        lede={
          <>
            At Tiameds Technology, we&apos;re building the future of healthcare solutions. Join our mission-driven team of innovators
            creating enterprise-grade platforms.
          </>
        }
        actions={
          <>
            <ButtonLink href="/careers/apply">View Open Positions</ButtonLink>
            <ButtonLink href="/about" variant="ghost">
              Learn About Our Culture
            </ButtonLink>
          </>
        }
      />

      <section className="section border-t border-edge/10">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Life at TiaMeds" title="Why Join Tiameds?" titleClassName="h-sub" />
          </div>
          <ol className="grid gap-px overflow-hidden rounded-[22px] border border-edge/10 bg-edge/10 sm:grid-cols-2 lg:col-span-8">
            {benefits.map((benefit, i) => (
              <Reveal as="li" key={benefit} type="fade" delay={i * 70} className="spotlight relative bg-canvas p-7 sm:p-9">
                <span className="mono-num text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-8 text-xl font-medium leading-snug tracking-[-0.02em]">{benefit}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export default CareerSection
