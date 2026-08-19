'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const faqs = [
  {
    question: "Does the platform include AI-powered reports?",
    answer: "Yes. Every lab report can include AI-generated interpretation and insights, helping your team review and finalize results faster and with more confidence.",
    featured: true,
  },
  {
    question: "Can I manage multiple labs or branches from one account?",
    answer: "Yes. TiaMeds is built multi-tenant from the ground up — you can create and switch between multiple labs from a single login, with patients, samples, tests, and billing kept isolated per lab."
  },
  {
    question: "How does patient and visit management work?",
    answer: "Each patient record can have multiple visits, with tests, packages, doctor referrals, and billing details tracked per visit. You can search patients instantly, view their full visit history, and manage cancellations or due payments from one dashboard."
  },
  {
    question: "How are samples tracked through the lab?",
    answer: "Samples are tracked per lab from collection through completion — you can view pending samples, mark them collected, update their status, and keep the sample queue isolated to each lab so nothing gets mixed up across branches."
  },
  {
    question: "Can I customize test catalogs and reference ranges?",
    answer: "Yes. You can build out your own test catalog with pricing, and configure reference ranges by age and gender for each test — including bulk import/export via CSV so you don't have to enter ranges one by one."
  },
  {
    question: "How are lab reports generated ?",
    answer: "Reports are generated from structured test results, can include your lab's letterhead and signature, and are exportable as PDFs."
  },
  {
    question: "Does the platform handle billing and insurance?",
    answer: "Yes. Billing is tracked per visit with support for partial payments, multiple payment methods, and due-payment tracking, and you can manage insurance providers linked to patient visits."
  },
  {
    question: "Can I manage doctors and staff/technicians?",
    answer: "Yes. You can maintain a list of referring doctors for patient visits, and manage your lab's staff and technicians — including creating accounts, resetting passwords, and removing access — all scoped to your lab."
  },
  {
    question: "Does the platform support role-based access control?",
    answer: "Yes. Accounts are assigned roles — Super Admin, Admin, Technician, or Desk — and what each user can see and do (patients, billing, test settings, staff management, etc.) is restricted based on their role."
  },
  {
    question: "How secure is login and session handling?",
    answer: "Login requires OTP verification in addition to your password, sessions use short-lived tokens that refresh automatically, and you're automatically logged out after a period of inactivity to keep patient data secure."
  }
]

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="relative bg-base-white py-10 sm:py-10 lg:py-10 overflow-hidden">
      {/* Soft background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-secondary-50/60 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary-50/60 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2 shadow-xsm">
            <span className="text-label-l3 font-semibold text-primary-800">FAQ</span>
          </span>
          <h2 className="mt-5 text-display-sm font-bold text-pneutral-900 font-heading mb-4">
            Frequently Asked <span className="text-primary-700">Questions</span>
          </h2>
          <p className="text-p4 text-pneutral-600 max-w-2xl mx-auto">
            Find answers to common questions about our product.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Support callout */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-28 rounded-2xl border border-pneutral-200 bg-pneutral-50 p-8 flex flex-col gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
              💬
            </div>
            <h3 className="text-h5 font-heading font-semibold text-pneutral-900">
              Still have questions?
            </h3>
            <p className="text-p3 text-pneutral-600 leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Our team is happy to walk you
              through the platform.
            </p>
            <a
              href="/schedule-demo"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-primary-700 px-6 py-3 text-label-l3 font-semibold text-base-white shadow-sm transition-all duration-300 hover:bg-primary-800"
            >
              Contact our team
            </a>
          </motion.div>

          {/* Accordion */}
          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => {
              const isActive = activeIndex === index
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className={
                    isActive
                      ? 'rounded-xl border border-primary-300 bg-primary-50/40 px-6 transition-colors duration-300'
                      : 'rounded-xl border border-pneutral-200 bg-base-white px-6 transition-colors duration-300 hover:border-primary-200'
                  }
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex justify-between items-center gap-4 w-full text-left py-5 focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      {faq.featured && <span className="text-base leading-none">✨</span>}
                      <h3 className={`text-label-l4 font-heading font-semibold ${isActive ? 'text-primary-800' : 'text-pneutral-900'}`}>
                        {faq.question}
                      </h3>
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 flex-none text-primary-700 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isActive ? 'auto' : 0,
                      opacity: isActive ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-p3 text-pneutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}








// code by abhishek , do not delete this code .......................

// 'use client'
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { ChevronDownIcon } from '@heroicons/react/20/solid'

// export default function FAQSection() {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null)

//   const faqs = [
//     {
//       question: "How does the free trial work?",
//       answer: "You can try out all the features for free for 14 days. No credit card required, and you can cancel anytime."
//     },
//     {
//       question: "Can I integrate the software with existing systems?",
//       answer: "Yes! Our software integrates with most common lab management systems and electronic health records (EHR)."
//     },
//     {
//       question: "Do you provide customer support?",
//       answer: "We offer 24/7 customer support via chat, email, and phone. Our dedicated support team is always ready to help."
//     }
//   ]

//   const toggleFAQ = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index)
//   }

//   return (
//     <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-24 lg:py-32">
//       <div className="max-w-4xl mx-auto px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-lg text-gray-600">
//             Find answers to common questions about our product
//           </p>
//         </motion.div>

//         <div className="space-y-4">
//           {faqs.map((faq, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 10 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className="border-b border-gray-200 pb-4"
//             >
//               <button
//                 onClick={() => toggleFAQ(index)}
//                 className="flex justify-between items-center w-full text-left py-4 focus:outline-none"
//               >
//                 <h3 className={`text-lg font-medium ${activeIndex === index ? 'text-purple-600' : 'text-gray-900'}`}>
//                   {faq.question}
//                 </h3>
//                 <ChevronDownIcon 
//                   className={`h-5 w-5 text-purple-600 transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`}
//                 />
//               </button>

//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{
//                   height: activeIndex === index ? 'auto' : 0,
//                   opacity: activeIndex === index ? 1 : 0
//                 }}
//                 transition={{ duration: 0.2 }}
//                 className="overflow-hidden"
//               >
//                 <div className="pb-4">
//                   <p className="text-gray-600">
//                     {faq.answer}
//                   </p>
//                 </div>
//               </motion.div>
//             </motion.div>
//           ))}
//         </div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           viewport={{ once: true }}
//           className="mt-12 text-center"
//         >
//           <p className="text-gray-600">
//             Still have questions?{' '}
//             <a href="/schedule-demo" className="text-purple-600 font-medium hover:underline">
//               Contact our team
//             </a>
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   )
// }