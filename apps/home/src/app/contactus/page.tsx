'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiMail, FiUser, FiMessageSquare, FiPhone, FiMapPin, FiCheck, FiX } from 'react-icons/fi'

const ContactUsSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [activeField, setActiveField] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const controls = useAnimation()

  // Floating elements animation
  useEffect(() => {
    const interval = setInterval(() => {
      controls.start({
        y: [0, -10, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [controls])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFocus = (fieldName: string) => {
    setActiveField(fieldName)
  }

  const handleBlur = () => {
    setActiveField('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitState('idle')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitState('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      formRef.current?.reset()
    } catch (error) {
      setSubmitState('error')
    } finally {
      setLoading(false)
    }
  }

  const fieldVariants = {
    inactive: { scale: 1, borderColor: "#d1d5db" },
    active: { scale: 1.02, borderColor: "#8b5cf6" }
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`contact-bg-${i}`}
            className="absolute text-purple-100"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            <FiMail />
          </motion.div>
        ))}
      </div>

      <div className="relative isolate px-6 pt-32 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
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
              Have questions about our solutions? Reach out to our team and we&apos;ll get back to you within 24 hours.
            </motion.p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25"></div>
              <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8">Our Contact Details</h3>
                
                <div className="space-y-8">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start group"
                  >
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FiMail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-medium text-gray-900">Email Us</h4>
                      <a href="mailto:support@tiameds.ai" className="text-primary hover:text-secondary transition-colors">
                        support@tiameds.ai
                      </a>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start group"
                  >
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FiPhone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-medium text-gray-900">Call Us</h4>
                      <a href="tel:+1234567890" className="text-primary hover:text-secondary transition-colors">
                        +123-456-7890
                      </a>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start group"
                  >
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FiMapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-medium text-gray-900">Visit Us</h4>
                      <p className="text-gray-600">
                        #4754, Shivaji Road, NR Mohalla<br />
                        Mysore-570007, Karnataka<br />
                        India
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Floating contact illustration */}
                <motion.div
                  animate={controls}
                  className="absolute -bottom-10 -right-10 opacity-10"
                >
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 0C44.8 0 0 44.8 0 100C0 155.2 44.8 200 100 200C155.2 200 200 155.2 200 100C200 44.8 155.2 0 100 0ZM100 180C55.8 180 20 144.2 20 100C20 55.8 55.8 20 100 20C144.2 20 180 55.8 180 100C180 144.2 144.2 180 100 180Z" fill="#8B5CF6"/>
                    <path d="M100 40C67.2 40 40 67.2 40 100C40 132.8 67.2 160 100 160C132.8 160 160 132.8 160 100C160 67.2 132.8 40 100 40ZM100 140C78.4 140 60 121.6 60 100C60 78.4 78.4 60 100 60C121.6 60 140 78.4 140 100C140 121.6 121.6 140 100 140Z" fill="#8B5CF6"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Form Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8">Send Us a Message</h3>
                
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      variants={fieldVariants}
                      animate={activeField === 'name' ? 'active' : 'inactive'}
                    >
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
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                    </motion.div>

                    <motion.div
                      variants={fieldVariants}
                      animate={activeField === 'email' ? 'active' : 'inactive'}
                    >
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
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      variants={fieldVariants}
                      animate={activeField === 'phone' ? 'active' : 'inactive'}
                    >
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
                        onFocus={() => handleFocus('phone')}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="+1 (123) 456-7890"
                      />
                    </motion.div>

                    <motion.div
                      variants={fieldVariants}
                      animate={activeField === 'subject' ? 'active' : 'inactive'}
                    >
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiMessageSquare className="mr-2 text-gray-400" />
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onFocus={() => handleFocus('subject')}
                        onBlur={handleBlur}
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
                    </motion.div>
                  </div>

                  <motion.div
                    variants={fieldVariants}
                    animate={activeField === 'message' ? 'active' : 'inactive'}
                  >
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
                      onFocus={() => handleFocus('message')}
                      onBlur={handleBlur}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="How can we help you?"
                    ></textarea>
                  </motion.div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative group w-full flex justify-center items-center px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10 flex items-center">
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <>
                            Send Message
                            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {submitState !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mt-4 p-3 rounded-lg flex items-center ${submitState === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                        >
                          {submitState === 'success' ? (
                            <>
                              <FiCheck className="mr-2" />
                              Your message has been sent successfully!
                            </>
                          ) : (
                            <>
                              <FiX className="mr-2" />
                              Failed to send message. Please try again.
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUsSection