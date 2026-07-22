'use client'
import { motion } from 'framer-motion'
import { FaFlask, FaMagic, FaMicroscope, FaShieldAlt, FaUserMd } from 'react-icons/fa'

interface Capability {
  icon: JSX.Element
  title: string
  description: string
  featured?: boolean
}

const capabilities: Capability[] = [
  {
    icon: <FaMagic className="h-6 w-6" />,
    title: 'AI-Powered Report Insights',
    description: 'Every report comes with AI-generated interpretation, helping your team review results faster and with more confidence.',
    featured: true,
  },
  {
    icon: <FaUserMd className="h-6 w-6" />,
    title: 'Patient & Doctor Integration',
    description: 'A central record of patient histories, doctor referrals, and test prescriptions.',
  },
  {
    icon: <FaFlask className="h-6 w-6" />,
    title: 'Automated Workflows',
    description: 'Test booking, sample tracking, and report generation run on autopilot.',
  },
  {
    icon: <FaShieldAlt className="h-6 w-6" />,
    title: 'Security ',
    description: 'Role-based access keeps sensitive patient data protected end-to-end.',
  },
  {
    icon: <FaMicroscope className="h-6 w-6" />,
    title: 'Real-Time Analytics',
    description: 'Live performance and operational tracking across every lab you run.',
  },
]

const pillars = ['Efficiency', 'Accuracy', 'Security']

