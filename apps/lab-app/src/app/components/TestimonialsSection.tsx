'use client'
import { motion } from 'framer-motion'
import { FaFlask, FaUserMd, FaChartLine, FaShieldAlt } from 'react-icons/fa'
import Link from 'next/link'

export default function TestimonialsSection() {
  const valueProps = [
    {
      icon: <FaUserMd className="h-8 w-8" />,
      title: "Seamless Integration",
      description: "Connect patients, doctors, and lab technicians in one unified platform for streamlined workflows."
    },
    {
      icon: <FaFlask className="h-8 w-8" />,
      title: "Efficient Testing",
      description: "Automate test workflows from sample collection to result delivery, reducing processing time."
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: "Data-Driven Insights",
      description: "Real-time analytics help you track performance and identify opportunities for operational improvement."
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "HIPAA-compliant platform with role-based access controls to protect sensitive patient data."
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Transform Your <span className="text-purple-600">Lab Operations</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our platform delivers measurable improvements across key areas of lab management
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {valueProps.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="bg-purple-100 text-purple-600 h-16 w-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 text-center">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-sm max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to see it in action?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Schedule a personalized demo to discover how our platform can transform your lab workflows.
            </p>
            <Link
              href="/schedule-demo"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-8 rounded-lg hover:shadow-md transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}