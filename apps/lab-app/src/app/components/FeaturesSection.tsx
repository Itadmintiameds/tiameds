'use client'
import { FaUserMd, FaTasks, FaUpload, FaFileAlt, FaLock, FaShieldAlt, FaUsersCog } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface Feature {
  title: string
  description: string
  icon: JSX.Element
}

const features: Feature[] = [
  {
    title: 'Patient and Doctor Integration',
    description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
    icon: <FaUserMd className="text-xl" />,
  },
  {
    title: 'Test Workflow Automation',
    description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
    icon: <FaTasks className="text-xl" />,
  },
  {
    title: 'Bulk Data Management',
    description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
    icon: <FaUpload className="text-xl" />,
  },
  {
    title: 'Report and Billing Generation',
    description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance.',
    icon: <FaFileAlt className="text-xl" />,
  },
  {
    title: 'Role-Based Access Control',
    description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
    icon: <FaLock className="text-xl" />,
  },
  {
    title: 'Technician Management',
    description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
    icon: <FaUsersCog className="text-xl" />,
  },
  {
    title: 'Customizable Workflows',
    description: "Tailor workflows to your lab's unique requirements, ensuring efficient operations and quality results.",
    icon: <FaTasks className="text-xl" />,
  },
]

export default function KeyFeaturesSection() {
  return (
    <div className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Key Features
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our software enhances your lab operations with these powerful features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white p-6 rounded-lg border border-gray-200 h-full">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}