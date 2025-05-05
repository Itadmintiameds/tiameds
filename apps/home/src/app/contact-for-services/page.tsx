'use client'
import { FaHeadset, FaCalendarAlt, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import FooterSection from '../components/FooterSection'

interface ServiceContactPageProps {
  params: {
    serviceName: string
  }
}

const ServiceContactPage = ({ params }: ServiceContactPageProps) => {
  const serviceName = params?.serviceName || "Your Selected Service"
  
  const contactMethods = [
    {
      icon: <FaHeadset className="h-8 w-8 text-primary" />,
      title: "Live Chat",
      description: "Chat with our solutions team in real-time",
      action: "Start Chat",
      link: "#chat",
      underDevelopment: true
    },
    {
      icon: <FaCalendarAlt className="h-8 w-8 text-primary" />,
      title: "Schedule Meeting",
      description: "Book a consultation at your convenience",
      action: "Book Now",
      link: "#schedule",
      underDevelopment: true
    },
    {
      icon: <FaPhoneAlt className="h-8 w-8 text-primary" />,
      title: "Call Us",
      description: "+91 7678325053",
      action: "Call Now",
      link: "tel:+15551234567",
      underDevelopment: false
    },
    {
      icon: <FaEnvelope className="h-8 w-8 text-primary" />,
      title: "Email Us",
      description: "solutions@tiamedstech.com",
      action: "Send Email",
      link: "mailto:solutions@tiamedstech.com",
      underDevelopment: true
    }
  ]

  return (
    <>
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative px-6 pt-24 pb-16 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`contact-icon-${i}`}
              className="absolute text-gray-400"
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
              <FaHeadset className="h-full w-full" />
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
          >
            <span className="text-sm font-medium text-primary">
              Get in Touch
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            <span className="block">Discuss</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {serviceName}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Let&apos;s explore how our {serviceName.toLowerCase()} can address your specific business requirements and technology challenges.
          </motion.p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="py-12 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Options</h2>
              
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-start p-6 rounded-xl border ${method.underDevelopment ? 'border-gray-200' : 'border-gray-200 hover:border-primary'} transition-colors relative`}
                  >
                    {method.underDevelopment && (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Coming Soon
                      </div>
                    )}
                    <div className="flex-shrink-0 mr-6">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-gray-600 mb-4">{method.description}</p>
                      <Link
                        href={method.link}
                        className={`inline-flex items-center font-medium transition-colors ${method.underDevelopment ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-secondary'}`}
                        aria-disabled={method.underDevelopment}
                        tabIndex={method.underDevelopment ? -1 : undefined}
                      >
                        {method.action}
                        {!method.underDevelopment && (
                          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h3>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service Interest</label>
                  <select
                    id="service"
                    name="service"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    defaultValue={serviceName}
                  >
                    <option>{serviceName}</option>
                    <option>Custom Development</option>
                    <option>Cloud Services</option>
                    <option>Security Solutions</option>
                    <option>AI & Automation</option>
                    <option>Data Engineering</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about your project needs..."
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 px-6 rounded-lg shadow hover:shadow-md transition-all"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Office Info */}
      <div className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Visit us or reach out to our global teams</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                city: "Mysore",
                address: "#4754, Shivaji Road, NR Mohalla\nMysore-570007, Karnataka\nIndia",
                phone: "+91 1234567890",
              },
             
            ].map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm text-center"
              >
                <div className="flex justify-center mb-4">
                  <FaMapMarkerAlt className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{office.city}</h3>
                <p className="text-gray-600 whitespace-pre-line mb-4">{office.address}</p>
                <p className="text-gray-700 font-medium">{office.phone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <FooterSection />
    </>
  )
}

export default ServiceContactPage