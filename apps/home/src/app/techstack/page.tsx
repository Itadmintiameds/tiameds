'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BsShieldLock } from 'react-icons/bs'
import { FaRobot, FaCartPlus } from 'react-icons/fa'
import {
  FiArrowRight,
  FiLayers,
  FiServer,
  FiSmartphone,
  FiCloud
} from 'react-icons/fi'
import { CiShop } from "react-icons/ci"
import { GrTest } from 'react-icons/gr'
import { MdOutlineCloudDone } from "react-icons/md";
import FooterSection from '../components/FooterSection'

// Color mapping for technologies
const techColors = {
  // Cloud & Infrastructure
  "AWS": "bg-orange-100 text-orange-800",
  "Google Cloud": "bg-blue-100 text-blue-800",
  "Azure": "bg-sky-100 text-sky-800",
  "Kubernetes": "bg-indigo-100 text-indigo-800",
  "Docker": "bg-blue-100 text-blue-800",
  "Terraform": "bg-purple-100 text-purple-800",
  
  // AI & Machine Learning
  "TensorFlow": "bg-amber-100 text-amber-800",
  "PyTorch": "bg-red-100 text-red-800",
  "OpenAI": "bg-gray-100 text-gray-800",
  "LangChain": "bg-green-100 text-green-800",
  "Computer Vision": "bg-teal-100 text-teal-800",
  "NLP": "bg-emerald-100 text-emerald-800",
  
  // Security & Compliance
  "Zero Trust": "bg-gray-100 text-gray-800",
  "OAuth 2.0": "bg-blue-100 text-blue-800",
  "GDPR Tools": "bg-indigo-100 text-indigo-800",
  "HIPAA Compliance": "bg-green-100 text-green-800",
  "Pen Testing": "bg-red-100 text-red-800",
  "E2E Encryption": "bg-purple-100 text-purple-800",
  
  // Frontend & UX
  "React": "bg-blue-100 text-blue-800",
  "Next.js": "bg-gray-100 text-gray-800",
  "Flutter": "bg-sky-100 text-sky-800",
  "TailwindCSS": "bg-cyan-100 text-cyan-800",
  "Framer Motion": "bg-pink-100 text-pink-800",
  "WebAssembly": "bg-violet-100 text-violet-800",
  
  // Backend & Databases
  "Node.js": "bg-green-100 text-green-800",
  "Go": "bg-cyan-100 text-cyan-800",
  "PostgreSQL": "bg-blue-100 text-blue-800",
  "MongoDB": "bg-green-100 text-green-800",
  "Redis": "bg-red-100 text-red-800",
  "GraphQL": "bg-pink-100 text-pink-800",
  
  // Projects
  "TypeScript": "bg-blue-100 text-blue-800",
  "Spring Boot": "bg-green-100 text-green-800"
}

const techCategories = [
  {
    name: "Cloud & Infrastructure",
    icon: "FiCloud",
    items: ["AWS", "Google Cloud", "Azure", "Kubernetes", "Docker", "Terraform"],
    description: "Scalable, resilient cloud architectures for enterprise workloads."
  },
  {
    name: "AI & Machine Learning",
    icon: "FaRobot",
    items: ["TensorFlow", "PyTorch", "OpenAI", "LangChain", "Computer Vision", "NLP"],
    description: "Intelligent systems that learn and adapt to your needs."
  },
  {
    name: "Security & Compliance",
    icon: "BsShieldLock",
    items: ["Zero Trust", "OAuth 2.0", "GDPR Tools", "HIPAA Compliance", "Pen Testing", "E2E Encryption"],
    description: "Military-grade security built into every layer."
  },
  {
    name: "Frontend & UX",
    icon: "FiSmartphone",
    items: ["React", "Next.js", "Flutter", "TailwindCSS", "Framer Motion", "WebAssembly"],
    description: "Pixel-perfect interfaces with buttery smooth performance."
  },
  {
    name: "Backend & Databases",
    icon: "FiServer",
    items: ["Node.js", "Go", "PostgreSQL", "MongoDB", "Redis", "GraphQL"],
    description: "High-throughput systems that never sleep."
  }
]

