'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiArrowRight, FiMail, FiUser, FiMessageSquare, FiPhone, FiMapPin } from 'react-icons/fi'
import FooterSection from '../components/FooterSection'

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const ContactUsSection = () => {
  const [formData, setFormData] = useState<FormData>({ 
    name: '', 
    email: '', 
    phone: '',
    subject: '',
    message: '' 
  })
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResponseMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setResponseMessage('Your message has been sent successfully!')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      setResponseMessage('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`contact-bg-${i}`}
              className="absolute text-gray-200"
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
              <FiMail className="w-6 h-6" />
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
            >
              <span className="text-sm font-medium text-primary">
                Get In Touch
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              <span className="block">Contact Our</span>
              <span className="relative inline-block">
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Support Team
                  </span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              Have questions about our solutions? Reach out to our team and we'll get back to you within 24 hours.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Contact Information */}
            <div className="space-y-8 bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900">Our Contact Details</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <FiMail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Email Us</h4>
                    <Link href="mailto:support@tiameds.ai" className="text-primary hover:text-secondary transition-colors">
                      support@tiameds.ai
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <FiPhone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Call Us</h4>
                    <Link href="tel:+1234567890" className="text-primary hover:text-secondary transition-colors">
                      +123-456-7890
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <FiMapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Visit Us</h4>
                    <p className="text-gray-600">
                      #4754, Shivaji Road, NR Mohalla<br />
                      Mysore-570007, Karnataka<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMail className="mr-2 text-gray-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiPhone className="mr-2 text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMessageSquare className="mr-2 text-gray-400" />
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
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
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiMessageSquare className="mr-2 text-gray-400" />
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative group w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="relative z-10 flex items-center">
                      {loading ? 'Sending...' : 'Send Message'}
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
      </div>
    </div>
    <FooterSection />
    </>
  )
}

export default ContactUsSection