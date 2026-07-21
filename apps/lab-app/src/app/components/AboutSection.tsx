'use client'
import { motion } from 'framer-motion'
import { FaFlask, FaMicroscope, FaShieldAlt, FaChartLine } from 'react-icons/fa'

export default function AboutSection() {
  const features = [
    "Enhanced patient-doctor integration for streamlined workflows",
    "Automated testing processes and report generation",
    "Comprehensive security measures to ensure privacy and compliance",
    "Real-time analytics and performance tracking"
  ]

  return (
    <section className="bg-base-white py-20 sm:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header - Different styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
          </div>
          <h2 className="text-display-sm font-bold text-pneutral-900 font-heading mb-4">
            Empowering Labs with <span className="text-primary-700">Innovation</span>
          </h2>
          <p className="text-p4 text-pneutral-600 max-w-3xl mx-auto">
            Our software solutions are designed to revolutionize lab management, ensuring efficiency, security, and seamless operations.
          </p>
        </motion.div>

        {/* Zigzag / Alternating Layout */}
        <div className="space-y-20">
          {/* Row 1 - Image/Icon Grid left, Content right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                {[FaFlask, FaMicroscope, FaShieldAlt, FaChartLine].map((Icon, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-pneutral-50 p-6 rounded-xl border border-pneutral-200 hover:border-primary-200 transition-all duration-300 hover:shadow-md text-center group"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-primary-700 group-hover:text-base-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h4 className="text-label-l3 font-semibold text-pneutral-900 font-heading">
                      {["Lab Tools", "Precision", "Security", "Analytics"][i]}
                    </h4>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h3 className="text-h2 font-semibold text-pneutral-900 font-heading">
                Why Choose <span className="text-primary-700">Our Solution?</span>
              </h3>
              <p className="mt-4 text-p4 text-pneutral-600 leading-relaxed">
                We offer a fully integrated system that ensures your lab runs smoothly. From patient management to billing and everything in between, our platform provides a comprehensive suite of tools to meet your lab&apos;s unique needs.
              </p>
            </motion.div>
          </div>

          {/* Row 2 - Full width feature list with cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-pneutral-50 rounded-2xl border border-pneutral-200 p-8 lg:p-12 hover:border-primary-200 transition-all duration-300 hover:shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 bg-base-white p-4 rounded-xl border border-pneutral-100 hover:border-primary-200 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <p className="text-p3 text-pneutral-600 leading-relaxed">{feature}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Row 3 - Progress bar section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="relative h-2 bg-pneutral-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true }}
                className="absolute h-full bg-primary-700 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-3 text-p2 text-pneutral-500">
              <span>Efficiency</span>
              <span>Accuracy</span>
              <span>Security</span>
            </div>
          </motion.div>
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