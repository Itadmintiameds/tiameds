'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const CareerSection = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Animated background elements similar to hero section */}
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
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 12l8 10 8-10z" />
              </svg>
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
                Join Our Growing Team
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              <span className="block">Transform Healthcare</span>
              <span className="relative inline-block">
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    With Your Talent
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
              At Tiameds Technology, we&apos;re building the future of healthcare solutions. 
              Join our mission-driven team of innovators creating enterprise-grade platforms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/careers/apply"
                className="relative group rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">View Open Positions</span>
                <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-2 text-gray-900 font-medium hover:text-primary transition-colors"
              >
                Learn About Our Culture
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Benefits section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-16 bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Join Tiameds?</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                {[
                  "Make an impact in the healthcare industry",
                  "Work with cutting-edge technology",
                  "Collaborate with a passionate team",
                  "Flexible work arrangements",
                  "Competitive compensation & benefits",
                  "Continuous learning opportunities"
                ].map((benefit, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-gray-600">{benefit}</p>
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

export default CareerSection