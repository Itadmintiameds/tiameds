'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaScroll, FaTimes } from 'react-icons/fa';
import { TERMS_EFFECTIVE_DATE, TERMS_INTRO, TERMS_SECTIONS } from '../_lib/constants';

interface TermsModalProps {
  /** Terms were already read in full earlier in this session. */
  alreadyRead: boolean;
  onClose: () => void;
  /** Called once the user has scrolled to the end and accepted. */
  onAccept: () => void;
}

export const TermsModal = ({ alreadyRead, onClose, onAccept }: TermsModalProps) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(alreadyRead);

  const checkScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 24) setReachedEnd(true);
  }, []);

  // Short viewports may fit the whole text without any scrolling.
  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <FaScroll />
            </span>
            <div>
              <h2 id="terms-title" className="text-lg font-semibold text-primary-900">
                Terms &amp; Conditions
              </h2>
              <p className="text-xs text-gray-500">Effective Date: {TERMS_EFFECTIVE_DATE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        <div ref={bodyRef} onScroll={checkScroll} className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <p className="text-sm text-gray-700">{TERMS_INTRO}</p>
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-primary-900">{section.title}</h3>
              <ul className="space-y-2">
                {section.clauses.map((clause) => (
                  <li key={clause.id} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                    <span className="w-9 shrink-0 font-medium text-primary-700">{clause.id}</span>
                    <span>{clause.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <p className={`flex items-center gap-2 text-sm ${reachedEnd ? 'text-success-800' : 'text-gray-500'}`}>
            {reachedEnd ? (
              <>
                <FaCheckCircle /> You have read the Terms &amp; Conditions
              </>
            ) : (
              'Scroll to the end to enable acceptance'
            )}
          </p>
          <button
            type="button"
            disabled={!reachedEnd}
            onClick={onAccept}
            className="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            I have read &amp; understood
          </button>
        </div>
      </div>
    </div>
  );
};
