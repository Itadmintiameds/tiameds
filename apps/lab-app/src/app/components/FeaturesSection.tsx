'use client'
import { motion } from 'framer-motion'
import { FaFileAlt, FaLock, FaMagic, FaTasks, FaUpload, FaUserMd, FaUsersCog } from 'react-icons/fa'

interface Feature {
  title: string
  description: string
  icon: JSX.Element
  featured?: boolean
}

interface Category {
  name: string
  tagline: string
  features: Feature[]
}

const categories: Category[] = [
  {
    name: 'AI & Reporting',
    tagline: 'Reports that write the first draft for you.',
    features: [
      {
        title: 'AI-Powered Report Insights',
        description: 'Every report is paired with AI-generated interpretation and insights, helping technicians review results faster and with more confidence.',
        icon: <FaMagic className="text-xl" />,
        featured: true,
      },
      {
        title: 'Report and Billing Generation',
        description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance.',
        icon: <FaFileAlt className="text-xl" />,
      },
    ],
  },
  {
    name: 'Patient & Workflow',
    tagline: 'From intake to result, without the busywork.',
    features: [
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
        title: 'Customizable Workflows',
        description: "Tailor workflows to your lab's unique requirements, ensuring efficient operations and quality results.",
        icon: <FaTasks className="text-xl" />,
      },
    ],
  },
  {
    name: 'Security & Team',
    tagline: 'Control who sees what, without slowing anyone down.',
    features: [
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
    ],
  },
]

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export default function KeyFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-base-white py-1 sm:py-1 lg:py-1">
      {/* Soft background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary-50/60 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-secondary-50/60 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-50 px-5 py-2 shadow-xsm">
            <span className="text-base leading-none">✨</span>
            <span className="text-label-l3 font-semibold text-secondary-800">
              Now with AI-assisted reports
            </span>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-pneutral-900 sm:text-4xl mb-4 font-heading">
            <span className="text-primary-700">Key Features</span>
          </h2>
          <p className="text-p4 text-pneutral-600 max-w-3xl mx-auto">
            Discover how our software enhances your lab operations, organized by what you&apos;re trying to get done.
          </p>
        </motion.div>

        {/* Jump-to links (all sections below are always visible) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map((category) => (
            <a
              key={category.name}
              href={`#${slugify(category.name)}`}
              className="rounded-full border border-pneutral-200 bg-base-white px-5 py-2 text-label-l3 font-semibold text-pneutral-600 transition-all duration-300 hover:border-primary-200 hover:text-primary-700"
            >
              {category.name}
            </a>
          ))}
        </div>

        {/* All categories, stacked and visible */}
        <div className="space-y-10">
          {categories.map((category) => (
            <div key={category.name} id={slugify(category.name)} className="scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-h4 font-heading font-semibold text-pneutral-900">
                  {category.name}
                </h3>
                <p className="mt-1 text-p3 text-pneutral-500">{category.tagline}</p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {category.features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className={`group ${feature.featured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                  >
                    <div
                      className={
                        feature.featured
                          ? 'relative overflow-hidden bg-linear-to-br from-secondary-50 to-primary-50 p-6 rounded-lg border border-secondary-300 hover:border-secondary-400 transition-all duration-300 hover:shadow-lg h-full flex flex-col sm:flex-row sm:items-start sm:gap-6'
                          : 'bg-pneutral-50 p-6 rounded-lg border border-pneutral-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg h-full flex flex-col'
                      }
                    >
                      {feature.featured && (
                        <span className="absolute top-4 right-4 rounded-full bg-secondary-700 px-3 py-1 text-label-l2 font-semibold text-base-white">
                          AI-Powered
                        </span>
                      )}

                      {/* Icon */}
                      <div
                        className={
                          feature.featured
                            ? 'w-14 h-14 flex-none rounded-full bg-secondary-700 text-base-white flex items-center justify-center mb-4 sm:mb-0 transition-all duration-300'
                            : 'w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary-700 group-hover:text-base-white'
                        }
                      >
                        {feature.icon}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col grow">
                        <h4
                          className={
                            feature.featured
                              ? 'text-h5 font-semibold text-pneutral-900 mb-2 font-heading pr-24 sm:pr-0'
                              : 'text-h6 font-semibold text-pneutral-900 mb-2 font-heading'
                          }
                        >
                          {feature.title}
                        </h4>
                        <p className={feature.featured ? 'text-p4 text-pneutral-700 grow' : 'text-p3 text-pneutral-600 grow'}>
                          {feature.description}
                        </p>

                        {/* Bottom accent bar */}
                        {!feature.featured && (
                          <div className="mt-4 h-0.5 w-12 bg-primary-300 group-hover:w-full group-hover:bg-primary-700 transition-all duration-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}






// code written by abhishek , .............do not delete..........

// 'use client'
// import { motion } from 'framer-motion'
// import { FaFileAlt, FaLock, FaTasks, FaUpload, FaUserMd, FaUsersCog } from 'react-icons/fa'

// interface Feature {
//   title: string
//   description: string
//   icon: JSX.Element
// }

// const features: Feature[] = [
//   {
//     title: 'Patient and Doctor Integration',
//     description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
//     icon: <FaUserMd className="text-xl" />,
//   },
//   {
//     title: 'Test Workflow Automation',
//     description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
//     icon: <FaTasks className="text-xl" />,
//   },
//   {
//     title: 'Bulk Data Management',
//     description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
//     icon: <FaUpload className="text-xl" />,
//   },
//   {
//     title: 'Report and Billing Generation',
//     description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance.',
//     icon: <FaFileAlt className="text-xl" />,
//   },
//   {
//     title: 'Role-Based Access Control',
//     description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
//     icon: <FaLock className="text-xl" />,
//   },
//   {
//     title: 'Technician Management',
//     description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
//     icon: <FaUsersCog className="text-xl" />,
//   },
//   {
//     title: 'Customizable Workflows',
//     description: "Tailor workflows to your lab's unique requirements, ensuring efficient operations and quality results.",
//     icon: <FaTasks className="text-xl" />,
//   },
// ]

// export default function KeyFeaturesSection() {
//   return (
//     <div className="bg-white py-20 sm:py-24 lg:py-32">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
//             <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//               Key Features
//             </span>
//           </h2>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Discover how our software enhances your lab operations with these powerful features.
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className="relative group"
//             >
//               <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
//               <div className="relative bg-white p-6 rounded-lg border border-gray-200 h-full">
//                 <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }










// 'use client'
// import { motion } from 'framer-motion'
// import { FaFileAlt, FaLock, FaTasks, FaUpload, FaUserMd, FaUsersCog } from 'react-icons/fa'

// interface Feature {
//   title: string
//   description: string
//   icon: JSX.Element
// }

// const features: Feature[] = [
//   {
//     title: 'Patient and Doctor Integration',
//     description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
//     icon: <FaUserMd className="text-xl" />,
//   },
//   {
//     title: 'Test Workflow Automation',
//     description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
//     icon: <FaTasks className="text-xl" />,
//   },
//   {
//     title: 'Bulk Data Management',
//     description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
//     icon: <FaUpload className="text-xl" />,
//   },
//   {
//     title: 'Report and Billing Generation',
//     description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance.',
//     icon: <FaFileAlt className="text-xl" />,
//   },
//   {
//     title: 'Role-Based Access Control',
//     description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
//     icon: <FaLock className="text-xl" />,
//   },
//   {
//     title: 'Technician Management',
//     description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
//     icon: <FaUsersCog className="text-xl" />,
//   },
//   {
//     title: 'Customizable Workflows',
//     description: "Tailor workflows to your lab's unique requirements, ensuring efficient operations and quality results.",
//     icon: <FaTasks className="text-xl" />,
//   },
// ]

// export default function KeyFeaturesSection() {
//   return (
//     <div className="bg-white py-20 sm:py-24 lg:py-32">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
//             <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//               Key Features
//             </span>
//           </h2>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Discover how our software enhances your lab operations with these powerful features.
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className="relative group"
//             >
//               <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
//               <div className="relative bg-white p-6 rounded-lg border border-gray-200 h-full">
//                 <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }