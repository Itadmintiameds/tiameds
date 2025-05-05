'use client'
import { FaCheckCircle, FaArrowRight, FaFlask, FaFileInvoiceDollar, FaShoppingCart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiZap } from 'react-icons/fi'

const ProductFeaturesPage = () => {
  const features = [

    
    {
      name: 'Lab Management Software',
      icon: <FaFlask className="text-3xl" />,
      description: 'Streamline your lab operations with our powerful software solution designed for precision and efficiency in sample management and test processing.',
      points: [
        'End-to-end sample tracking',
        'Automated test scheduling',
        'Real-time result analysis',
        'Smart inventory management',
        'Regulatory compliance tools',
        'Advanced data security',
        'Custom workflow designer',
        'Equipment integration',
        'Interactive dashboards',
        '24/7 expert support'
      ],
      imageSrc: '/lab.png',
      link: 'https://lab-test-env.tiameds.ai/',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Billing & Invoicing',
      icon: <FaFileInvoiceDollar className="text-3xl" />,
      description: 'Revolutionize your financial operations with our intelligent billing platform that automates invoicing and payment collection.',
      points: [
        'Smart invoice generation',
        'Automated payment reminders',
        'Subscription management',
        'Client portal',
        'Financial analytics',
        'Tax automation',
        'Accounting sync',
        'Role-based access',
        'Audit trails',
        'Multi-currency support'
      ],
      imageSrc: '/pharma.png',
      link: 'https://pharma-test-env.tiameds.ai/login',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Ecommerce Platform',
      icon: <FaShoppingCart className="text-3xl" />,
      description: 'Launch and scale your digital storefront with our all-in-one commerce solution built for growth and conversion.',
      points: [
        'AI-powered catalog',
        'Omnichannel fulfillment',
        'Smart checkout',
        'Customer segmentation',
        'Personalized marketing',
        'Predictive analytics',
        'Progressive web app',
        'SEO optimization',
        'Fraud prevention',
        'Scalable infrastructure'
      ],
      imageSrc: '/ecommerce-platform.png',
      link: '#',
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white min-h-screen overflow-hidden">
      {/* Animated background elements */}
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
            {i % 3 === 0 ? <FaFlask /> : i % 3 === 1 ? <FaFileInvoiceDollar /> : <FaShoppingCart />}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 py-24 sm:py-32 lg:px-8 relative">
        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-lg mb-6"
          >
            <FiZap className="mr-2 animate-pulse" />
            BUSINESS SOLUTIONS
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            <span className="block">Industry-Specific</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Software Solutions
            </span>
          </h1>

          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Tailored applications designed to solve your unique business challenges with precision and efficiency.
          </p>
        </motion.div>

        {/* Feature showcase */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative group ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}
            >
              <div className="hidden lg:block absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* Image container */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 w-full bg-white flex items-center justify-center">
                    <motion.img
                      src={feature.imageSrc}
                      alt={feature.name}
                      className="max-h-full max-w-full object-contain"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Text content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 text-white ${feature.gradient ? `bg-gradient-to-br ${feature.gradient}` : 'bg-primary'}`}>
                    {feature.icon}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.name}</h2>
                  <p className="text-lg text-gray-600 mb-8">{feature.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {feature.points.map((point, i) => (
                      <div key={i} className="flex items-start">
                        <FaCheckCircle className={`flex-shrink-0 mt-1 mr-3 text-primary`} />
                        <span className="text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={feature.link}
                    className={`inline-flex items-center rounded-lg px-6 py-3.5 text-white font-medium shadow-lg hover:shadow-xl transition-all ${feature.gradient ? `bg-gradient-to-r ${feature.gradient}` : 'bg-primary'}`}
                  >
                    <span>Explore {feature.name.split(' ')[0]}</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2"
                    >
                      <FaArrowRight />
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-32 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25"></div>
          <div className="relative bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full"></div>
            
            <h2 className="text-3xl font-bold text-white sm:text-4xl relative z-10">
              Need a Custom Solution?
            </h2>
            <p className="mt-4 text-white/90 max-w-2xl mx-auto relative z-10">
              We specialize in building tailored software for unique business requirements.
            </p>
            <div className="mt-8 flex justify-center gap-x-6 relative z-10">
              <Link
                href="/contact-for-services"
                className="group relative rounded-lg bg-white px-6 py-3 text-primary font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Request Consultation
                  <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductFeaturesPage
