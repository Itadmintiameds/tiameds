import ContactDetails from '../components/ContactDetails'
import SupportContactForm from '../components/SupportContactForm'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

const ContactUsPage = () => {
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
              phone={{ label: '+123-456-7890', href: 'tel:+1234567890' }}
              address={
                <>
                  #4754, Shivaji Road, NR Mohalla
                  <br />
                  Mysore-570007, Karnataka
                  <br />
                  India
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

export default ContactUsPage
