import Link from 'next/link'
import { ArrowLeft } from './components/ui/icons'
import { Rings } from './components/ui/Ornaments'
import Typewriter from './components/ui/Typewriter'

export default function NotFound() {
  return (
    <section className="grain relative isolate overflow-hidden">
      <div aria-hidden="true" className="glow-halo absolute inset-0 -z-10" />
      <Rings className="absolute left-1/2 top-1/2 -z-10 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <div className="container-x flex min-h-[86vh] flex-col items-center justify-center pb-20 pt-[calc(var(--header-h)+48px)] text-center">
        <p className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          Error 404
        </p>
        <h1 className="display mt-8">
          Page not <span className="em">found</span>
        </h1>
        <p className="mt-8 font-mono text-[0.95rem] text-mute sm:text-lg">
          <span className="text-faint" aria-hidden="true">
            {'> '}
          </span>
          <Typewriter
            phrases={["The page you're looking for doesn't exist or has moved."]}
            loop={false}
            typeSpeed={34}
            startDelay={300}
          />
        </p>
        {/* flat line: no signal */}
        <svg aria-hidden="true" viewBox="0 0 600 40" className="mt-12 h-8 w-[min(520px,80vw)]" fill="none">
          <path d="M0 20 H230 l8 -12 l8 24 l8 -12 H600" className="stroke-signal" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <Link href="/" className="btn btn-primary mt-12">
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </Link>
      </div>
    </section>
  )
}