const projects = [
  {
    name: "Lab Management Software",
    icon: "GrTest",
    items: ["Next.js", "TypeScript", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
    description: "Automated lab management system for a leading healthcare provider, reducing the processing time."
  },
  {
    name: "Pharma Management Software",
    icon: "CiShop",
    items: ["Next.js", "TypeScript", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
    description: "Automated inventory and sales processes for a leading pharmacy chain, increasing  and reducing errors."
  },
  {
    name: "Pharma E-Commerce Platform",
    icon: "FaCartPlus",
    items: ["Next.js", "TypeScript", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
    description: "A comprehensive Pharma E-commerce platform that streamlines the online shopping experience."
  }
]

const iconComponents = {
  MdOutlineCloudDone,
  FaRobot,
  BsShieldLock,
  FiSmartphone,
  FiServer,
  GrTest,
  CiShop,
  FaCartPlus,
  FiLayers,
  FiArrowRight,
  FiCloud
};

const AnimatedBackground = () => {
  // Generate stable keys for the animated elements
  const elements = Array.from({ length: 20 }).map((_, i) => {
    const randomCategory = techCategories[i % techCategories.length];
    const IconComponent = iconComponents[randomCategory.icon as keyof typeof iconComponents];
    
    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 24 + 12}px`,
      y: Math.random() * 100 - 50,
      x: Math.random() * 100 - 50,
      duration: Math.random() * 20 + 10,
      IconComponent,
      rotate: 360
    };
  });

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-20">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute text-gray-300"
          style={{
            top: element.top,
            left: element.left,
            fontSize: element.size,
          }}
          animate={{
            y: [0, element.y],
            x: [0, element.x],
            rotate: [0, element.rotate],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        >
          {element.IconComponent && <element.IconComponent className="h-full w-full" />}
        </motion.div>
      ))}
    </div>
  );
};

const TechStackPage = () => {
  return (
    <>
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Animated background elements - now client-only with stable values */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="container mx-auto px-6 py-16 sm:py-24 lg:px-8">
        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6"
          >
            <FiLayers className="mr-2" />
            Technology Stack
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            <span className="block">Our</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Technology Arsenal
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            We leverage cutting-edge tools to build secure, scalable, and future-proof solutions.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Custom Solution
            <FiArrowRight className="ml-2" />
          </Link>
        </motion.div>

        {/* Tech stack grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {techCategories.map((category, index) => {
            const IconComponent = iconComponents[category.icon as keyof typeof iconComponents];
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {IconComponent && <IconComponent className="h-6 w-6" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{category.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((item) => (
                      <span 
                        key={item} 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${techColors[item as keyof typeof techColors] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Case studies section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-3">
              Powering Real-World Solutions
            </h2>
            <p className="text-gray-600 text-sm">
              See how we've leveraged these technologies for our clients.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const IconComponent = iconComponents[project.icon as keyof typeof iconComponents];
              return (
                <motion.div 
                  key={project.name}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="p-5 h-full flex flex-col">
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {IconComponent && <IconComponent className="h-6 w-6" />}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">{project.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.items.map((item) => (
                        <span 
                          key={item} 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${techColors[item as keyof typeof techColors] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Compact CTA section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-center max-w-auto mx-auto">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-white/20 mb-4">
              <FiLayers className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl mb-3">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-white/90 text-sm mb-5">
              Our engineers will help you select the perfect tech stack for your project.
            </p>
            <Link
              href="/contact-for-services"
              className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-primary font-medium hover:bg-gray-100 transition-all duration-300"
            >
              Get Started
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    <FooterSection />
    </>
  )
}

export default TechStackPage