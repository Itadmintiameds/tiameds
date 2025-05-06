
'use client'
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaCheckCircle, FaFlask, FaShoppingCart } from 'react-icons/fa';
import { FaShopLock } from 'react-icons/fa6';
import FooterSection from '../components/FooterSection';

export interface Feature {
  name: string;
  description: string;
  points: string[];
  imageSrc: string;
  imageAlt: string;
  link: string;
  icon?: React.ReactNode;
}

const ProductFeaturesPage = () => {
  const features: Feature[] = [
    {
      name: 'Lab Management Software',
      description: 'Streamline your lab operations with a powerful software solution for managing samples, tests, and results.',
      points: [
        'Sample tracking and management',
        'Test scheduling and automation',
        'Result reporting and analysis',
        'Inventory and supply chain management',
        'Compliance and quality control',
        'Data security and privacy',
        'Customizable workflows and templates',
        'Integration with lab equipment and devices',
        'User-friendly interface and dashboard',
        '24/7 customer support',
        'Scalable and flexible pricing plans',
        'Cloud-based and on-premises deployment options',
      ],
      imageSrc: '/lab.png',
      imageAlt: 'Lab management software interface showing sample tracking and test results.',
      link: 'https://tiameds-lab-app.vercel.app',
      icon: <FaFlask className="w-6 h-6" />
    },
    {
      name: 'Pharma Management Software',
      description: 'Automate your billing and invoicing processes with a solution that simplifies payment collection and tracking.',
      points: [
        'Invoice generation and customization',
        'Payment processing and reminders',
        'Recurring billing and subscriptions',
        'Client and customer management',
        'Financial reporting and analytics',
        'Tax calculation and reporting',
        'Integration with accounting software',
        'User-friendly interface and dashboard',
        '24/7 customer support',
        'Scalable and flexible pricing plans',
        'Cloud-based and on-premises deployment options',
      ],
      imageSrc: '/pharma.png',
      imageAlt: 'Pharma management software interface showing invoice tracking.',
      link: 'https://pharma-test-env.tiameds.ai/login',
      icon: <FaShopLock className="w-6 h-6" />
    },
    {
      name: 'Pharma E-Commerce Platform',
      description: 'Launch and grow your online store with a comprehensive ecommerce platform that offers a range of features and tools.',
      points: [
        'Product catalog and inventory management',
        'Order processing and fulfillment',
        'Payment gateway integration',
        'Customer relationship management',
        'Marketing and promotional tools',
        'Analytics and reporting',
        'Mobile-responsive design',
        'SEO optimization',
        'Security and fraud prevention',
        'Scalable and flexible pricing plans',
        '24/7 customer support',
        'Cloud-based and on-premises deployment options',
      ],
      imageSrc: '/cross-beding.png',
      imageAlt: 'Ecommerce platform interface showing online store management.',
      link: '',
      icon: <FaShoppingCart className="w-6 h-6" />
    },
  ];

  return (
    <>
      <div className="relative bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24 overflow-hidden">
        {/* Interactive Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1" fill="#3b82f6" fillOpacity="0.2" />
                <path d="M40 0 V80 M0 40 H80" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {features.map((_, i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx={100 + (i * 300)}
                cy={200 + (i * 150)}
                r={20}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                animate={{
                  r: [20, 40, 20],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 mb-4">
              <span className="text-sm font-medium text-primary">PROFESSIONAL SOLUTIONS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              <span className="block">Transform Your Business With</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Specialized Software
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed to optimize your operations and drive growth.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-8 sm:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-300"></div>

                <div className="relative bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-100 overflow-hidden h-full">
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Image Side */}
                    <div className="lg:w-1/2 h-64 sm:h-80 lg:h-auto relative overflow-hidden">

                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        fill
                        className="object-fit object-center transition-transform duration-500 group-hover:scale-10 scale-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col">
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary text-white mb-4 sm:mb-6`}>
                        {feature.icon}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.name}</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{feature.description}</p>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {feature.points.slice(0, 4).map((point) => (
                          <div key={point} className="flex items-start">
                            <FaCheckCircle className="text-primary mt-0.5 mr-2 flex-shrink-0 text-sm sm:text-base" />
                            <span className="text-gray-700 text-xs sm:text-sm">{point}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        {
                          feature.link && (
                            <Link
                              href={feature.link}
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-4 sm:px-5 py-2 sm:py-3 text-white font-medium shadow hover:shadow-lg transition-all group"
                            >
                              <span>Explore {feature.name.split(' ')[0]}</span>
                              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  )
}

export default ProductFeaturesPage