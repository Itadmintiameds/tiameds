'use client';
import { motion } from 'framer-motion';
import { 
  FaArrowAltCircleRight, 
  FaLock, 
  FaCloud, 
  FaBrain, 
  FaHeadset, 
  FaPuzzlePiece,
  FaShieldAlt,
  FaServer,
  FaChartLine
} from 'react-icons/fa';
import { 
  GiArtificialIntelligence,
  GiNetworkBars,
  GiProcessor
} from 'react-icons/gi';
import { FiCpu } from 'react-icons/fi';

const ProductFeatures = () => {
  const features = [
    {
      title: 'Optimized Workflow Engine',
      description: 'Automate and streamline operations with our intelligent process orchestration tools',
      icon: <FaArrowAltCircleRight className="h-6 w-6" />,
      iconBg: 'bg-blue-100 text-blue-600',
      pattern: <GiNetworkBars className="absolute -right-4 -bottom-4 text-blue-200/40 text-6xl" />
    },
    {
      title: 'Enterprise-Grade Security',
      description: 'Military-grade encryption with zero-trust architecture and compliance certifications',
      icon: <FaLock className="h-6 w-6" />,
      iconBg: 'bg-violet-100 text-violet-600',
      pattern: <FaShieldAlt className="absolute -right-4 -bottom-4 text-violet-200/40 text-6xl" />
    },
    {
      title: 'Cloud-Native Infrastructure',
      description: 'Elastic, distributed systems designed for global scale and reliability',
      icon: <FaCloud className="h-6 w-6" />,
      iconBg: 'bg-teal-100 text-teal-600',
      pattern: <FaServer className="absolute -right-4 -bottom-4 text-teal-200/40 text-6xl" />
    },
    {
      title: 'AI-Powered Analytics',
      description: 'Predictive insights and machine learning models for data-driven decisions',
      icon: <FaBrain className="h-6 w-6" />,
      iconBg: 'bg-purple-100 text-purple-600',
      pattern: <GiArtificialIntelligence className="absolute -right-4 -bottom-4 text-purple-200/40 text-6xl" />
    },
    {
      title: '24/7 Expert Support',
      description: 'Dedicated technical teams with SLA-backed response times',
      icon: <FaHeadset className="h-6 w-6" />,
      iconBg: 'bg-amber-100 text-amber-600',
      pattern: <FiCpu className="absolute -right-4 -bottom-4 text-amber-200/40 text-6xl" />
    },
    {
      title: 'Seamless Integration',
      description: 'API-first design with pre-built connectors for enterprise systems',
      icon: <FaPuzzlePiece className="h-6 w-6" />,
      iconBg: 'bg-green-100 text-green-600',
      pattern: <FaChartLine className="absolute -right-4 -bottom-4 text-green-200/40 text-6xl" />
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6 lg:px-8 overflow-hidden">
      {/* Circuit Board Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-5">
        <svg 
          viewBox="0 0 1200 800" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path 
            d="M100,100 L1100,100 L1100,700 L100,700 Z" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="text-blue-200"
            fill="none"
          />
          <rect x="300" y="300" width="600" height="200" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="text-purple-200"
            fill="none"
          />
          <circle cx="600" cy="400" r="150"
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="text-teal-200"
            fill="none"
          />
        </svg>
      </div>

      {/* Floating Tech Icons */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <GiProcessor className="absolute top-1/4 left-10 text-blue-100 text-6xl animate-float-slow" />
        <FaServer className="absolute top-1/3 right-20 text-violet-100 text-5xl animate-float" />
        <FiCpu className="absolute bottom-1/4 left-1/4 text-teal-100 text-7xl animate-float-slower" />
        <GiNetworkBars className="absolute bottom-1/3 right-1/3 text-amber-100 text-6xl animate-float" />
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
            <span className="text-sm font-medium text-primary">ENTERPRISE TECHNOLOGY SOLUTIONS</span>
          </motion.div>

          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            <span className="block">Innovative IT Solutions for</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Digital Transformation
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cutting-edge software and infrastructure solutions designed to power modern enterprises.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
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
                {feature.pattern}
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} mb-6 transition-all duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                
                <button className="flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors">
                  Learn More
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
      </div>
    </section>
  );
};

export default ProductFeatures;