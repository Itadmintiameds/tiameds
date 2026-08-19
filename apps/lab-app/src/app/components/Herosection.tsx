'use client'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const highlights = [
  { label: 'AI-assisted report insights', featured: true },
  { label: 'Real-time sample tracking', featured: false },
  { label: 'Secure role-based access', featured: false },
]

export default function Herosection() {
  return (
    <div className="relative isolate overflow-hidden bg-base-white min-h-screen flex items-center">
      {/* Mesh gradient backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-16rem] h-168 w-2xl -translate-x-[65%] rounded-full bg-primary-100/60 blur-[130px]" />
        <div className="absolute -right-40 -top-16 h-136 w-136 rounded-full bg-secondary-100/50 blur-[120px]" />
        <div className="absolute -bottom-56 left-1/3 h-120 w-120 rounded-full bg-primary-50/50 blur-[120px]" />
      </div>

      {/* Dot grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[48rem] opacity-30"
        style={{
          backgroundImage: 'radial-gradient(var(--pneutral-200) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-primary-200 bg-primary-50/80 px-5 py-2 shadow-xsm transition-all duration-300 hover:border-primary-300 hover:bg-primary-100/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-600 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
                </span>
                <span className="text-label-l3 font-semibold text-primary-800">
                  Trusted by modern diagnostic labs
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-50 px-5 py-2 shadow-xsm">
                <span className="text-base leading-none">✨</span>
                <span className="text-label-l3 font-semibold text-secondary-800">
                  Now with AI-assisted reports
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-heading mt-7 text-h1 font-bold leading-[1.1] tracking-tight text-pneutral-900 sm:text-display-md lg:text-display-lg">
              Run your lab on one{' '}
              <span className="relative inline-block text-primary-700">
                AI-powered platform
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-p4 text-pneutral-600 sm:text-p5 leading-relaxed mx-auto lg:mx-0">
              Every report comes with{' '}
              <span className="font-semibold text-primary-700">AI-generated interpretation and insights</span>{' '}
              — on top of full patient intake, sample tracking, billing, and staff management in
              one place.
            </p>

            {/* Highlights */}
            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              {highlights.map((item) => (
                <li
                  key={item.label}
                  className={
                    item.featured
                      ? 'inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-50 px-4 py-1.5 text-label-l3 font-semibold text-secondary-800 shadow-xsm'
                      : 'inline-flex items-center gap-2 rounded-full bg-pneutral-50 border border-pneutral-100 px-4 py-1.5 text-label-l3 font-medium text-pneutral-700'
                  }
                >
                  {item.featured ? (
                    <span className="text-base leading-none">✨</span>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 flex-none text-success-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {item.label}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center lg:justify-start">
              <Link
                href="/user-login"
                className="group relative w-full sm:w-auto rounded-lg bg-primary-700 px-12 py-3 text-p3 font-semibold text-base-white shadow-sm transition-all duration-300 hover:bg-primary-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Login
                  <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              {/* <Link
                href="/schedule-demo"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border-2 border-pneutral-200 bg-base-white px-12 py-3 text-p3 font-semibold text-primary-700 transition-all duration-300 hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm"
              >
                <span>Request Demo</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link> */}
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            {/* Subtle glow behind image */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-xxlg bg-primary-100/40 blur-2xl"
            />

            {/* Image container */}
            <div className="relative overflow-hidden rounded-xlg border border-pneutral-200 bg-base-white shadow-xlg">
              {/* Window controls */}
              <div className="flex items-center gap-2 border-b border-pneutral-200 bg-pneutral-50 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-warning-500/80" />
                <span className="h-3 w-3 rounded-full bg-danger-500/80" />
                <span className="h-3 w-3 rounded-full bg-success-400/80" />
                <span className="ml-2 text-label-l2 font-medium text-pneutral-400">tiamed · Dashboard</span>
              </div>

              {/* Image */}
              <div className="overflow-hidden">
                <Image
                  alt="App screenshot"
                  src="/screenshort.png"
                  width={2432}
                  height={1442}
                  priority
                  className="w-full transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Floating status chip - AI insight (top right, lead callout) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -top-6 -right-4 hidden sm:flex items-center gap-2 rounded-lg border border-secondary-300 bg-base-white px-4 py-2.5 shadow-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                ✨
              </span>
              <div className="leading-tight">
                <p className="text-label-l3 font-semibold text-pneutral-900">AI insight generated</p>
                <p className="text-label-l2 text-pneutral-500">Interpretation drafted instantly</p>
              </div>
            </motion.div>

            {/* Floating status chip - bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="absolute -bottom-5 -left-4 hidden sm:flex items-center gap-2 rounded-lg border border-pneutral-200 bg-base-white px-4 py-2.5 shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                🧪
              </span>
              <div className="leading-tight">
                <p className="text-label-l3 font-semibold text-pneutral-900">Sample collected</p>
                <p className="text-label-l2 text-pneutral-500">Moved to processing</p>
              </div>
            </motion.div>

            {/* Floating status chip - report ready */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute top-1/2 -right-6 hidden lg:flex -translate-y-1/2 items-center gap-2 rounded-lg border border-pneutral-200 bg-base-white px-4 py-2.5 shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 text-success-700">
                ✓
              </span>
              <div className="leading-tight">
                <p className="text-label-l3 font-semibold text-pneutral-900">Report ready</p>
                <p className="text-label-l2 text-pneutral-500">Sent to patient</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}












// code written by abhishek ..........do not delete this ......................

// import { ChevronRightIcon } from '@heroicons/react/20/solid'
// import Image from 'next/image'
// import Link from 'next/link'

// export default function Herosection() {
//   return (
//     <div className="relative isolate overflow-hidden bg-white">
//       {/* Background with clip-path and gradient with animation */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-flow"
//         />
//       </div>

//       <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:mt-40">
//         <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0 lg:pt-8">
//           <Image
//             alt="tiamed logo"
//             src="/finallogo.svg"
//             width={140}
//             height={80}
//             className="h-11 w-auto"
//           />
//           {/* <p className="text-gray-500 italic mb-4">
//             &quot;Innovating Today, Shaping Tomorrow!&quot;
//           </p> */}

//           <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl animate-slide-in">
//             Simplify Your <span className="text-purple-600">Lab Operations</span>
//           </h1>

//           <p className="mt-8 text-pretty text-lg font-medium text-gray-600 sm:text-xl/8 animate-fade-in">
//             Manage <span className="text-purple-600 font-semibold">patient data</span>, automate workflows, and generate reports seamlessly with our comprehensive lab management software.
//           </p>

//           <div className="mt-10 flex items-center gap-x-6">
//             <Link
//               href="/user-login"
//               className="rounded-md bg-gradient-to-r from-purple-600 to-purple-800 px-12 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600  transition-all duration-300"
//             >
//               Login
//             </Link>
//             <Link
//               href="/schedule-demo"
//               className="text-sm font-semibold leading-6 text-purple-600 hover:text-purple-800 transition-colors duration-300 flex items-center"
//             >
//               Request Demo <ChevronRightIcon className="h-5 w-5 ml-1" />
//             </Link>
//           </div>
//         </div>

//         {/* Image Section */}
//         <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
//           <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
//             <div className="-m-2 rounded-xl bg-purple-50/50 p-2 ring-1 ring-inset ring-purple-100 lg:-m-4 lg:rounded-2xl lg:p-4">
//                              <Image
//                  alt="App screenshot"
//                  src="/screenshort.png"
//                  width={2432}
//                  height={1442}
//                  className="w-[76rem] rounded-md shadow-2xl ring-1 ring-purple-200"
//                />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }