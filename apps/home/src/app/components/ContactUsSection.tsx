'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaPaperPlane, FaEnvelope, FaUser, FaComment } from 'react-icons/fa'

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
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6 lg:px-8 overflow-hidden">
      {/* Floating Tech Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`contact-icon-${i}`}
            className="absolute text-gray-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            <FaEnvelope />
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
          >
            <span className="text-sm font-medium text-primary">
              CONTACT US
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            <span className="block">Get In Touch</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              With Our Team
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-xl leading-8 text-gray-600"
          >
            Have a question? We&apos;re here to assist you. Get in touch with our team for any inquiries, suggestions, or support.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-8 p-8 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900">We&apos;re here to help!</h3>
            <p className="text-gray-600">
              Whether you&apos;re looking for more information about our products, need support, or just want to chat, our team is ready to assist.
            </p>
            
            <div className="flex items-center text-gray-600">
              <FaEnvelope className="text-primary mr-4 text-xl" />
              <div>
                <p className="font-medium">Email us at</p>
                <Link 
                  href="mailto:support@tiameds.ai" 
                  className="text-primary hover:text-secondary transition-colors"
                >
                  support@tiameds.ai
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaUser className="mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaComment className="mr-2 text-gray-400" />
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  rows={5}
                  placeholder="Type your message here"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="relative z-10 flex items-center">
                    {loading ? 'Sending...' : 'Send Message'}
                    <FaPaperPlane className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                {responseMessage && (
                  <p className={`mt-4 text-center text-sm ${responseMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {responseMessage}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactUsSection