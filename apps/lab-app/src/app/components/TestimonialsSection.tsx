'use client'
import { motion } from 'framer-motion'
import { FaFlask, FaUserMd, FaMagic, FaShieldAlt } from 'react-icons/fa'
// import Link from 'next/link'

const valueProps = [
  {
    icon: <FaMagic className="h-7 w-7" />,
    title: "AI-Assisted Reporting",
    description: "Every report is paired with AI-generated interpretation, cutting review time without cutting corners.",
    featured: true,
  },
  {
    icon: <FaUserMd className="h-7 w-7" />,
    title: "Seamless Integration",
    description: "Connect patients, doctors, and lab technicians in one unified platform for streamlined workflows."
  },
  {
    icon: <FaFlask className="h-7 w-7" />,
    title: "Efficient Testing",
    description: "Workflows from sample collection to result delivery, reducing processing time."
  },
  {
    icon: <FaShieldAlt className="h-7 w-7" />,
    title: "Enterprise Security",
    description: "Role-based access controls keep sensitive patient data protected across every lab you run."
  }
]

export default function TestimonialsSection() {
  return (
    <section className="relative bg-base-white py-10 sm:py-10 lg:py-10 overflow-hidden">
      {/* Soft background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary-50/60 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-50/60 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2 shadow-xsm">
            <span className="text-label-l3 font-semibold text-primary-800">Why labs choose us</span>
          </span>
          <h2 className="mt-5 text-display-sm font-bold text-pneutral-900 font-heading">
            Transform Your <span className="text-primary-700">Lab Operations</span>
          </h2>
          <p className="mt-4 text-p4 text-pneutral-600 max-w-2xl mx-auto">
            What you can expect across the key areas of lab management once you switch.
          </p>
        </motion.div>

        {/* Outcome list */}
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 space-y-4"
        >
          {valueProps.map((item) => (
            <motion.div
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              whileHover={{ x: 4 }}
              className={
                item.featured
                  ? 'relative flex items-start gap-5 rounded-2xl border border-secondary-300 bg-linear-to-br from-secondary-50 to-primary-50 p-6 transition-shadow duration-300 hover:shadow-lg'
                  : 'flex items-start gap-5 rounded-2xl border border-pneutral-200 bg-base-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-md'
              }
            >
              {item.featured && (
                <span className="absolute top-4 right-4 rounded-full bg-secondary-700 px-3 py-1 text-label-l2 font-semibold text-base-white">
                  AI-Powered
                </span>
              )}
              <div
                className={
                  item.featured
                    ? 'flex h-14 w-14 flex-none items-center justify-center rounded-full bg-secondary-700 text-base-white'
                    : 'flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-100 text-primary-700'
                }
              >
                {item.icon}
              </div>
              <div>
                <h3 className={item.featured ? 'text-h5 font-heading font-semibold text-pneutral-900 pr-24' : 'text-h6 font-heading font-semibold text-pneutral-900'}>
                  {item.title}
                </h3>
                <p className={item.featured ? 'mt-1.5 text-p4 text-pneutral-700' : 'mt-1.5 text-p3 text-pneutral-600'}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-pneutral-200 bg-pneutral-50 p-8 sm:p-10 text-center"
        >
          <h3 className="text-h4 font-heading font-semibold text-pneutral-900 mb-3">
            Ready to see it in action?
          </h3>
          <p className="text-p4 text-pneutral-600 mb-6 max-w-2xl mx-auto">
            Schedule a personalized demo to discover how our platform can transform your lab workflows.
          </p>
          <Link
            href="/schedule-demo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-8 py-3 text-label-l4 font-semibold text-base-white shadow-sm transition-all duration-300 hover:bg-primary-800 hover:shadow-md"
          >
            Schedule Demo
          </Link>
        </motion.div> */}
      </div>
    </section>
  )
}










// code written by abhishek , do not delete this s....................


// "use client";
// import { useEffect, useState } from 'react';

// const TestimonialsSection = () => {
//   const initialTestimonials = [
//     {
//       name: 'John Doe',
//       position: 'CEO, HealthTech Corp',
//       testimonial:
//         'Tiameds has revolutionized our healthcare management processes. Their SaaS solutions are efficient, secure, and have drastically reduced our operational costs.',
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       name: 'Jane Smith',
//       position: 'Product Manager, MediTech Solutions',
//       testimonial:
//         'The customer support and user experience of Tiameds software are second to none. The solutions provided have simplified complex processes and improved team collaboration.',
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       name: 'Michael Johnson',
//       position: 'Director of Operations, HealthFirst',
//       testimonial:
//         'Working with Tiameds has been an absolute game-changer. Their medical software solutions have made a profound impact on our patient care and internal workflows.',
//       image: 'https://via.placeholder.com/150',
//     },
    
//   ];

//   const [testimonials, setTestimonials] = useState(initialTestimonials);

//   interface Testimonial {
//     name: string;
//     position: string;
//     testimonial: string;
//     image: string;
//   }

//   const shuffleArray = (array: Testimonial[]): Testimonial[] => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTestimonials((prevTestimonials) => shuffleArray(prevTestimonials));
//     }, 7000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="relative bg-background py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
//       >
//         <div
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//         ></div>
//       </div>

//       <div className="mx-auto max-w-4xl lg:max-w-6xl text-center">
//         <h2 className="text-2xl font-bold tracking-tight text-textdark sm:text-4xl animate-fade-in-up">
//           What Our Clients Say
//         </h2>
//         <p className="mt-4 sm:mt-6 text-base sm:text-lg text-textmuted animate-fade-in">
//           Hear from our satisfied clients who have experienced the transformation with Tiameds&apos; cutting-edge healthcare solutions.
//         </p>
//       </div>

//       <div className="mt-10 sm:mt-12 lg:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
//         {testimonials.map((testimonial, index) => (
//           <div
//             key={index}
//             className={`relative group transition-all duration-700 ease-out flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg bg-background text-textwhite hover:scale-105 ${index === 1 ? 'lg:scale-110 shadow-2xl border border-primary z-10' : 'opacity-90 hover:opacity-100'}
//               sm:rounded-xl`}
//             style={{ transformOrigin: 'center center' }}
//           >
//             <div className="absolute inset-0 transform transition-transform duration-500 ease-in-out group-hover:rotate-3 group-hover:scale-105"></div>
//             <img
//               src={testimonial.image}
//               alt={testimonial.name}
//               className={`${index === 1 ? 'w-24 h-24 sm:w-28 sm:h-28 mb-4 animate-bounce' : 'w-20 h-20 sm:w-24 sm:h-24 mb-4'}
//               rounded-full border-4 border-primary object-cover shadow-md transition-transform duration-500 group-hover:scale-110`}
//             />
//             <p className="text-sm sm:text-lg font-semibold text-textdark">{testimonial.name}</p>
//             <p className="text-xs sm:text-sm text-textdark">{testimonial.position}</p>
//             <p className="mt-2 sm:mt-4 text-xs sm:text-base text-textdark leading-relaxed">
//               {testimonial.testimonial}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default TestimonialsSection;