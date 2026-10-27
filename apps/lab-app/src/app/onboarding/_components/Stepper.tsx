'use client';

import React from 'react';
import { FaBuilding, FaCheck, FaClipboardCheck, FaFlask, FaShieldAlt, FaUserShield } from 'react-icons/fa';

export const STEPS = [
  { number: 1, title: 'Super Admin', icon: FaUserShield },
  { number: 2, title: 'Organization', icon: FaBuilding },
  { number: 3, title: 'Laboratory', icon: FaFlask },
  { number: 4, title: 'Compliance', icon: FaShieldAlt },
  { number: 5, title: 'Review & Submit', icon: FaClipboardCheck },
];

interface StepperProps {
  current: number;
  /** Highest step the user has reached; any step up to it can be revisited. */
  furthest: number;
  /** Steps that passed validation. */
  completed: number[];
  onNavigate: (step: number) => void;
}

export const Stepper = ({ current, furthest, completed, onNavigate }: StepperProps) => (
  <nav aria-label="Registration progress">
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const active = step.number === current;
        const done = !active && completed.includes(step.number);
        const reachable = !active && step.number <= furthest;
        const Icon = step.icon;

        return (
          <li key={step.number} className="flex flex-1 items-start last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onNavigate(step.number)}
              aria-current={active ? 'step' : undefined}
              className="group flex w-16 flex-col items-center gap-1.5 text-center disabled:cursor-default sm:w-24"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm transition-colors ${
                  done
                    ? 'border-primary-700 bg-primary-700 text-white group-hover:bg-primary-800'
                    : active
                      ? 'border-primary-700 bg-white text-primary-700 ring-4 ring-primary-200'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {done ? <FaCheck /> : <Icon />}
              </span>
              <span
                className={`text-[11px] font-medium leading-tight sm:text-xs ${
                  active ? 'text-primary-900' : done ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`mt-5 h-0.5 flex-1 transition-colors ${
                  completed.includes(step.number) ? 'bg-primary-700' : 'bg-gray-200'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
