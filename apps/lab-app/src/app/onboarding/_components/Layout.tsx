'use client';

import React from 'react';
import { FaCheckCircle, FaQuestionCircle, FaRegCopy, FaRegLightbulb } from 'react-icons/fa';

/** Rounded chip that holds a section / banner icon. */
export const IconChip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 ${className}`}
  >
    {children}
  </span>
);

interface BannerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  pill: string;
}

export const PageBanner = ({ icon, title, description, pill }: BannerProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-secondary-700 px-5 py-4 text-white shadow-sm sm:px-6">
    <span aria-hidden className="absolute -right-10 -top-24 h-52 w-52 rounded-full bg-white/10 sm:right-24" />
    <span aria-hidden className="absolute -bottom-16 right-4 h-28 w-28 rounded-full bg-white/10 sm:right-52" />
    <div className="relative flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl text-secondary-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-lg font-semibold leading-tight sm:text-xl">{title}</h1>
        <p className="mt-0.5 text-xs text-white/85">{description}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-secondary-700 sm:inline-flex">
        <FaRegCopy className="text-[11px]" />
        {pill}
      </span>
    </div>
  </div>
);

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Rendered on the right of the card header (e.g. an Edit link). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** White form card with an icon + title header and a divider. */
export const Card = ({ icon, title, description, action, children }: CardProps) => (
  <section className="rounded-2xl bg-white px-5 pb-6 pt-5 shadow-sm ring-1 ring-secondary-100">
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
      <div className="flex items-center gap-3">
        <IconChip className="h-9 w-9 rounded-lg text-sm">{icon}</IconChip>
        <div>
          <h2 className="font-heading text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-[11px] text-gray-500">{description}</p>}
        </div>
      </div>
      {action}
    </header>
    <div className="pt-5">{children}</div>
  </section>
);

interface SidePanelProps {
  tip: string;
  listTitle: string;
  items: string[];
}

/** Right-hand column: tip, checklist and support note. */
export const SidePanel = ({ tip, listTitle, items }: SidePanelProps) => (
  <aside className="space-y-4">
    <div className="rounded-2xl bg-secondary-700 p-4 text-white shadow-sm">
      <p className="flex items-center gap-2 font-heading text-xs font-semibold">
        <FaRegLightbulb /> Tip
      </p>
      <p className="mt-2 text-xs leading-relaxed text-white/90">{tip}</p>
    </div>

    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-secondary-100">
      <p className="flex items-center gap-2 font-heading text-xs font-semibold text-gray-900">
        <IconChip className="h-6 w-6 rounded-md text-[10px]">
          <FaRegCopy />
        </IconChip>
        {listTitle}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[11px] leading-snug text-gray-700">
            <IconChip className="mt-px h-4 w-4 text-[8px]">
              <FaCheckCircle />
            </IconChip>
            {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="rounded-2xl bg-info-50 p-4 shadow-sm">
      <p className="flex items-center gap-2 font-heading text-xs font-semibold text-info-900">
        <FaQuestionCircle /> Need help?
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-info-900">
        Contact TiaMeds support if you have trouble completing your registration.
      </p>
    </div>
  </aside>
);
