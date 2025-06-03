'use client'
import { motion } from 'framer-motion'
import { FiCalendar, FiZap, FiClock, FiMail, FiPhone, FiArrowRight, FiCheck } from 'react-icons/fi'
import { FaFlask, FaPills, FaMicroscope } from 'react-icons/fa'
import { useState } from 'react'
import FooterSection from '../components/FooterSection'

const DemoPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Fake API call simulation
    setTimeout(() => {
      setSubmitted(true)
      setEmail('')
      setIsLoading(false)
    }, 1500)
  }

  return (
 <>
    <div className="relative isolate bg-white py-24 sm:py-32 min-h-screen">
      {/* Animated gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-pulse"
        />
      </div>

      {/* Floating medical icons */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-10">
        <FaFlask className="absolute top-1/4 left-10 text-primary text-4xl animate-float-slow" />
        <FaPills className="absolute top-1/3 right-20 text-secondary text-3xl animate-float" />
        <FaMicroscope className="absolute bottom-1/4 left-1/4 text-primary text-5xl animate-float-slower" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 mb-6"
          >
            <FiZap className="mr-2 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">BETA PREVIEW</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="block">Demo Scheduling</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            We&apos;re putting the finishing touches on our demo scheduling system to give you the best experience possible.
          </p>
        </motion.div>

        {/* Countdown/Progress */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <FiClock className="text-primary text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Estimated Launch</h2>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          <p className="text-gray-600 text-center">Development in progress - 75% complete</p>
        </motion.div>

        {/* Alternative contact options */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FiMail className="text-primary text-2xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
            </div>
            <p className="text-gray-600 mb-4">Send us a message to schedule a manual demo appointment</p>
            <a 
              href="mailto:demos@yourcompany.com" 
              className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
            >
              Contact via email <FiArrowRight className="ml-2" />
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FiPhone className="text-primary text-2xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
            </div>
            <p className="text-gray-600 mb-4">Speak directly with our team to arrange a demo</p>
            <a 
              href="tel:+11234567890" 
              className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
            >
              +91 7678325053<FiArrowRight className="ml-2" />
            </a>
          </div>
        </motion.div>

        {/* Notify me form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <FiCalendar className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {submitted ? 'Thank You!' : 'Get Notified When We Launch'}
            </h3>
            <p className="text-gray-600">
              {submitted ? "We'll notify you as soon as our demo scheduling is available." : "Be the first to know when our demo scheduling is available"}
            </p>
          </div>
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <FiCheck className="text-2xl" />
              </div>
              <p className="text-gray-700">You&apos;ve been added to our notification list!</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-primary font-medium hover:text-secondary transition-colors"
              >
                Submit another email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all shadow hover:shadow-md ${isLoading ? 'opacity-80' : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Notify Me'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
      <FooterSection />
 </>
  )
}

export default DemoPage