'use client'
import { FaFlask, FaPills, FaLaptopMedical, FaHospital, FaShieldAlt,  } from 'react-icons/fa'
import { GiMedicinePills, GiTestTubes, GiHospital } from 'react-icons/gi'
import { BsHospitalFill, BsShieldLock } from 'react-icons/bs'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { useRef } from 'react'

const HealthcareSolutions = () => {
  const solutions = [
    {
      title: 'PharmaSuite Pro',
      description: 'Comprehensive pharmacy management with intelligent inventory and prescription tracking',
      icon: <FaPills className="text-2xl" />,
      iconBg: 'bg-violet-100 text-violet-600',
      pattern: <GiMedicinePills className="absolute -right-4 -bottom-4 text-violet-200/40 text-6xl" />
    },
    {
      title: 'LabOS Nexus',
      description: 'Advanced laboratory information system with AI-powered sample management',
      icon: <FaFlask className="text-2xl" />,
      iconBg: 'bg-blue-100 text-blue-600',
      pattern: <GiTestTubes className="absolute -right-4 -bottom-4 text-blue-200/40 text-6xl" />
    },
    {
      title: 'MediMarket Hub',
      description: 'Enterprise pharmaceutical e-commerce with verified supply chain integration',
      icon: <FaPills className="text-2xl" />,
      iconBg: 'bg-teal-100 text-teal-600',
      pattern: <FaPills className="absolute -right-4 -bottom-4 text-teal-200/40 text-6xl" />
    },
    {
      title: 'HospitalIQ',
      description: 'Integrated hospital management platform with patient flow optimization',
      icon: <FaHospital className="text-2xl" />,
      iconBg: 'bg-amber-100 text-amber-600',
      pattern: <GiHospital className="absolute -right-4 -bottom-4 text-amber-200/40 text-6xl" />
    },
    {
      title: 'PharmaShield',
      description: 'Regulatory compliance and drug safety monitoring system',
      icon: <FaShieldAlt className="text-2xl" />,
      iconBg: 'bg-rose-100 text-rose-600',
      pattern: <BsShieldLock className="absolute -right-4 -bottom-4 text-rose-200/40 text-6xl" />
    },
    {
      title: 'ClinicOS',
      description: 'Unified clinical management with telemedicine integration',
      icon: <FaLaptopMedical className="text-2xl" />,
      iconBg: 'bg-purple-100 text-purple-600',
      pattern: <BsHospitalFill className="absolute -right-4 -bottom-4 text-purple-200/40 text-6xl" />
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6 lg:px-8 overflow-hidden">
      {/* DNA Strand Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-5">
        <svg 
          viewBox="0 0 1200 800" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path 
            d="M100,400 C300,100 500,700 700,400 C900,100 1100,700 1200,400" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="text-blue-200"
            fill="none"
          />
          <path 
            d="M100,410 C300,110 500,710 700,410 C900,110 1100,710 1200,410" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="text-purple-200"
            fill="none"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-primary/10 mb-6"
          >
            <span className="text-sm font-medium text-primary">HEALTHCARE SOFTWARE SOLUTIONS</span>
          </motion.div>

          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            <span className="block">Specialized Platforms for</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Modern Healthcare
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cutting-edge software solutions designed to transform pharmacy, laboratory, and hospital operations.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="relative h-full bg-white p-8 rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                {/* Background pattern */}
                {solution.pattern}
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${solution.iconBg} mb-6 transition-all duration-300 group-hover:scale-110`}>
                  {solution.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                
                <button className="flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors">
                  Explore Platform
                  <svg 
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <button className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-white rounded-xl group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg hover:shadow-xl">
            <span className="relative z-10 flex items-center">
              Request Custom Demo
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

export default HealthcareSolutions