'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BsShieldLock } from 'react-icons/bs'
import { FaRobot } from 'react-icons/fa'
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCloud,
  FiCode,
  FiDroplet, FiPackage,
  FiServer,
  FiSmartphone,
  FiZap
} from 'react-icons/fi'
import FooterSection from '../components/FooterSection'

const TechStackPage = () => {
  // Tech stack data
  const techCategories = [
    {
      name: "Cloud & Infrastructure",
      icon: <FiCloud className="h-6 w-6" />,
      items: ["AWS", "ECS", "ECR", "ALB", "RDS PostgreSQL", "S3"],
      description: "Scalable, resilient cloud architectures for enterprise workloads.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      name: "Frontend Development",
      icon: <FiSmartphone className="h-6 w-6" />,
      items: ["Next.js", "TypeScript", "Tailwind CSS", "React Icons", "Framer Motion", "React Hook Form"],
      description: "Modern, performant user interfaces with excellent DX.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Security & Compliance",
      icon: <BsShieldLock className="h-6 w-6" />,
      items: ["HIPAA Compliance", "GDPR Tools", "OAuth 2.0", "JWT", "CSP", "Rate Limiting"],
      description: "Enterprise-grade security built into every layer.",
      gradient: "from-amber-500 to-red-600"
    },
    {
      name: "Backend & Databases",
      icon: <FiServer className="h-6 w-6" />,
      items: ["Node.js", "Express", "PostgreSQL", "Redis", "Prisma", "GraphQL"],
      description: "High-throughput systems with robust data management.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      name: "DevOps & CI/CD",
      icon: <FiCode className="h-6 w-6" />,
      items: ["GitHub Actions", "Docker", "Terraform", "AWS CDK", "Prometheus", "Grafana"],
      description: "Automated pipelines for reliable deployments.",
      gradient: "from-cyan-500 to-sky-600"
    },
    {
      name: "AI & Automation",
      icon: <FaRobot className="h-6 w-6" />,
      items: ["LLM Integration", "LangChain", "Vector DBs", "Workflow Automation", "Chatbots"],
      description: "Intelligent systems that learn and adapt.",
      gradient: "from-violet-500 to-fuchsia-600"
    }
  ]

  // Case studies data
  const caseStudies = [
    {
      title: "Laboratory Automation System",
      description: "Comprehensive software solution automating lab operations, sample tracking, and reporting for diagnostic laboratories.",
      icon: <FiDroplet className="h-8 w-8" />,
      techUsed: ["Next.js", "TypeScript", "Tailwind CSS", "AWS", "spring boot", "RDS PostgreSQL", "Redis"],
      results: [
        "Reduced manual errors by 92%",
        "Increased processing capacity by 3x",
        "Automated report generation"
      ],
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
      title: "Pharma Operations Platform",
      description: "End-to-end pharmaceutical operations management system for inventory, compliance, and workflow automation.",
      icon: <FiActivity className="h-8 w-8" />,
      techUsed: ["Next.js", "TypeScript", "Tailwind CSS", "AWS", "spring boot", "RDS PostgreSQL", "Redis"],
      results: [
        "Streamlined regulatory compliance",
        "Reduced inventory waste by 45%",
        "Improved audit readiness"
      ],
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
    },
    {
      title: "Pharma E-commerce Platform",
      description: "Secure online marketplace for pharmaceutical products with inventory integration and compliance features.",
      icon: <FiPackage className="h-8 w-8" />,
      techUsed: ["Next.js", "TypeScript", "Tailwind CSS", "AWS", "spring boot", "RDS PostgreSQL", "Redis"],
      results: [
        "Increased online sales by 220%",
        "Reduced checkout time by 65%",
        "Improved mobile conversion rate"
      ],
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
    }
  ]

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen overflow-hidden">
        {/* Floating tech elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 30 }).map((_, i) => (
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
        <div className="container mx-auto px-6 py-24 sm:py-32 lg:px-8 relative">
          {/* Hero section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 relative"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-lg mb-6"
            >
              <FiZap className="mr-2 animate-pulse" />
              Technology Stack
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <span className="block">Our</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Technology Ecosystem
              </span>
            </h1>

            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technologies with battle-tested solutions to build secure, scalable, and future-proof applications.
            </p>

            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                href="/contact-for-services"
                className="group relative rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Custom Solution
                  <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
                className="group relative overflow-hidden rounded-xl shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-90`}></div>
                <div className="relative bg-white p-0.5 h-full rounded-[11px]">
                  <div className="bg-gray-50 h-full rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${category.gradient} text-white shadow-md`}>
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 ml-4">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{category.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <span 
                          key={item} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800 shadow-sm border border-gray-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
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
              <motion.div 
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary inline-flex items-center">
                  <FiBarChart2 className="mr-2" />
                  Success Stories
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Technology in Action
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                See how we've transformed industries with our technical expertise.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-xl shadow-lg"
                >
                  <div className={`absolute inset-0 ${study.gradient} opacity-90`}></div>
                  <div className="relative bg-white p-0.5 h-full rounded-[11px]">
                    <div className="bg-gray-50 h-full rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-lg ${study.gradient} text-white shadow-md`}>
                          {study.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 ml-4">{study.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-6">{study.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">TECHNOLOGIES USED</h4>
                        <div className="flex flex-wrap gap-2">
                          {study.techUsed.map((tech) => (
                            <span 
                              key={tech} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800 shadow-sm border border-gray-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">KEY RESULTS</h4>
                        <ul className="space-y-2">
                          {study.results.map((result, i) => (
                            <li key={i} className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-32 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full"></div>
              
              <h2 className="text-3xl font-bold text-white sm:text-4xl relative z-10">
                Ready to Build Something Extraordinary?
              </h2>
              <p className="mt-4 text-white/90 max-w-2xl mx-auto relative z-10">
                Our architects will design the perfect technology stack tailored to your specific needs.
              </p>
              <div className="mt-8 flex justify-center gap-x-6 relative z-10">
                <Link
                  href="/contact-for-services"
                  className="group relative rounded-lg bg-white px-6 py-3 text-primary font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start Your Project
                    <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <FooterSection />
    </>
  )
}

export default TechStackPage