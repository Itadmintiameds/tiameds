'use client'
import { FaFlask, FaPills, FaLaptopMedical, FaHospital, FaShieldAlt, FaBolt, FaCodeBranch } from 'react-icons/fa'
import { GiTestTubes } from 'react-icons/gi'
import { MdOutlineSupportAgent } from 'react-icons/md'
import { motion } from 'framer-motion'
import { useState } from 'react'

const BetaFeatures = () => {
  const [activeTab, setActiveTab] = useState(0)
  
  const betaProducts = [
    {
      name: 'PharmaAI',
      icon: <FaPills className="text-2xl" />,
      color: 'bg-violet-100 text-violet-600',
      features: [
        'AI-powered drug interaction detection',
        'Automated prescription validation',
        'Predictive inventory forecasting'
      ],
      progress: 75
    },
    {
      name: 'LabConnect',
      icon: <FaFlask className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600',
      features: [
        'Real-time lab equipment monitoring',
        'Blockchain sample tracking',
        'Cross-facility data sharing'
      ],
      progress: 60
    },
    {
      name: 'MediPortal Pro',
      icon: <FaLaptopMedical className="text-2xl" />,
      color: 'bg-teal-100 text-teal-600',
      features: [
        'Unified healthcare marketplace',
        'Smart contract purchasing',
        'Vendor reputation system'
      ],
      progress: 45
    }
  ]

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 px-6 lg:px-8 overflow-hidden">
      {/* Circuit Board Background */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <svg 
          viewBox="0 0 1200 800" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="circuit" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#3b82f6" fillOpacity="0.2" />
              <path d="M20 0 V40 M0 20 H40" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
          
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${Math.random() * 1200},${Math.random() * 800} Q${Math.random() * 1200},${Math.random() * 800} ${Math.random() * 1200},${Math.random() * 800}`}
              stroke="#3b82f6"
              strokeWidth="0.5"
              strokeDasharray="2 3"
              fill="none"
              strokeOpacity="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
              }}
            />
          ))}
        </svg>
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="flex items-center text-sm font-medium text-primary">
              <FaCodeBranch className="mr-2 animate-pulse" />
              IN DEVELOPMENT
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            <span className="block">Building the Future of</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Healthcare Technology
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preview our upcoming innovations currently in active development.
          </p>
        </motion.div>

        {/* Beta Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {betaProducts.map((product, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex-1 py-5 px-6 text-center font-medium transition-colors ${activeTab === index ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className={`p-2 rounded-lg ${product.color}`}>
                    {product.icon}
                  </span>
                  <span>{product.name}</span>
                  {index === 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">Most Active</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Features List */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaBolt className="text-amber-500" />
                  Planned Features
                </h3>
                <ul className="space-y-4">
                  {betaProducts[activeTab].features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full ${betaProducts[activeTab].color.replace('100', '200')} flex items-center justify-center mr-3 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Development Progress */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Development Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion</span>
                    <span>{betaProducts[activeTab].progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${betaProducts[activeTab].progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-2.5 rounded-full ${betaProducts[activeTab].color.replace('100', '500').split(' ')[0]}`}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Expected Release</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Target Date</div>
                      <div className="font-medium">
                        Q{Math.floor(activeTab + new Date().getMonth() / 3 + 2) % 4 + 1} 2024
                      </div>
                    </div>
                    <button className="flex-shrink-0 flex items-center justify-center px-5 py-3 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                      Request Early Access
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">Want to influence our development roadmap?</p>
          <button className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-white rounded-xl group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg hover:shadow-xl">
            <span className="relative z-10 flex items-center">
              Join Our Beta Program
              <svg 
                className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default BetaFeatures