import ContactUsForm from './ContactUsForm';
import { Mail } from './ui/icons';
import LiveClock from './ui/LiveClock';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';

const ContactUsSection = () => {
  return (
    <section id="contact" className="section relative isolate overflow-hidden border-t border-edge/10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_95%_100%,rgb(var(--halo)/0.12),transparent_70%)]" />
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Contact Us"
            title={'Get In Touch\n*With Our Team*'}
            lede="Have a question? We're here to assist you. Get in touch with our team for any inquiries, suggestions, or support."
          />

          <Reveal delay={220} className="mt-12 space-y-6 border-t border-edge/10 pt-10">
            <h3 className="text-xl font-medium tracking-[-0.02em]">We&apos;re here to help!</h3>
            <p className="max-w-md text-mute">
              Whether you&apos;re looking for more information about our products, need support, or just want to chat, our team is
              ready to assist.
            </p>
            <a href="mailto:support@tiameds.ai" className="group inline-flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-edge/15 text-signal transition-colors group-hover:border-signal/60">
                <Mail size={18} />
              </span>
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Email us at</span>
                <span className="link-sweep text-lg">support@tiameds.ai</span>
              </span>
            </a>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse-dot" aria-hidden="true" />
              Our team in Mysuru · <LiveClock className="text-mute" />
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-7">
          <ContactUsForm />
        </Reveal>
      </div>
    </section>
  );
};

export default ContactUsSection;
