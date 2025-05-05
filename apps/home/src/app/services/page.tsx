'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaChartLine, FaCloud, FaCode, FaNetworkWired, FaRobot, FaShieldAlt } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'

const ServicesPage = () => {
  const serviceCategories = [
    {
      title: "Custom Development",
      description: "Tailored software solutions designed to your exact business requirements",
      icon: <FaCode className="h-6 w-6" />,
      services: [
        "Enterprise Application Development",
        "Legacy System Modernization",
        "API Development & Integration",
        "Microservices Architecture",
        "Custom CRM/ERP Solutions"
      ],
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Cloud Services",
      description: "End-to-end cloud solutions for scalability and reliability",
      icon: <FaCloud className="h-6 w-6" />,
      services: [
        "Cloud Migration Strategy",
        "Multi-Cloud Architecture",
        "Serverless Implementations",
        "Cloud Security & Compliance",
        "Cost Optimization"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Security Solutions",
      description: "Comprehensive protection for your digital infrastructure",
      icon: <FaShieldAlt className="h-6 w-6" />,
      services: [
        "Security Audits & Assessments",
        "Data Encryption Solutions",
        "IAM & Access Control",
        "Threat Detection Systems",
        "Compliance Management"
      ],
      color: "from-green-500 to-teal-500"
    },
    {
      title: "AI & Automation",
      description: "Intelligent systems to transform your operations",
      icon: <FaRobot className="h-6 w-6" />,
      services: [
        "Machine Learning Solutions",
        "Process Automation",
        "Predictive Analytics",
        "Natural Language Processing",
        "Computer Vision Systems"
      ],
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Data Engineering",
      description: "Turn your data into a strategic asset",
      icon: <FaChartLine className="h-6 w-6" />,
      services: [
        "Data Warehouse Solutions",
        "ETL Pipeline Development",
        "Real-time Analytics",
        "Business Intelligence",
        "Data Governance"
      ],
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Infrastructure",
      description: "Robust foundations for your technology stack",
      icon: <FaNetworkWired className="h-6 w-6" />,
      services: [
        "DevOps Implementation",
        "Containerization Strategy",
        "IaC & Configuration Management",
        "High Availability Systems",
        "Disaster Recovery"
      ],
      color: "from-yellow-500 to-amber-500"
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative px-6 pt-24 pb-16 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`service-icon-${i}`}
              className="absolute text-gray-400"
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
              {serviceCategories[Math.floor(Math.random() * serviceCategories.length)].icon}
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
          >
            <span className="text-sm font-medium text-primary">
              Our Services
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            <span className="block">Enterprise Technology</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Services & Solutions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            We deliver comprehensive technology services designed to solve complex business challenges 
            and drive digital transformation at scale.
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-lg border border-gray-100"
              >
                <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-r ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${category.color} text-white mb-6`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{category.title}</h3>
                <p className="text-gray-600 mb-6">{category.description}</p>
                
                <div className="space-y-3">
                  {category.services.map((service) => (
                    <div key={service} className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 mt-1 rounded-full bg-gradient-to-r ${category.color} opacity-80`} />
                      <p className="ml-3 text-gray-700">{service}</p>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/contact-for-services" 
                  className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors"
                >
                  Discuss this service
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="mx-auto max-w-4xl text-center rounded-xl bg-white p-12 shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
            Ready to transform your technology infrastructure?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our team of experts is ready to discuss your project requirements and propose tailored solutions.
          </p>
          <Link
            href="/contact-for-services"
            className="relative group inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-8 py-4 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            <span className="relative z-10">Get in Touch</span>
            <FiArrowRight className="ml-3 inline-block group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServicesPage