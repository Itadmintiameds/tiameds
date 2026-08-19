'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactUsSection = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setResponseMessage('Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      setResponseMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-10 sm:py-10 lg:py-10 px-6 lg:px-8 bg-base-white overflow-hidden">
      {/* Soft background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary-50/60 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-secondary-50/60 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2 shadow-xsm">
            <span className="text-label-l3 font-semibold text-primary-800">Get In Touch</span>
          </span>
          <h2 className="mt-5 text-display-sm font-bold text-pneutral-900 font-heading">
            We&apos;d Love to <span className="text-primary-700">Hear From You</span>
          </h2>
          <p className="mt-4 text-p4 text-pneutral-600 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help. Reach out and we&apos;ll respond promptly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6 p-8 rounded-2xl border border-pneutral-200 bg-pneutral-50"
          >
            <div>
              <h3 className="text-h5 font-heading font-semibold text-pneutral-900 mb-3">Contact Information</h3>
              <p className="text-p4 text-pneutral-600 leading-relaxed">
                Whether you need support or have questions about our products, our team is ready to assist.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-p2 font-medium text-pneutral-500">Email us at</p>
                <Link href="mailto:support@tiameds.ai" className="text-p4 font-semibold text-primary-700 hover:text-primary-800">
                  support@tiameds.ai
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-base-white p-6 sm:p-8 rounded-2xl border border-pneutral-200 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-label-l3 font-medium text-pneutral-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-pneutral-200 text-pneutral-900 placeholder:text-pneutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-label-l3 font-medium text-pneutral-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-pneutral-200 text-pneutral-900 placeholder:text-pneutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-label-l3 font-medium text-pneutral-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-pneutral-200 text-pneutral-900 placeholder:text-pneutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-700 text-base-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-300 hover:bg-primary-800 hover:shadow-md disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-base-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>

              {responseMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-p3 text-center ${responseMessage.includes('successfully') ? 'text-success-600' : 'text-danger-600'}`}
                >
                  {responseMessage}
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;












// code by abhishek ........do no delete that ................

// 'use client';
// import Link from 'next/link';
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// interface FormData {
//   name: string;
//   email: string;
//   message: string;
// }

// const ContactUsSection = () => {
//   const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
//   const [loading, setLoading] = useState(false);
//   const [responseMessage, setResponseMessage] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setResponseMessage('');

//     try {
//       const response = await fetch('/api/email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         setResponseMessage('Your message has been sent successfully!');
//         setFormData({ name: '', email: '', message: '' });
//       } else {
//         setResponseMessage('Failed to send message. Please try again.');
//       }
//     } catch (error) {
//       setResponseMessage('An error occurred. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="relative py-16 px-6 lg:py-20 lg:px-8 bg-gray-50">
//       {/* Background Gradient */}
//       <div className="absolute inset-0 overflow-hidden opacity-20">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 transform rotate-6 scale-125"></div>
//       </div>

//       <div className="max-w-6xl mx-auto relative z-10">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-12"
//         >
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
//             Get In Touch
//           </h2>
//           <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//             Have questions? We&apos;re here to help. Reach out and we&apos;ll respond promptly.
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Contact Info */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2 }}
//             viewport={{ once: true }}
//             className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
//           >
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
//               <p className="text-gray-600 mb-6">
//                 Whether you need support or have questions about our products, our team is ready to assist.
//               </p>
//             </div>
            
//             <div className="space-y-4">
//               <div className="flex items-start">
//                 <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg text-purple-600">
//                   <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-500">Email us at</p>
//                   <Link href="mailto:support@tiameds.ai" className="text-base font-medium text-purple-600 hover:text-purple-700">
//                     support@tiameds.ai
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Contact Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             viewport={{ once: true }}
//             className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200"
//           >
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                   placeholder="Your name"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                   placeholder="your.email@example.com"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
//                   Your Message *
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   required
//                   rows={4}
//                   value={formData.message}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                   placeholder="How can we help you?"
//                 ></textarea>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-6 rounded-lg shadow hover:shadow-md transition-all disabled:opacity-70"
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center">
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending...
//                     </span>
//                   ) : (
//                     'Send Message'
//                   )}
//                 </button>
//               </div>

//               {responseMessage && (
//                 <motion.p 
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className={`text-sm text-center ${responseMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}
//                 >
//                   {responseMessage}
//                 </motion.p>
//               )}
//             </form>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ContactUsSection;