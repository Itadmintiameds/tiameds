'use client';

import React from 'react';
import { FaBuilding, FaCheck, FaClipboardList, FaFlask, FaShieldAlt, FaUserCircle } from 'react-icons/fa';

export const STEPS = [
  {
    number: 1,
    title: 'Super Admin Registration',
    icon: FaUserCircle,
    bannerTitle: 'Create your Super Admin account',
    bannerText: "You'll manage your organization and laboratories on TiaMeds LMS.",
    tip: 'Choose a strong password and keep your login credentials private.',
    listTitle: 'Before you start',
    list: [
      'You will be the Organization Super Admin once your registration is approved.',
      'TiaMeds Admin verifies every new registration.',
      'Keep your organization and laboratory details ready.',
    ],
  },
  {
    number: 2,
    title: 'Organization Information',
    icon: FaBuilding,
    bannerTitle: 'Tell us about your organization',
    bannerText: "Add your organization's contact, address and tax details.",
    tip: 'Keep your GSTIN handy. It is required to register your organization.',
    listTitle: 'Have these ready',
    list: [
      'Organization name, type, email and contact number.',
      'Registered address with PIN code.',
      'GSTIN (mandatory) and PAN (optional).',
    ],
  },
  {
    number: 3,
    title: 'First Laboratory Information',
    icon: FaFlask,
    bannerTitle: 'Set up your first laboratory',
    bannerText: "Add the laboratory's details, services, address and contact.",
    tip: 'Select every service your laboratory offers. You can reuse the organization address.',
    listTitle: 'Have these ready',
    list: [
      'Laboratory name and type.',
      'The services your laboratory offers.',
      'Laboratory address, or reuse the organization address.',
      'Laboratory contact number and email.',
    ],
  },
  {
    number: 4,
    title: 'Laboratory Compliance Details',
    icon: FaShieldAlt,
    bannerTitle: 'Add your compliance details',
    bannerText: 'Upload registration and accreditation documents for verification.',
    tip: 'Keep each file under 1 MB so your documents upload smoothly.',
    listTitle: 'Documents to upload',
    list: [
      'Establishment Registration Certificate (maximum 1 MB).',
      'GSTIN Certificate.',
      'Biomedical Waste Authorization Certificate, if applicable.',
      'NABL Accreditation Certificate, if applicable.',
    ],
  },
  {
    number: 5,
    title: 'Review & Submit',
    icon: FaClipboardList,
    bannerTitle: 'Review and submit',
    bannerText: 'Check everything is correct, then send it to TiaMeds Admin.',
    tip: 'Take a moment to double-check names, numbers and certificates before submitting.',
    listTitle: 'Before you submit',
    list: [
      'Review each section and use Edit to correct anything.',
      'Confirm your authorization and accept the Terms & Conditions.',
      'TiaMeds Admin verifies your registration before access is given.',
    ],
  },
];

interface StepperProps {
  /** Step being edited (0 when none, e.g. after submission). */
  current: number;
  /** Highest step the user has reached; any step up to it can be revisited. */
  furthest: number;
  /** Steps that passed validation. */
  completed: number[];
  onNavigate?: (step: number) => void;
}

const lineClass = (on: boolean) => `h-0.5 flex-1 transition-colors ${on ? 'bg-success-700' : 'bg-gray-200'}`;

export const Stepper = ({ current, furthest, completed, onNavigate }: StepperProps) => (
  <nav aria-label="Registration progress" className="rounded-2xl bg-white px-2 py-4 shadow-sm sm:px-4">
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const active = step.number === current;
        const done = !active && completed.includes(step.number);
        const reachable = !!onNavigate && !active && step.number <= furthest;

        return (
          <li key={step.number} className="flex-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onNavigate?.(step.number)}
              aria-current={active ? 'step' : undefined}
              className="group flex w-full flex-col items-center gap-2 disabled:cursor-default"
            >
              <span className="flex w-full items-center">
                {index > 0 ? <span aria-hidden className={lineClass(completed.includes(step.number - 1))} /> : <span className="flex-1" />}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors ${
                    done
                      ? 'border-success-700 bg-success-50 text-success-800'
                      : active
                        ? 'border-secondary-700 bg-secondary-700 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {done ? <FaCheck className="text-[10px]" /> : step.number}
                </span>
                {index < STEPS.length - 1 ? <span aria-hidden className={lineClass(done || completed.includes(step.number))} /> : <span className="flex-1" />}
              </span>
              <span
                className={`hidden px-1 text-center font-heading text-[11px] font-semibold leading-tight sm:block ${
                  active || done ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
