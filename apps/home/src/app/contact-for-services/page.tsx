import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Calendar, Headset, Mail, MapPin, Phone } from '../components/ui/icons'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'

interface ServiceContactPageProps {
  params: {
    serviceName: string
  }
}

const ServiceContactPage = ({ params }: ServiceContactPageProps) => {
  const serviceName = params?.serviceName || 'Your Selected Service'

  const contactMethods: { icon: ReactNode; title: string; description: string; action: string; link: string; underDevelopment: boolean }[] = [
    {
      icon: <Headset size={20} />,
      title: 'Live Chat',
      description: 'Chat with our solutions team in real-time',
      action: 'Start Chat',
      link: '#chat',
      underDevelopment: true,
    },
    {
      icon: <Calendar size={20} />,
      title: 'Schedule Meeting',
      description: 'Book a consultation at your convenience',
      action: 'Book Now',
      link: '#schedule',
      underDevelopment: true,
    },
    {
      icon: <Phone size={20} />,
      title: 'Call Us',
      description: '+91 7678325053',
      action: 'Call Now',
      link: 'tel:+15551234567',
      underDevelopment: false,
    },
    {
      icon: <Mail size={20} />,
      title: 'Email Us',
      description: 'solutions@tiamedstech.com',
      action: 'Send Email',
      link: 'mailto:solutions@tiamedstech.com',
      underDevelopment: true,
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={`Discuss\n*${serviceName}*`}
        lede={<>Let&apos;s explore how our {serviceName.toLowerCase()} can address your specific business requirements and technology challenges.</>}
      />

      <section className="section border-t border-edge/10 pt-16 sm:pt-20">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 className="mb-8 text-2xl font-medium tracking-[-0.03em]">Contact Options</h2>
            <ul className="hairline-list">
              {contactMethods.map((method, index) => (
                <Reveal as="li" key={method.title} delay={index * 70} className="flex items-start gap-5 py-6">
                  <span
                    className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                      method.underDevelopment ? 'border-edge/10 text-faint' : 'border-edge/20 text-signal'
                    }`}
                  >
                    {method.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-medium tracking-[-0.02em]">{method.title}</h3>
                      {method.underDevelopment && <span className="chip">Coming Soon</span>}
                    </div>
                    <p className="mt-1.5 text-mute">{method.description}</p>
                    <Link
                      href={method.link}
                      className={`mt-3 inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        method.underDevelopment ? 'pointer-events-none text-faint' : 'text-ink hover:text-signal'
                      }`}
                      aria-disabled={method.underDevelopment}
                      tabIndex={method.underDevelopment ? -1 : undefined}
                    >
                      {method.action}
                      {!method.underDevelopment && <ArrowRight size={15} />}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <Reveal delay={120} className="lg:col-span-6">
            <form className="card space-y-6 p-6 sm:p-10">
              <h3 className="text-2xl font-medium tracking-[-0.03em]">Send Us a Message</h3>

              <div>
                <label htmlFor="name" className="field-label">
                  Full Name
                </label>
                <input type="text" id="name" name="name" className="field" placeholder="Your name" />
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Email Address
                </label>
                <input type="email" id="email" name="email" className="field" placeholder="your.email@example.com" />
              </div>

              <div>
                <label htmlFor="company" className="field-label">
                  Company
                </label>
                <input type="text" id="company" name="company" className="field" placeholder="Your company" />
              </div>

              <div>
                <label htmlFor="service" className="field-label">
                  Service Interest
                </label>
                <select id="service" name="service" className="field" defaultValue={serviceName}>
                  <option>{serviceName}</option>
                  <option>Custom Development</option>
                  <option>Cloud Services</option>
                  <option>Security Solutions</option>
                  <option>AI & Automation</option>
                  <option>Data Engineering</option>
                  <option>Infrastructure</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="field-label">
                  Your Message
                </label>
                <textarea id="message" name="message" rows={4} className="field min-h-[130px] resize-y" placeholder="Tell us about your project needs..." />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Submit Inquiry
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Office Info */}
      <section className="section border-t border-edge/10">
        <div className="container-x">
          <SectionHeading eyebrow="Locations" title="Our Offices" lede="Visit us or reach out to our global teams" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                city: 'Mysore',
                address: '#4754, Shivaji Road, NR Mohalla\nMysore-570007, Karnataka\nIndia',
                phone: '+91 7678325053',
              },
            ].map((office, index) => (
              <Reveal key={office.city} delay={index * 90} className="card p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge/15 text-signal">
                  <MapPin size={20} />
                </span>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.03em]">{office.city}</h3>
                <p className="mt-3 whitespace-pre-line text-mute">{office.address}</p>
                <p className="mono-num mt-6 text-ink">{office.phone}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ServiceContactPage
