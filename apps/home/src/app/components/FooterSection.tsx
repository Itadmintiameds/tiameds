import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, LinkedIn, Mail, MapPin, Phone } from './ui/icons';
import LiveClock from './ui/LiveClock';

const company = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Careers', href: '/careers' },
];

// The product list from the "TiaMeds Website Changes" doc (top level + sub-products), linking to /product sections
const solutions = [
  {
    name: 'TiaMeds One – HIMS',
    href: '/product#tiameds-one-hims',
    children: [
      { name: 'TiaMeds Patient Flow', href: '/product#tiameds-patient-flow' },
      { name: 'TiaMeds Lab', href: '/product#tiameds-lab' },
      { name: 'TiaMeds Insurance', href: '/product#tiameds-insurance' },
      { name: 'TiaMeds EMR and integrated hospital workflows', href: '/product#tiameds-one-hims' },
    ],
  },
  {
    name: 'TiaMeds Marketplace',
    href: '/product#tiameds-marketplace',
    children: [
      { name: 'TiaMeds Pharma Inventory', href: '/product#tiameds-pharma-inventory' },
      { name: 'TiaMeds Pharma Marketplace', href: '/product#tiameds-marketplace' },
    ],
  },
  { name: 'Blood Buddy', href: '/product#blood-buddy', children: [] },
  { name: 'TiaMeds Sporty – Sports & Fitness App', href: '/product#tiameds-sporty-sports-fitness-app', children: [] },
  { name: 'Digital Marketing & Growth Solutions', href: '/product#digital-marketing-growth-solutions', children: [] },
];

const labelCls = 'mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-faint';
const linkCls = 'link-sweep text-mute transition-colors hover:text-ink';

const FooterSection = () => {
  return (
    <footer className="relative isolate overflow-hidden border-t border-edge/10 bg-canvas">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[60%] bg-[radial-gradient(50%_80%_at_50%_100%,rgb(var(--halo)/0.10),transparent_70%)]" />

      <div className="container-x pb-8 pt-20 sm:pt-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label="TiaMeds — home" className="inline-block">
              <Image
                src="/LOGO.svg"
                alt="TiaMeds — Innovating Today, Shaping Tomorrow!"
                width={225}
                height={80}
                unoptimized
                className="h-16 w-auto [filter:brightness(0)_invert(1)]"
              />
            </Link>
            <p className="mt-6 max-w-xs text-mute">Enterprise-grade technology solutions for digital transformation.</p>
            <a
              href="https://www.linkedin.com/company/tiameds-technologies/"
              aria-label="TiaMeds on LinkedIn"
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-edge/15 text-mute transition-colors hover:border-edge/40 hover:text-ink"
            >
              <LinkedIn size={16} />
            </a>
          </div>

          {/* Company */}
          <nav aria-label="Company" className="lg:col-span-2">
            <h3 className={labelCls}>Company</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className={linkCls}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Solutions */}
          <nav aria-label="Solutions" className="lg:col-span-3">
            <h3 className={labelCls}>Solutions</h3>
            <ul className="space-y-4">
              {solutions.map((group) => (
                <li key={group.name}>
                  <Link href={group.href} className={linkCls}>
                    {group.name}
                  </Link>
                  {group.children.length > 0 && (
                    <ul className="mt-3 space-y-2 border-l border-edge/10 pl-4">
                      {group.children.map((child) => (
                        <li key={child.name}>
                          <Link href={child.href} className="link-sweep text-sm text-faint transition-colors hover:text-ink">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className={labelCls}>Contact</h3>
            <address className="space-y-5 not-italic text-mute">
              <p className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-signal" />
                <span>
                  No. 59, 2nd Floor of Dakshina Murthy Towers <br />
                  Devanooru, Rajeevnagara 2nd Stage, Udayagiri, <br />
                  Mysore, Karnataka – 570019.
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-signal" />
                <a href="tel:7678325053" className={linkCls}>
                  +91 7678325053
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-signal" />
                <a href="mailto:info@technova.com" className={linkCls}>
                  support@tiameds.ai
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Oversized wordmark */}
        <p
          aria-hidden="true"
          className="pointer-events-none mt-20 select-none bg-gradient-to-b from-ink/[0.14] to-ink/0 bg-clip-text text-center text-[clamp(4.5rem,21vw,19rem)] font-semibold leading-[0.8] tracking-[-0.07em] text-transparent"
        >
          TiaMeds
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-edge/10 pt-6 text-sm text-faint md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} TiaMeds Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse-dot" aria-hidden="true" />
            Mysuru, India · <LiveClock className="text-mute" />
          </p>
          <a href="#main" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
            Back to top <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
