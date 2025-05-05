'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "You can try out all the features for free for 14 days. No credit card required, and you can cancel anytime."
    },
    {
      question: "Can I integrate the software with existing systems?",
      answer: "Yes! Our software integrates with most common lab management systems and electronic health records (EHR)."
    },
    {
      question: "Do you provide customer support?",
      answer: "We offer 24/7 customer support via chat, email, and phone. Our dedicated support team is always ready to help."
    }
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our product
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border-b border-gray-200 pb-4"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left py-4 focus:outline-none"
              >
                <h3 className={`text-lg font-medium ${activeIndex === index ? 'text-purple-600' : 'text-gray-900'}`}>
                  {faq.question}
                </h3>
                <ChevronDownIcon 
                  className={`h-5 w-5 text-purple-600 transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`}
                />
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: activeIndex === index ? 'auto' : 0,
                  opacity: activeIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-4">
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Still have questions?{' '}
            <a href="/schedule-demo" className="text-purple-600 font-medium hover:underline">
              Contact our team
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}