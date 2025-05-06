'use client';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaFlask, FaMicroscope, FaPills, FaShoppingCart } from 'react-icons/fa';
import { FiZap } from 'react-icons/fi';
import { GiMedicinePills, GiTestTubes } from 'react-icons/gi';

const DemoTrialSection = () => {
  const solutions = [
    {
      icon: <GiMedicinePills className="h-8 w-8" />,
      name: 'Pharma Management System',
      description: 'Automated inventory and order management system',
      highlight: '95% accuracy in dispensing'
    },
    {
      icon: <FaMicroscope className="h-8 w-8" />,
      name: 'Lab Automation',
      description: 'Automated lab management and reporting system',
      highlight: '3x faster reporting'
    },
    {
      icon: <FaShoppingCart className="h-8 w-8" />,
      name: 'Pharma E-Commerce',
      description: 'Secure online pharmaceutical marketplace',
      highlight: '220% sales growth'
    }
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Molecular Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-5">
        <svg viewBox="0 0 1200 800" className="w-full h-full" preserveAspectRatio="none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1200}
              cy={Math.random() * 800}
              r={1 + Math.random() * 3}
              fill="#3b82f6"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                r: [1, 3, 1]
              }}
              transition={{
                duration: 5 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={Math.random() * 1200}
              y1={Math.random() * 800}
              x2={Math.random() * 1200}
              y2={Math.random() * 800}
              stroke="#3b82f6"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{
                duration: 8 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </svg>
      </div>

      {/* Floating Pharmaceutical Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <GiTestTubes className="absolute top-1/4 left-10 text-blue-100 text-6xl animate-float-slow" />
        <FaPills className="absolute top-1/3 right-20 text-indigo-100 text-5xl animate-float" />
        <FaFlask className="absolute bottom-1/4 left-1/4 text-teal-100 text-7xl animate-float-slower" />
        <GiMedicinePills className="absolute bottom-1/3 right-1/3 text-purple-100 text-6xl animate-float" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-primary/10 mb-6"
          >
            <FiZap className="mr-2 animate-pulse text-primary" />
            <span className="text-sm font-medium text-primary">PHARMACEUTICAL INNOVATION</span>
          </motion.div>

          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            <span className="block">Advanced Digital Solutions for</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Modern Healthcare
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {/* Experience how our specialized platforms can optimize your pharmaceutical operations through a personalized demonstration. */}
            Experience how our specialized platforms can optimize your pharmaceutical and healthcare operations  through a personalized demonstration.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 justify-items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary text-white mb-6">
                  {solution.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.name}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{solution.description}</p>

                {/* <div className="mt-auto pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-primary">{solution.highlight}</p>
                </div> */}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.a
            href="/schedule-demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center justify-center px-12 py-5 overflow-hidden font-medium rounded-2xl group"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-secondary"></span>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center text-lg font-semibold text-white">
              <FaCalendarAlt className="mr-3" />
              Request Personalized Demo
              <svg
                className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.a>

          <p className="mt-6 text-gray-500">
            See how our solutions can be tailored to your specific needs
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoTrialSection;
