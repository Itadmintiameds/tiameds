'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: '🧪',
    title: 'Exclusive Early Access',
    description: 'Get priority access before the official launch.',
  },
  {
    icon: '✨',
    title: 'AI-Powered Reports',
    description: 'Every report ships with AI-generated interpretation built in.',
  },
  {
    icon: '🤝',
    title: 'Dedicated Support',
    description: 'Work closely with our team while shaping the product.',
  },
]

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-900 via-primary-800 to-secondary-900 py-10 lg:py-10">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-112 w-md rounded-full bg-secondary-500/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-base-white/20 bg-base-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-label-l3 font-semibold text-base-white">PILOT PROGRAM</span>
          </div>

          <h2 className="mt-8 font-heading font-bold text-h1 lg:text-display-md leading-tight text-base-white">
            Currently in Testing Phase
          </h2>

          <p className="mt-6 text-p5 text-primary-100 leading-8 max-w-2xl mx-auto">
            Be among the first to experience our AI-assisted lab management platform,
            with exclusive early access benefits and dedicated support.
          </p>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-10 inline-block"
          >
            <Link
              href="/schedule-demo"
              className="inline-flex items-center gap-3 rounded-lg bg-base-white px-8 py-4 text-label-l4 font-semibold text-primary-800 shadow-lg transition-all hover:bg-primary-50"
            >
              Schedule Demo
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.3 }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Benefit strip */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3 text-left">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-base-white/15 bg-base-white/10 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-base-white/15"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-base-white/15 text-xl">
                {benefit.icon}
              </div>
              <h3 className="mt-4 text-label-l4 font-heading font-semibold text-base-white">
                {benefit.title}
              </h3>
              <p className="mt-1.5 text-p3 text-primary-100">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-p4 text-primary-100">
          Limited spots available for our testing program.{' '}
          <span className="font-semibold text-base-white">
            Early participants will receive special pricing.
          </span>
        </p>
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