'use client'
import { FaArrowAltCircleRight, FaLock, FaCloud, FaBrain, FaUserMd, FaPuzzlePiece, FaChartLine, FaShieldAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const EnterpriseFeatures = () => {
  const features = [
    {
      title: 'Optimized Clinical Workflows',
      description: 'Our intelligent automation reduces administrative tasks by up to 60%, allowing providers to focus on patient care.',
      icon: <FaArrowAltCircleRight className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Enterprise-Grade Security',
      description: 'End-to-end encryption, HIPAA/GDPR compliance with multi-factor authentication and granular access controls.',
      icon: <FaLock className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Scalable Cloud Architecture',
      description: 'Built on AWS with auto-scaling capabilities maintaining 99.99% uptime SLAs for healthcare operations.',
      icon: <FaCloud className="h-6 w-6" />,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'AI-Driven Clinical Intelligence',
      description: 'Predictive analytics and machine learning models trained on millions of clinical data points.',
      icon: <FaBrain className="h-6 w-6" />,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Clinical Support Team',
      description: '24/7/365 support from teams with healthcare expertise and board-certified physicians.',
      icon: <FaUserMd className="h-6 w-6" />,
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Interoperability Ecosystem',
      description: 'HL7/FHIR-native architecture with pre-built connectors for 300+ EHR/EMR systems.',
      icon: <FaPuzzlePiece className="h-6 w-6" />,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Real-Time Analytics',
      description: 'Enterprise-wide performance metrics with drill-down to individual provider levels.',
      icon: <FaChartLine className="h-6 w-6" />,
      color: 'from-rose-500 to-rose-600'
    },
    {
      title: 'Disaster Recovery',
      description: 'Geo-redundant architecture with automated failover to ensure business continuity.',
      icon: <FaShieldAlt className="h-6 w-6" />,
      color: 'from-teal-500 to-teal-600'
    }
  ]

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6 lg:px-8 overflow-hidden">
      {/* Unique Tech Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle grid pattern */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-5"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M40 0 V40 M0 20 H40" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                className="text-gray-300"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating tech icons */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`tech-icon-${i}`}
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
            {features[Math.floor(Math.random() * features.length)].icon}
          </motion.div>
        ))}

        {/* Soft glowing dots */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="absolute rounded-full bg-primary/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              filter: 'blur(60px)'
            }}
            animate={{
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
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
            <span className="text-sm font-medium text-primary tracking-wider">
              ENTERPRISE FEATURES
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            <span className="block">Healthcare Technology</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Built for Scale
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-6 text-xl leading-8 text-gray-600"
          >
            Comprehensive solutions designed to meet the rigorous demands of modern healthcare organizations.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-6">{feature.description}</p>
              <div className="mt-6">
                <button className="inline-flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors">
                  Learn more
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button className="relative group inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
            <span className="relative z-10">Request Enterprise Demo</span>
            <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default EnterpriseFeatures