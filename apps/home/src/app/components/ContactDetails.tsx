import type { ReactNode } from 'react';
import { Mail, MapPin, Phone } from './ui/icons';
import LiveClock from './ui/LiveClock';

export interface ContactDetailsProps {
  email: { label: string; href: string };
  phone: { label: string; href: string };
  address: ReactNode;
  title?: string;
}

/** "Our Contact Details" block shared by the contact pages (each page passes its own details). */
export default function ContactDetails({ email, phone, address, title = 'Our Contact Details' }: ContactDetailsProps) {
  const row = 'flex items-start gap-5 border-t border-edge/10 py-6';
  const iconCls = 'mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-edge/15 text-signal';
  const label = 'mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-faint';
  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium tracking-[-0.03em]">{title}</h2>
      <div className="border-b border-edge/10">
        <div className={row}>
          <span className={iconCls}>
            <Mail size={18} />
          </span>
          <div>
            <h3 className={label}>Email Us</h3>
            <a href={email.href} className="link-sweep text-lg text-ink">
              {email.label}
            </a>
          </div>
        </div>
        <div className={row}>
          <span className={iconCls}>
            <Phone size={18} />
          </span>
          <div>
            <h3 className={label}>Call Us</h3>
            <a href={phone.href} className="link-sweep text-lg text-ink">
              {phone.label}
            </a>
          </div>
        </div>
        <div className={row}>
          <span className={iconCls}>
            <MapPin size={18} />
          </span>
          <div>
            <h3 className={label}>Visit Us</h3>
            <p className="leading-relaxed text-mute">{address}</p>
          </div>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse-dot" aria-hidden="true" />
        Mysuru, India · <LiveClock className="text-mute" />
      </p>
    </div>
  );
}
