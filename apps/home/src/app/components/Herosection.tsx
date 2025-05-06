'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiOutlineCloudServer } from 'react-icons/ai'
import { BsShieldLock } from 'react-icons/bs'
import { FaRobot } from 'react-icons/fa'
import {
  FiArrowRight,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiShield,
} from 'react-icons/fi'

const techIcons = [
  { icon: <FiCpu className="h-8 w-8" />, name: 'Processing' },
  { icon: <FiCloud className="h-8 w-8" />, name: 'Cloud' },
  { icon: <FiDatabase className="h-8 w-8" />, name: 'Database' },
  { icon: <FiShield className="h-8 w-8" />, name: 'Security' },
  { icon: <FaRobot className="h-8 w-8" />, name: 'AI' },
  { icon: <AiOutlineCloudServer className="h-8 w-8" />, name: 'Server' },
  { icon: <BsShieldLock className="h-8 w-8" />, name: 'Encryption' },
]

const Herosection = () => {
  interface FloatingIcon {
    top: number
    left: number
    fontSize: number
    moveX: number
    moveY: number
    rotate: number
    duration: number
    icon: JSX.Element
  }
  
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])

  useEffect(() => {
    const icons = Array.from({ length: 15 }).map(() => {
      const top = Math.random() * 100
      const left = Math.random() * 100
      const fontSize = Math.random() * 20 + 10
      const moveY = Math.random() * 100 - 50
      const moveX = Math.random() * 100 - 50
      const rotate = 360
      const duration = Math.random() * 20 + 10
      const tech = techIcons[Math.floor(Math.random() * techIcons.length)].icon

      return {
        top,
        left,
        fontSize,
        moveX,
        moveY,
        rotate,
        duration,
        icon: tech,
      }
    })
    setFloatingIcons(icons)
  }, [])

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">

        {/* Floating tech icons (client-only) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {floatingIcons.map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-gray-200"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                fontSize: `${item.fontSize}px`,
              }}
              animate={{
                y: [0, item.moveY],
                x: [0, item.moveX],
                rotate: [0, item.rotate],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
            >
              <span className="text-sm font-medium text-primary">
                Enterprise-Grade Tech Solutions
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              <span className="block">Building the Digital</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Infrastructure
                </span>
              </span>
              <span className="block">of Tomorrow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              TiaMeds Technologies Pvt. Ltd.  delivers cutting-edge SaaS platforms and
              enterprise solutions that power businesses at scale with security,
              reliability, and innovation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/contact-for-services"
                className="relative group rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">Start Your Project</span>
                <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/techstack"
                className="flex items-center gap-2 text-gray-900 font-medium hover:text-primary transition-colors group"
              >
                Explore Our Tech Stack
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Tech stack showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-16"
            >
              <p className="text-sm text-gray-500 mb-4">
                TRUSTED BY INNOVATORS WORLDWIDE
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                {techIcons.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ y: -5, scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      {item.icon}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-500">
                      {item.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Herosection
