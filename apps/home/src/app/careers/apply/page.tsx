'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiBriefcase, FiMail, FiPhone } from 'react-icons/fi'

const ApplyPage = () => {
  // const [jobListings] = useState<any[]>([]) // Empty job listings array

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`career-bg-${i}`}
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
              <FiBriefcase className="w-6 h-6" />
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
                Join Our Team
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              <span className="block">Current Job</span>
              <span className="relative inline-block">
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Opportunities
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

            {/* No Jobs Available Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 bg-white/50 backdrop-blur-sm rounded-xl p-12 shadow-sm border border-gray-100 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-purple-100">
                  <FiBriefcase className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-gray-900">
                  No Open Positions Currently
                </h3>
                <p className="mt-4 text-gray-600">
                  We don&apos;t have any open positions at the moment, but we&apos;re always looking for talented individuals to join our team.
                </p>
                <div className="mt-8">
                  <p className="text-sm font-medium text-gray-500 mb-4">
                    STAY CONNECTED FOR FUTURE OPPORTUNITIES
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link
                      href="/contact"
                      className="relative group rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="relative z-10">Contact Us</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center justify-center gap-4">
                      <Link
                        href="mailto:careers@tiameds.ai"
                        className="flex items-center text-gray-900 font-medium hover:text-primary transition-colors"
                      >
                        <FiMail className="mr-2" />
                        Email Us
                      </Link>
                      <Link
                        href="tel:+1234567890"
                        className="flex items-center text-gray-900 font-medium hover:text-primary transition-colors"
                      >
                        <FiPhone className="mr-2" />
                        Call Us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Future Opportunities */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Roles We Typically Hire For
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  "Frontend Developers",
                  "Backend Engineers",
                  "DevOps Specialists",
                  "Product Managers",
                  "UI/UX Designers",
                  "QA Engineers"
                ].map((role, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-center"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiBriefcase className="text-primary" />
                    </div>
                    <p className="font-medium text-gray-900">{role}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ApplyPage