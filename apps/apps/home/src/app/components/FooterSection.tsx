'use client'
import Link from "next/link"
import { FaTwitter, FaLinkedin, FaGithub, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { motion } from 'framer-motion'

const FooterSection = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white py-16 px-6 lg:px-8 overflow-hidden">
      {/* Floating Dots */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full bg-teal-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [0, Math.random() * 20 - 10],
              x: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-800">
                Tiameds<span className="text-teal-500">.</span>
              </span>
            </Link>
            <p className="text-gray-600">
              Empowering the future of healthcare technology with reliable, scalable solutions.
            </p>
            <div className="flex space-x-5">
              {[
                { href: "#", icon: <FaTwitter />, label: "Twitter" },
                { href: "#", icon: <FaLinkedin />, label: "LinkedIn" },
                { href: "#", icon: <FaGithub />, label: "GitHub" },
              ].map((item, index) => (
                <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.icon}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Company</h3>
            <ul className="space-y-4 text-gray-600">
              {['About Us', 'Contact Us', 'Careers'].map((label, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <Link href={`/${label.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Solutions</h3>
            <ul className="space-y-4 text-gray-600">
              {['Lab Managment', 'Pharama Managment', 'Pharam Ecommerce'].map((solution, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <Link href="/product" className="hover:text-gray-900 transition-colors">
                    {solution}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Contact</h3>
            <address className="not-italic text-gray-600 space-y-4">
              <motion.div whileHover={{ x: 5 }} className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-teal-500" />
                <span>
                  #4754, Shivaji Road, NR Mohalla<br />
                  Mysore-570007, Karnataka<br />
                  India
                </span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center">
                <FaPhone className="mr-3 text-teal-500" />
                <Link href="tel:+1234567890" className="hover:text-gray-900 transition-colors">
                  +123-456-7890
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center">
                <FaEnvelope className="mr-3 text-teal-500" />
                <Link href="mailto:support@tiameds.ai" className="hover:text-gray-900 transition-colors">
                  support@tiameds.ai
                </Link>
              </motion.div>
            </address>
          </div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-200 text-center"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Tiameds Technology Private Limited. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default FooterSection
