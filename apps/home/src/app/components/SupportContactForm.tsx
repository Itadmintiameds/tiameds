'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Check, Close } from './ui/icons';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

/**
 * Support form used by /contact and /contactus. Same behaviour as before: the submit is simulated
 * (1.5 s) and shows a success or failure message.
 */
export default function SupportContactForm() {
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitState('idle');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitState('success');
      setFormData(EMPTY);
      formRef.current?.reset();
    } catch {
      setSubmitState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-10">
      <h2 className="text-2xl font-medium tracking-[-0.03em]">Send Us a Message</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Full Name
          </label>
          <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required className="field" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email Address
          </label>
          <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className="field" placeholder="your.email@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="field-label">
            Phone Number
          </label>
          <input type="tel" id="phone" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} className="field" placeholder="+1 (123) 456-7890" />
        </div>
        <div>
          <label htmlFor="subject" className="field-label">
            Subject
          </label>
          <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="field">
            <option value="">Select a subject</option>
            <option value="Support">Support</option>
            <option value="Sales">Sales</option>
            <option value="Partnership">Partnership</option>
            <option value="Careers">Careers</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Your Message
        </label>
        <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className="field min-h-[150px] resize-y" placeholder="How can we help you?" />
      </div>

      <div className="space-y-4 pt-2">
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
              Sending...
            </span>
          ) : (
            <>
              <span>Send Message</span>
              <ArrowRight size={16} className="btn-icon" />
            </>
          )}
        </button>

        <div role="status" aria-live="polite">
          {submitState !== 'idle' && (
            <p
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                submitState === 'success' ? 'border-signal/30 text-signal' : 'border-danger/40 text-danger'
              }`}
            >
              {submitState === 'success' ? (
                <>
                  <Check size={16} />
                  Your message has been sent successfully!
                </>
              ) : (
                <>
                  <Close size={16} />
                  Failed to send message. Please try again.
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
