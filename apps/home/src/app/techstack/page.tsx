'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiCpu, FiCloud, FiDatabase, FiShield, FiCode, FiServer,
  FiLayers, FiBarChart2, FiSmartphone, FiGlobe, 
  FiArrowRight
} from 'react-icons/fi'
import { FaRobot } from 'react-icons/fa'
import { BsShieldLock } from 'react-icons/bs'
import { AiOutlineCloudServer } from 'react-icons/ai'


const TechStackPage = () => {
  // Tech stack data
  const techCategories = [
    {
      name: "Cloud & Infrastructure",
      icon: <FiCloud className="h-6 w-6" />,
      items: ["AWS", "Google Cloud", "Azure", "Kubernetes", "Docker", "Terraform"],
      description: "Scalable, resilient cloud architectures for enterprise workloads."
    },
    {
      name: "AI & Machine Learning",
      icon: <FaRobot className="h-6 w-6" />,
      items: ["TensorFlow", "PyTorch", "OpenAI", "LangChain", "Computer Vision", "NLP"],
      description: "Intelligent systems that learn and adapt to your needs."
    },
    {
      name: "Security & Compliance",
      icon: <BsShieldLock className="h-6 w-6" />,
      items: ["Zero Trust", "OAuth 2.0", "GDPR Tools", "HIPAA Compliance", "Pen Testing", "E2E Encryption"],
      description: "Military-grade security built into every layer."
    },
    {
      name: "Frontend & UX",
      icon: <FiSmartphone className="h-6 w-6" />,
      items: ["React", "Next.js", "Flutter", "TailwindCSS", "Framer Motion", "WebAssembly"],
      description: "Pixel-perfect interfaces with buttery smooth performance."
    },
    {
      name: "Backend & Databases",
      icon: <FiServer className="h-6 w-6" />,
      items: ["Node.js", "Go", "PostgreSQL", "MongoDB", "Redis", "GraphQL"],
      description: "High-throughput systems that never sleep."
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-gray-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 24 + 12}px`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            {techCategories[Math.floor(Math.random() * techCategories.length)].icon}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 py-24 sm:py-32 lg:px-8">
        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6"
          >
            <FiLayers className="mr-2" />
            Technology Stack
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            <span className="block">Our</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Technology Arsenal
            </span>
          </h1>

          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            We leverage cutting-edge tools to build secure, scalable, and future-proof solutions.
          </p>

          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/contact"
              className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
            >
              Get Custom Solution
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </motion.div>

        {/* Tech stack grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {techCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">{category.name}</h3>
                </div>
                <p className="text-gray-600 mb-6">{category.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <span 
                      key={item} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case studies section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Powering Real-World Solutions
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              See how we've leveraged these technologies for our clients.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <FiBarChart2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Real-Time Analytics Platform</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Built for a Fortune 500 company to process 1M+ events per second.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    React
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Node.js
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Kafka
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Kubernetes
                  </span>
                </div>
                <Link 
                  href="/case-studies/analytics" 
                  className="text-primary font-medium flex items-center hover:underline"
                >
                  Read case study <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FaRobot className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">AI-Powered Customer Support</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Reduced response times by 85% for a global e-commerce platform.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Python
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    TensorFlow
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    OpenAI
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    PostgreSQL
                  </span>
                </div>
                <Link 
                  href="/case-studies/ai-support" 
                  className="text-primary font-medium flex items-center hover:underline"
                >
                  Read case study <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA section */}
        <div className="mt-32 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Build Something Amazing?
          </h2>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            Our engineers will help you select the perfect tech stack for your project.
          </p>
          <div className="mt-8 flex justify-center gap-x-6">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 text-primary font-medium shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center"
            >
              Get Started
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border-2 border-white px-6 py-3 text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechStackPage