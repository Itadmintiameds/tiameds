'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary-100 py-24 lg:py-32">

      {/* Decorative Background */}
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="overflow-hidden rounded-xxlg bg-base-white shadow-lg"
        >
          <div className="grid lg:grid-cols-2">

            {/* Left */}
            <div className="bg-primary-800 p-10 lg:p-16 text-base-white flex flex-col justify-center">

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-700 px-4 py-2">

                <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse"></span>

                <span className="text-label-l3 font-semibold">
                  PILOT PROGRAM
                </span>

              </div>

              <h2 className="mt-8 font-heading font-bold text-h2 lg:text-display-sm leading-tight">
                Currently in
                <br />
                Testing Phase
              </h2>

              <p className="mt-6 text-p5 text-primary-100 leading-8 font-body">
                Be among the first to experience our lab management
                solution with exclusive early access benefits and
                dedicated support.
              </p>

            </div>

            {/* Right */}
            <div className="bg-base-white p-10 lg:p-16 flex flex-col justify-center">

              <div className="space-y-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
                    🧪
                  </div>

                  <div>
                    <h3 className="text-label-l5 font-heading font-semibold text-pneutral-900">
                      Exclusive Early Access
                    </h3>

                    <p className="mt-2 text-p4 text-pneutral-600">
                      Get priority access before the official launch.
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-2xl">
                    🤝
                  </div>

                  <div>
                    <h3 className="text-label-l5 font-heading font-semibold text-pneutral-900">
                      Dedicated Support
                    </h3>

                    <p className="mt-2 text-p4 text-pneutral-600">
                      Work closely with our team while shaping the product.
                    </p>

                  </div>

                </div>

              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: .98 }}
                className="mt-10"
              >

                <Link
                  href="/schedule-demo"
                  className="inline-flex items-center gap-3 rounded-lg bg-primary-700 px-8 py-4 text-label-l4 font-semibold text-base-white shadow-md transition-all hover:bg-primary-800"
                >
                  Schedule Demo

                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.3,
                    }}
                  >
                    →
                  </motion.span>

                </Link>

              </motion.div>

              <p className="mt-8 text-p4 text-pneutral-600">
                Limited spots available for our testing program.

                <span className="font-semibold text-primary-700">
                  {" "}
                  Early participants will receive special pricing.
                </span>

              </p>

            </div>

          </div>
        </motion.div>

      </div>

    </section>
  )
}









// code by abhishek ........do not delete this .....................

// 'use client'
// import Link from 'next/link'
// import { motion } from 'framer-motion'

// export default function CTASection() {
//   return (
//     <div className="bg-gradient-to-r from-purple-700 to-purple-900 py-20 sm:py-24 lg:py-32 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 opacity-10">
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute text-white"
//             style={{
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//               fontSize: `${Math.random() * 40 + 20}px`,
//             }}
//             animate={{
//               y: [0, Math.random() * 40 - 20],
//               x: [0, Math.random() * 40 - 20],
//               rotate: [0, 360],
//             }}
//             transition={{
//               duration: Math.random() * 15 + 10,
//               repeat: Infinity,
//               repeatType: 'reverse',
//               ease: 'linear',
//             }}
//           >
//             {i % 2 === 0 ? '🧪' : '🔬'}
//           </motion.div>
//         ))}
//       </div>

//       <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-white relative z-10">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//           className="text-3xl font-bold sm:text-4xl"
//         >
//           Currently in Testing Phase - Join Our Pilot Program
//         </motion.h2>
        
//         <motion.p
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           viewport={{ once: true }}
//           className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto"
//         >
//           Be among the first to experience our lab management solution with exclusive early access benefits and dedicated support.
//         </motion.p>

//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           viewport={{ once: true }}
//           className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
//         >
//           {/* <Link
//             href="/apply-for-pilot"
//             className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 sm:px-12 sm:py-3 text-sm font-semibold text-purple-600 shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl"
//           >
//             Apply for Pilot Access
//             <motion.span 
//               className="ml-2"
//               animate={{ x: [0, 4, 0] }}
//               transition={{ repeat: Infinity, duration: 1.5 }}
//             >
//               →
//             </motion.span>
//           </Link> */}
          
//           <Link
//             href="/schedule-demo"
//             className="inline-flex items-center justify-center rounded-md px-8 py-3 sm:px-12 sm:py-3 text-sm font-semibold text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300"
//           >
//             Schedule Demo
//           </Link>
//         </motion.div>

//         <motion.p
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.6 }}
//           viewport={{ once: true }}
//           className="mt-8 text-sm text-purple-200"
//         >
//           Limited spots available for our testing program. Early participants will receive special pricing.
//         </motion.p>
//       </div>
//     </div>
//   )
// }