export default function AboutSection() {
  return (
    <section className="relative bg-base-white py-10 sm:py-10 lg:py-10 overflow-hidden">
      {/* Soft background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-0 h-96 w-96 rounded-full bg-secondary-50/60 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-50/60 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-50 px-5 py-2 shadow-xsm">
            <span className="text-base leading-none">✨</span>
            <span className="text-label-l3 font-semibold text-secondary-800">
              Now with AI-assisted reports
            </span>
          </span>
          <h2 className="mt-5 text-display-sm font-bold text-pneutral-900 font-heading mb-4">
            Empowering Labs with <span className="text-primary-700">Innovation</span>
          </h2>
          <p className="text-p4 text-pneutral-600 max-w-3xl mx-auto">
            Our software solutions are designed to revolutionize lab management, ensuring efficiency, security, and seamless operations.
          </p>
        </motion.div>

        {/* Bento layout: narrative panel + capability tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* Narrative panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-pneutral-200 bg-pneutral-50 p-8 lg:p-10"
          >
            <div>
              <h3 className="text-h2 font-semibold text-pneutral-900 font-heading">
                Why Choose <span className="text-primary-700">Our Solution?</span>
              </h3>
              <p className="mt-4 text-p4 text-pneutral-600 leading-relaxed">
                We offer a fully integrated system that ensures your lab runs smoothly. From patient management to billing and everything in between, our platform provides a comprehensive suite of tools to meet your lab&apos;s unique needs.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {pillars.map((pillar, i) => (
                <div key={pillar}>
                  <p className="mb-1.5 text-p2 font-medium text-pneutral-500">{pillar}</p>
                  <div className="relative h-2 bg-pneutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: i * 0.15 }}
                      viewport={{ once: true }}
                      className="absolute h-full bg-primary-700 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Capability tiles */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {capabilities.map((capability, i) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={
                  capability.featured
                    ? 'sm:col-span-2 relative overflow-hidden rounded-2xl border border-secondary-300 bg-linear-to-br from-secondary-50 to-primary-50 p-6 flex items-start gap-4 transition-shadow duration-300 hover:shadow-lg'
                    : 'rounded-2xl border border-pneutral-200 bg-base-white p-6 flex flex-col gap-3 transition-all duration-300 hover:border-primary-200 hover:shadow-md'
                }
              >
                {capability.featured && (
                  <span className="absolute top-4 right-4 rounded-full bg-secondary-700 px-3 py-1 text-label-l2 font-semibold text-base-white">
                    AI-Powered
                  </span>
                )}
                <div
                  className={
                    capability.featured
                      ? 'flex h-12 w-12 flex-none items-center justify-center rounded-full bg-secondary-700 text-base-white'
                      : 'flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700'
                  }
                >
                  {capability.icon}
                </div>
                <div>
                  <h4
                    className={
                      capability.featured
                        ? 'text-h5 font-semibold text-pneutral-900 font-heading pr-24'
                        : 'text-label-l4 font-semibold text-pneutral-900 font-heading'
                    }
                  >
                    {capability.title}
                  </h4>
                  <p className={capability.featured ? 'mt-1 text-p4 text-pneutral-700' : 'mt-1 text-p3 text-pneutral-600'}>
                    {capability.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}









// code written by abhishek , do not change it ................................

// 'use client'
// import { motion } from 'framer-motion'
// import { FaFlask, FaMicroscope, FaShieldAlt, FaChartLine } from 'react-icons/fa'

// export default function AboutSection() {
//   const features = [
//     "Enhanced patient-doctor integration for streamlined workflows",
//     "Automated testing processes and report generation",
//     "Comprehensive security measures to ensure privacy and compliance",
//     "Real-time analytics and performance tracking"
//   ]

//   return (
//     <div className="bg-gradient-to-b from-white to-gray-50 py-20 sm:py-24  overflow-hidden">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         {/* Decorative background elements */}
//         <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/4 opacity-10">
//           <div className="relative w-[800px] h-[800px]">
//             {[...Array(12)].map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="absolute text-gray-400"
//                 style={{
//                   top: `${Math.random() * 100}%`,
//                   left: `${Math.random() * 100}%`,
//                   fontSize: `${Math.random() * 40 + 20}px`,
//                 }}
//                 animate={{
//                   rotate: [0, 360],
//                   opacity: [0.1, 0.2, 0.1],
//                 }}
//                 transition={{
//                   duration: Math.random() * 20 + 10,
//                   repeat: Infinity,
//                   repeatType: 'loop',
//                   ease: 'linear',
//                 }}
//               >
//                 {i % 3 === 0 ? <FaFlask /> : i % 3 === 1 ? <FaMicroscope /> : <FaChartLine />}
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//           className="text-center relative z-10"
//         >
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
//             Empowering Labs with <span className="text-purple-600">Innovation</span>
//           </h2>
//           <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//             Our software solutions are designed to revolutionize lab management, ensuring efficiency, security, and seamless operations.
//           </p>
//         </motion.div>

//         <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2 relative z-10">
//           {/* Left side - Visual elements replacing image */}
//           <motion.div 
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             viewport={{ once: true }}
//             className="flex flex-col items-center justify-center space-y-8 sm:space-y-12"
//           >
//             <div className="grid grid-cols-2 gap-6">
//               {[FaFlask, FaMicroscope, FaShieldAlt, FaChartLine].map((Icon, i) => (
//                 <motion.div
//                   key={i}
//                   whileHover={{ scale: 1.05, y: -5 }}
//                   className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center"
//                 >
//                   <div className="bg-primary/10 p-4 rounded-full text-purple-600 mb-4">
//                     <Icon className="h-8 w-8" />
//                   </div>
//                   <h4 className="font-medium text-gray-900 text-center">
//                     {["Lab Tools", "Precision", "Security", "Analytics"][i]}
//                   </h4>
//                 </motion.div>
//               ))}
//             </div>
            
//             <div className="hidden sm:block w-full max-w-md mx-auto">
//               <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   whileInView={{ width: "100%" }}
//                   transition={{ duration: 1.5 }}
//                   viewport={{ once: true }}
//                   className="absolute h-full bg-gradient-to-r from-primary to-secondary"
//                 />
//               </div>
//               <div className="flex justify-between mt-2 text-sm text-gray-500">
//                 <span>Efficiency</span>
//                 <span>Accuracy</span>
//                 <span>Security</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Right side - Content */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//             viewport={{ once: true }}
//             className="text-center sm:text-left"
//           >
//             <h3 className="text-2xl font-semibold text-gray-900">
//               Why Choose <span className="text-purple-600">Our Solution?</span>
//             </h3>
//             <p className="mt-4 text-lg text-gray-500">
//               We offer a fully integrated system that ensures your lab runs smoothly. From patient management to billing and everything in between, our platform provides a comprehensive suite of tools to meet your lab&apos;s unique needs.
//             </p>
//             <ul className="mt-6 space-y-4">
//               {features.map((feature, i) => (
//                 <motion.li
//                   key={i}
//                   initial={{ opacity: 0, x: 10 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
//                   viewport={{ once: true }}
//                   className="flex items-start text-gray-500"
//                 >
//                   <span className="text-purple-600 mr-2 mt-1">✓</span>
//                   <span>{feature}</span>
//                 </motion.li>
//               ))}
//             </ul>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   )
// }