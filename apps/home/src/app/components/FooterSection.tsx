'use client'
import { motion } from 'framer-motion'
import Link from "next/link"
import Image from "next/image"
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaServer,
  FaTwitter
} from 'react-icons/fa'
import {
  GiNetworkBars,
  GiProcessor
} from 'react-icons/gi'

const FooterSection = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white py-20 px-6 lg:px-8 overflow-hidden">
      {/* Circuit Board Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-10">
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M100,100 L1100,100 L1100,700 L100,700 Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-blue-200"
            fill="none"
          />
          <rect x="300" y="300" width="600" height="200"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-purple-200"
            fill="none"
          />
          <circle cx="600" cy="400" r="150"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-teal-200"
            fill="none"
          />
        </svg>
      </div>

      {/* Floating Tech Icons */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <GiProcessor className="absolute top-1/4 left-10 text-blue-100 text-6xl opacity-20" />
        <FaServer className="absolute top-1/3 right-20 text-violet-100 text-5xl opacity-20" />
        <GiNetworkBars className="absolute bottom-1/4 left-1/4 text-teal-100 text-7xl opacity-20" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <Image
                alt="/TiamedsLogo.svg"
                src="/TiamedsLogo.svg"
                className="h-12 w-auto transition-transform duration-300 scale-120"
                width={120}
                height={120}
              />
            </Link>
            <p className="text-gray-600">
              Enterprise-grade technology solutions for digital transformation.
            </p>
            <div className="flex space-x-6">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Company</h3>
            <div className="space-y-4">
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
                  About Us
                </Link>
              </motion.p>
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </motion.p>
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/careers" className="text-gray-600 hover:text-primary transition-colors">
                  Careers
                </Link>
              </motion.p>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Solutions</h3>
            <ul className="space-y-4">
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/product" className="text-gray-600 hover:text-primary transition-colors">

                  Pharma E-Commerce Platform
                </Link>
              </motion.p>
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/product" className="text-gray-600 hover:text-primary transition-colors">
                  Lab Management Softwere
                </Link>
              </motion.p>
              <motion.p whileHover={{ x: 5 }}>
                <Link href="/product" className="text-gray-600 hover:text-primary transition-colors">
                  Pharma Managment Softwere
                </Link>
              </motion.p>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact</h3>
            <address className="not-italic text-gray-600 space-y-4">
              <motion.div whileHover={{ x: 5 }} className="flex items-start">
                <FaMapMarkerAlt className="flex-shrink-0 mt-1 mr-3 text-primary" />
                <span className="hover:text-primary transition-colors">
                  #4754, Shivaji Road, NR Mohalla <br />
                  Mysore-570007, Karnataka <br />
                  India
                </span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center">
                <FaPhone className="flex-shrink-0 mr-3 text-primary" />
                <Link href="tel:7678325053" className="hover:text-primary transition-colors">
                  +91 7678325053
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center">
                <FaEnvelope className="flex-shrink-0 mr-3 text-primary" />
                <Link href="mailto:info@technova.com" className="hover:text-primary transition-colors">
                  support@tiameds.ai
                </Link>
              </motion.div>
            </address>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-200 text-center"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TiaMeds Technology Private Limited. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default FooterSection
