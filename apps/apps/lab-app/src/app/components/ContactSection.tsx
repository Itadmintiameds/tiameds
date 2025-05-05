'use client';
import Link from 'next/link';
import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactUsSection = () => {
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

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background overflow-hidden">
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl text-center relative z-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          Get In Touch With Us
        </h2>
        <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
          Have a question? We&apos;re here to assist you. Get in touch with our team for any inquiries, suggestions, or support.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Text */}
        <div className="flex flex-col justify-center items-start space-y-6 p-6 md:p-10">
          <h3 className="text-2xl font-semibold text-textdark leading-tight ">
            We&apos;re here to help!
          </h3>
          <p className="text-lg text-textmuted max-w-md">
            Whether you’re looking for more information about our products, need support, or just want to chat, our team is ready to assist. Reach out, and we’ll get back to you as soon as possible.
          </p>
          <div className="text-lg text-textmuted flex gap-2">
            For quick assistance, email us at{' '}
            <div className="animate-bounce">
              <Link href="mailto:support@tiameds.com" className="text-purple-700 font-semibold hover:text-textdark transition duration-300">
                support@tiameds.ai
              </Link>
            </div>
            .
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="w-full p-8 rounded-lg shadow-lg space-y-8 max-w-lg mx-auto bg-white border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="block text-textdark font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="p-4 w-full bg-white border border-gray-300 rounded-lg focus:ring-primary focus:ring-2 transition-all duration-300 ease-in-out"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-textdark font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="p-4 w-full bg-white border border-gray-300 rounded-lg focus:ring-primary focus:ring-2 transition-all duration-300 ease-in-out"
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-textdark font-medium mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="p-4 w-full bg-white border border-gray-300 rounded-lg focus:ring-primary focus:ring-2 transition-all duration-300 ease-in-out"
                rows={6}
                placeholder="Type your message here"
              />
            </div>

            <div className="text-center">
              <button type="submit" disabled={loading}  className="rounded-md bg-gradient-to-r from-purple-700 to-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 animate-bounce">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {responseMessage && <p className="mt-4 text-textmuted">{responseMessage}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;
