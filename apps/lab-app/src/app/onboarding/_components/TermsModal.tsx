'use client';

import React, { useEffect } from 'react';
import { FaRegFileAlt, FaRegTimesCircle } from 'react-icons/fa';
import { TERMS_EFFECTIVE_DATE, TERMS_INTRO, TERMS_SECTIONS } from '../_lib/constants';
import { IconChip } from './Layout';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal = ({ onClose }: TermsModalProps) => {
  // Lock background scrolling while the modal is open.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-3">
            <IconChip className="h-9 w-9 rounded-lg text-sm">
              <FaRegFileAlt />
            </IconChip>
            <div>
              <h2 id="terms-title" className="font-heading text-sm font-semibold text-gray-900">
                Terms &amp; Conditions
              </h2>
              <p className="text-[11px] text-gray-500">Effective Date: {TERMS_EFFECTIVE_DATE}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-lg text-gray-500 hover:text-gray-800">
            <FaRegTimesCircle />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-8 py-6">
          <p className="text-sm text-gray-700">{TERMS_INTRO}</p>
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 font-heading text-sm font-semibold text-gray-900">{section.title}</h3>
              <ul className="space-y-2">
                {section.clauses.map((clause) => (
                  <li key={clause.id} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                    <span className="w-9 shrink-0">{clause.id}</span>
                    <span>{clause.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary-800 px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
