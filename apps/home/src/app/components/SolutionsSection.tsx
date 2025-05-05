'use client'
import { FaUsers, FaPhoneAlt, FaHeartbeat, FaBriefcaseMedical, FaMedkit, FaClipboardList } from 'react-icons/fa'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const SolutionsSection = () => {
  const solutions = [
    {
      title: 'Lab Management System',
      description: '99.9% accurate sample tracking with AI-powered anomaly detection',
      icon: <FaUsers className="h-5 w-5" />,
      stat: '40% faster reporting',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Smart Billing Suite',
      description: 'Self-healing claims processing with 75% fewer denials',
      icon: <FaPhoneAlt className="h-5 w-5" />,
      stat: '30% higher collections',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'MediMarket Platform',
      description: 'Blockchain-verified pharmaceutical marketplace with real-time inventory',
      icon: <FaHeartbeat className="h-5 w-5" />,
      stat: '5000+ suppliers',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Clinical AI Copilot',
      description: 'Real-time decision support reducing diagnostic errors by 30%',
      icon: <FaBriefcaseMedical className="h-5 w-5" />,
      stat: '95% accuracy',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Revenue Cycle AI',
      description: 'Automated coding audits increasing clean claims to 98%',
      icon: <FaMedkit className="h-5 w-5" />,
      stat: '45% faster payments',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Smart Inventory',
      description: 'RFID-enabled tracking reducing stockouts by 90%',
      icon: <FaClipboardList className="h-5 w-5" />,
      stat: '100% traceability',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section 
      ref={containerRef}
      className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6 lg:px-8 overflow-hidden"
    >
      {/* Subtle Molecular Grid */}
      <div className="absolute inset-0 -z-10 opacity-5 overflow-hidden">
        <svg 
          viewBox="0 0 1200 800" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <pattern 
            id="molecular-pattern" 
            width="60" 
            height="60" 
            patternUnits="userSpaceOnUse"
          >
            <circle cx="30" cy="30" r="1" fill="#3b82f6" fillOpacity="0.2" />
            <circle cx="10" cy="10" r="1" fill="#8b5cf6" fillOpacity="0.2" />
            <circle cx="50" cy="10" r="1" fill="#10b981" fillOpacity="0.2" />
            <circle cx="10" cy="50" r="1" fill="#f59e0b" fillOpacity="0.2" />
            <circle cx="50" cy="50" r="1" fill="#ef4444" fillOpacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#molecular-pattern)" />
        </svg>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              background: `radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)`,
              y: y
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-sm font-medium text-primary">HEALTHTECH SOLUTIONS</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            <span className="block">Next-Generation</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Healthcare Platforms
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade solutions powering the future of medicine with AI and advanced analytics.
          </p>
        </motion.div>

        {/* Interactive Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="relative h-full bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 group-hover:shadow-xl overflow-hidden">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/20 transition-all duration-500"></div>
                
                <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br ${solution.color} text-white mb-6`}>
                  {solution.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {solution.stat}
                  </span>
                  
                  <button className="flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors">
                    Explore
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
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <button className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-white rounded-xl group">
            <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out bg-gradient-to-r from-primary to-secondary group-hover:from-primary/90 group-hover:to-secondary/90"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-white opacity-5 group-hover:opacity-0 transition-opacity duration-500"></span>
            <span className="relative flex items-center">
              Schedule Product Demo
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionsSection