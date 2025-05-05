'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <div className="bg-gradient-to-r from-purple-700 to-purple-900 py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 40 - 20],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            {i % 2 === 0 ? '🧪' : '🔬'}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-white relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold sm:text-4xl"
        >
          Currently in Testing Phase - Join Our Pilot Program
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto"
        >
          Be among the first to experience our lab management solution with exclusive early access benefits and dedicated support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
        >
          {/* <Link
            href="/apply-for-pilot"
            className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 sm:px-12 sm:py-3 text-sm font-semibold text-purple-600 shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl"
          >
            Apply for Pilot Access
            <motion.span 
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Link> */}
          
          <Link
            href="/schedule-demo"
            className="inline-flex items-center justify-center rounded-md px-8 py-3 sm:px-12 sm:py-3 text-sm font-semibold text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300"
          >
            Schedule Demo
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 text-sm text-purple-200"
        >
          Limited spots available for our testing program. Early participants will receive special pricing.
        </motion.p>
      </div>
    </div>
  )
}