'use client'
import { FaCode, FaServer, FaShieldAlt, FaCloud, FaRobot, FaChartLine } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'

const About = () => {
  const services = [
    {
      icon: <FaCode className="h-8 w-8" />,
      title: "Custom Software Development",
      description: "Tailored solutions built to your exact specifications and business requirements.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <FaServer className="h-8 w-8" />,
      title: "Enterprise Systems",
      description: "Scalable architecture designed for large organizations with complex needs.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Security Solutions",
      description: "End-to-end protection for your digital assets and infrastructure.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <FaCloud className="h-8 w-8" />,
      title: "Cloud Services",
      description: "Migration, optimization, and management of cloud infrastructure.",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: <FaRobot className="h-8 w-8" />,
      title: "AI Integration",
      description: "Implementing intelligent automation and machine learning capabilities.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: "Data Analytics",
      description: "Transforming raw data into actionable business insights.",
      color: "from-red-500 to-orange-500"
    }
  ]

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 px-6 lg:py-24 lg:px-8 overflow-hidden">
      {/* Floating tech elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`about-icon-${i}`}
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
            {services[Math.floor(Math.random() * services.length)].icon}
          </motion.div>
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
            <span className="text-sm font-medium text-primary">
              Technology Services
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            <span className="block">Enterprise-Grade</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Technical Expertise
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-6 text-xl leading-8 text-gray-600"
          >
            We architect, build, and maintain sophisticated technology solutions for businesses 
            that demand reliability, security, and scalability.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${service.color} text-white`}>
                {service.icon}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="mt-2 text-gray-600">{service.description}</p>
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
          <Link
            href="/services"
            className="relative group inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="relative z-10">Explore Our Services</span>
            <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default About