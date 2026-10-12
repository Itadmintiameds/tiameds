'use client';

import { useState } from 'react';
import { Calendar, Check } from './ui/icons';

/** "Get Notified When We Launch" box on /schedule-demo — same simulated submit as before. */
export default function NotifyForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fake API call simulation
    setTimeout(() => {
      setSubmitted(true);
      setEmail('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="card relative overflow-hidden p-8 sm:p-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_100%_0%,rgb(var(--signal)/0.10),transparent_70%)]" />
      <div className="max-w-xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-edge/15 text-signal">
          <Calendar size={20} />
        </span>
        <h2 className="h-sub mt-8">{submitted ? 'Thank You!' : 'Get Notified When We Launch'}</h2>
        <p className="mt-3 text-mute" aria-live="polite">
          {submitted
            ? "We'll notify you as soon as our demo scheduling is available."
            : 'Be the first to know when our demo scheduling is available'}
        </p>
      </div>

      {submitted ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal text-on-signal">
            <Check size={18} />
          </span>
          <p className="text-ink">You&apos;ve been added to our notification list!</p>
          <button onClick={() => setSubmitted(false)} className="link-sweep text-sm font-medium text-signal">
            Submit another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="notify-email" className="sr-only">
            Email address
          </label>
          <input
            id="notify-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="field flex-grow"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={isLoading} className="btn btn-signal shrink-0">
            {isLoading ? 'Sending...' : 'Notify Me'}
          </button>
        </form>
      )}
    </div>
  );
}
