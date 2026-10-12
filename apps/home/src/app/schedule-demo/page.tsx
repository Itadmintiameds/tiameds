import NotifyForm from '../components/NotifyForm'
import { ArrowRight, Clock, Mail, Phone } from '../components/ui/icons'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

const DemoPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Beta Preview"
        title={'Demo Scheduling\n*Coming Soon*'}
        lede={<>We&apos;re putting the finishing touches on our demo scheduling system to give you the best experience possible.</>}
      />

      <section className="section border-t border-edge/10 pt-16 sm:pt-20">
        <div className="container-x grid gap-4 lg:grid-cols-12">
          {/* Progress */}
          <Reveal className="card p-8 sm:p-10 lg:col-span-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                  <Clock size={20} />
                </span>
                <h2 className="text-xl font-medium tracking-[-0.02em]">Estimated Launch</h2>
              </div>
              <p className="mono-num text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-ink">
                75<span className="text-faint">%</span>
              </p>
            </div>
            <div
              className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-edge/10"
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Demo scheduling development progress"
            >
              <Reveal type="line" delay={300} className="h-full w-3/4 rounded-full bg-signal">
                <span className="sr-only">75%</span>
              </Reveal>
            </div>
            <p className="mt-4 text-sm text-mute">Development in progress - 75% complete</p>
          </Reveal>

          {/* Alternative contact options */}
          <Reveal delay={80} className="card card-hover spotlight p-8 lg:col-span-6">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                <Mail size={20} />
              </span>
              <h3 className="text-xl font-medium tracking-[-0.02em]">Email Us</h3>
            </div>
            <p className="mt-5 text-mute">Send us a message to schedule a manual demo appointment</p>
            <a href="mailto:demos@yourcompany.com" className="mt-6 inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-signal">
              <span className="link-sweep">Contact via email</span> <ArrowRight size={15} />
            </a>
          </Reveal>

          <Reveal delay={160} className="card card-hover spotlight p-8 lg:col-span-6">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                <Phone size={20} />
              </span>
              <h3 className="text-xl font-medium tracking-[-0.02em]">Call Us</h3>
            </div>
            <p className="mt-5 text-mute">Speak directly with our team to arrange a demo</p>
            <a href="tel:+11234567890" className="mono-num mt-6 inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-signal">
              <span className="link-sweep">+91 7678325053</span>
              <ArrowRight size={15} />
            </a>
          </Reveal>

          {/* Notify me */}
          <Reveal delay={120} className="mt-8 lg:col-span-12">
            <NotifyForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default DemoPage
