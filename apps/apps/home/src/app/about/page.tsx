'use client'
import { motion } from 'framer-motion'
import { FiZap, FiShield, FiCloud, FiCode, FiServer, FiBarChart2 } from 'react-icons/fi'
import FooterSection from '../components/FooterSection'

const AboutPage = () => {
  const values = [
    {
      name: 'Innovation',
      icon: <FiZap className="h-6 w-6" />,
      description: 'We push boundaries to deliver cutting-edge healthcare technology solutions that transform patient care.',
    },
    {
      name: 'Integrity',
      icon: <FiShield className="h-6 w-6" />,
      description: 'We maintain the highest ethical standards in all our products and client relationships.',
    },
    {
      name: 'Excellence',
      icon: <FiBarChart2 className="h-6 w-6" />,
      description: 'We strive for perfection in every solution we deliver, ensuring exceptional quality and performance.',
    }
  ]

  const services = [
    {
      name: 'Cloud Solutions',
      icon: <FiCloud className="h-8 w-8" />,
      description: 'Secure, HIPAA-compliant cloud infrastructure for healthcare applications',
      features: ['AWS hosting', 'Auto-scaling', 'Disaster recovery', '99.9% uptime']
    },
    {
      name: 'Software Development',
      icon: <FiCode className="h-8 w-8" />,
      description: 'Custom healthcare software tailored to your specific needs',
      features: ['Web & mobile apps', 'EHR integrations', 'AI-powered features', 'User-centered design']
    },
    {
      name: 'Data Management',
      icon: <FiServer className="h-8 w-8" />,
      description: 'Secure handling and analysis of sensitive healthcare data',
      features: ['HL7/FHIR compliant', 'Real-time analytics', 'Data encryption', 'Automated backups']
    }
  ]

  const products = [
    {
      name: 'Tiameds LabOS',
      description: 'Comprehensive laboratory information management system',
      status: 'Available Now',
      highlights: [
        'Sample tracking automation',
        'Real-time result analysis',
        'Equipment integration',
        'Regulatory compliance tools'
      ]
    },
    {
      name: 'PharmaSuite',
      description: 'End-to-end pharmacy management platform',
      status: 'In Development',
      highlights: [
        'Inventory optimization',
        'Prescription verification',
        'Patient portal',
        'Billing integration'
      ]
    },
    {
      name: 'MediConnect',
      description: 'Interoperability platform for healthcare providers',
      status: 'Coming Soon',
      highlights: [
        'Secure data exchange',
        'Unified patient records',
        'Telemedicine integration',
        'Analytics dashboard'
      ]
    }
  ]

  return (
    <div className="bg-white">
      <main className="isolate">
        {/* Hero section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 mb-6"
              >
                <FiZap className="mr-2 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">ABOUT TIAMEDS</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
              >
                Transforming Healthcare Through Technology
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                Tiameds Technology is a healthcare technology company specializing in SaaS solutions and custom software development for the medical industry. We combine innovative technology with deep healthcare expertise to deliver products and services that improve patient outcomes and operational efficiency.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Mission section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-24 sm:mt-32">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
                <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
                  <p className="text-xl leading-8 text-gray-600">
                    To revolutionize healthcare delivery through innovative technology solutions that empower providers, streamline operations, and enhance patient care. We believe technology should remove barriers in healthcare, not create them.
                  </p>
                  <p className="mt-10 max-w-xl text-base leading-7 text-gray-700">
                    Founded by healthcare professionals and technologists, Tiameds bridges the gap between medicine and technology. Our team brings together decades of combined experience in both fields to create solutions that actually work in real clinical environments.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Services section */}
        <div className="mt-32 sm:mt-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Our Services
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Custom technology solutions designed specifically for healthcare organizations
                </p>
              </motion.div>

              <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/10 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                        {service.icon}
                      </div>
                      <h3 className="ml-4 text-xl font-semibold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <ul className="space-y-3 mt-auto">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div className="mt-32 sm:mt-40 bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl lg:mx-0"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Products
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Innovative SaaS solutions developed specifically for healthcare challenges
              </p>
            </motion.div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {products.map((product, index) => (
                <motion.article
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex max-w-xl flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/10 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-xl font-semibold leading-7 text-gray-900">
                      {product.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {product.status}
                    </span>
                  </div>
                  <p className="mt-4 text-gray-600">{product.description}</p>
                  <ul className="mt-6 space-y-3">
                    {product.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
          </div>
        </div>

        {/* Values section */}
        <div className="mt-32 sm:mt-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl lg:mx-0"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Values
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                The principles that guide everything we do at Tiameds Technology
              </p>
            </motion.div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/10 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                      {value.icon}
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-900">{value.name}</h3>
                  </div>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-32 sm:mt-40 bg-gradient-to-r from-primary to-secondary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Ready to transform your healthcare technology?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90"
              >
                Whether you need a custom solution or want to learn more about our products, our team is ready to help.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <a
                  href="/contact"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Contact Us
                </a>
                <a href="/products" className="text-sm font-semibold leading-6 text-white">
                  Explore Products <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  )
}

export default AboutPage