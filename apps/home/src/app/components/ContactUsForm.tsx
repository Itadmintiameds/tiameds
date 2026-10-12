'use client';

import { useState } from 'react';
import { ArrowRight } from './ui/icons';

interface FormData {
  name: string;
  email: string;
  message: string;
}

/** Home contact form — same /api/email request and messages as before, new presentation. */
export default function ContactUsForm() {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setResponseMessage('Your message has been sent successfully.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMessage('Failed to send the message. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An error occurred while sending the message.');
    } finally {
      setLoading(false);
    }
  };

  const ok = responseMessage.includes('success');

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="field"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="field"
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          className="field min-h-[160px] resize-y"
          rows={5}
          placeholder="Type your message here"
        />
      </div>

      <div className="space-y-4 pt-2">
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          <span>{loading ? 'Sending...' : 'Send Message'}</span>
          {!loading && <ArrowRight size={16} className="btn-icon" />}
        </button>
        <p role="status" aria-live="polite" className={`min-h-[1.25rem] text-center text-sm ${ok ? 'text-signal' : 'text-danger'}`}>
          {responseMessage}
        </p>
      </div>
    </form>
  );
}
