import ContactDetails from '@/app/components/ContactDetails'
import SupportContactForm from '@/app/components/SupportContactForm'
import PageHero from '@/app/components/ui/PageHero'
import Reveal from '@/app/components/ui/Reveal'

const ContactPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title={'Contact Our\n*Support Team*'}
        lede={<>Have questions about our solutions? Reach out to our team and we&apos;ll get back to you within 24 hours.</>}
      />

      <section className="section border-t border-edge/10 pt-16 sm:pt-20">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <ContactDetails
              email={{ label: 'support@tiameds.ai', href: 'mailto:support@tiameds.ai' }}
              phone={{ label: '+91 7678325053', href: 'tel:91 7678325053' }}
              address={
                <>
                  No. 59, 2nd Floor of Dakshina Murthy Towers <br />
                  Devanooru, Rajeevnagara 2nd Stage, Udayagiri, <br />
                  Mysore, Karnataka – 570019.
                </>
              }
            />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <SupportContactForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default ContactPage
