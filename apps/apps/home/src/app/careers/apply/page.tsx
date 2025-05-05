
// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'


// interface JobListing {
//   id: number
//   title: string
//   location: string
//   type: string
//   description: string
//   techStack: string
//   salary: string
//   experience: string
//   applyLink: string
// }

// const jobListings = [
//   {
//     id: 1,
//     title: 'Frontend Developer',
//     location: 'Remote',
//     type: 'Full-time',
//     description:
//       'We are looking for a talented Frontend Developer to build intuitive user interfaces using React and modern web technologies.',
//     techStack: 'React, JavaScript, CSS, HTML, Redux',
//     salary: '₹8-12 LPA',
//     experience: '3-5 years',
//     applyLink: '/apply/frontend-developer',
//   },
//   {
//     id: 2,
//     title: 'Backend Engineer',
//     location: 'Remote',
//     type: 'Full-time',
//     description:
//       'Join our backend team to design and implement scalable APIs and database solutions for our SaaS products.',
//     techStack: 'Node.js, Express, MongoDB, AWS, Docker',
//     salary: '₹10-15 LPA',
//     experience: '3-6 years',
//     applyLink: '/apply/backend-engineer',
//   },
//   {
//     id: 3,
//     title: 'Product Manager',
//     location: 'Bangalore, India',
//     type: 'Full-time',
//     description:
//       'We need a Product Manager to define and drive product strategy, ensuring alignment with business objectives.',
//     techStack: 'Product Management, Agile, Jira, Scrum',
//     salary: '₹15-20 LPA',
//     experience: '5+ years',
//     applyLink: '/apply/product-manager',
//   },
//   // Add more jobs as needed...
// ]

// const ApplyPage = () => {
//   const [showModal, setShowModal] = useState(false)
//   const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const jobsPerPage = 2

//   const totalPages = Math.ceil(jobListings.length / jobsPerPage)
//   const indexOfLastJob = currentPage * jobsPerPage
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage
//   const currentJobs = jobListings.slice(indexOfFirstJob, indexOfLastJob)

//   const handleApplyClick = (job: JobListing) => {

//     setSelectedJob(job)
//     setShowModal(true)
//   }

//   const handleCloseModal = () => {
//     setShowModal(false)
//     setSelectedJob(null)
//   }

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1)
//     }
//   }

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1)
//     }
//   }

//   return (
//     <div className="bg-white">
//       <div className="relative isolate px-6 pt-14 lg:px-8">
//         <div
//           aria-hidden="true"
//           className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//         >
//           <div
//             style={{
//               clipPath:
//                 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//             }}
//             className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//           />
//         </div>

//         <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-28 animate-fade-in-up">
//           <div className="text-center">
//             <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl animate-slide-in">
//               Explore Open Positions
//             </h1>
//             <p className="mt-8 text-lg font-medium text-gray-500 sm:text-xl/8 animate-fade-in">
//               Join us in transforming healthcare with innovation and technology. Browse our current job openings below and apply today.
//             </p>
//           </div>

//           <div className="mt-12 space-y-10">
//             {currentJobs.map((job) => (
//               <div
//                 key={job.id}
//                 className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <h2 className="text-2xl font-semibold text-gray-900">{job.title}</h2>
//                 <p className="mt-2 text-gray-700">{job.description}</p>
//                 <div className="mt-4 text-sm text-gray-600">
//                   <p>
//                     <strong>Location:</strong> {job.location}
//                   </p>
//                   <p>
//                     <strong>Type:</strong> {job.type}
//                   </p>
//                   <p>
//                     <strong>Tech Stack:</strong> {job.techStack}
//                   </p>
//                   <p>
//                     <strong>Salary:</strong> {job.salary}
//                   </p>
//                   <p>
//                     <strong>Experience:</strong> {job.experience}
//                   </p>
//                 </div>
//                 <div className="mt-6">
//                   <button
//                     onClick={() => handleApplyClick(job)}
//                     className="rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary"
//                   >
//                     Apply Now
//                   </button>
//                 </div>
//               </div>
//             ))}

//             <div className="flex justify-between mt-6">
//               <button
//                 onClick={handlePreviousPage}
//                 disabled={currentPage === 1}
//                 className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-300' : 'bg-primary'} text-white font-semibold`}
//               >
//                 Previous
//               </button>
//               <span className="text-sm font-medium text-gray-600">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={handleNextPage}
//                 disabled={currentPage === totalPages}
//                 className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-300' : 'bg-primary'} text-white font-semibold`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>

//           <p className="mt-12 text-center text-sm text-gray-600">
//             Don’t see a position that fits you?{' '}
//             <Link href="/contact" className="font-medium text-primary">
//               Contact us
//             </Link>{' '}
//             to share your interest.
//           </p>
//         </div>
//       </div>

//       {showModal && selectedJob && (
//         // <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
//         //   <div className="bg-white rounded-lg shadow-xl w-10/12 md:w-3/4 p-8">
//         //     <div className="flex">
//         //       <div className="w-1/2 pr-4">
//         //         <h2 className="text-2xl font-semibold">{selectedJob.title}</h2>
//         //         <p className="mt-2 text-gray-700">{selectedJob.description}</p>
//         //         <p className="mt-4"><strong>Location:</strong> {selectedJob.location}</p>
//         //         <p><strong>Type:</strong> {selectedJob.type}</p>
//         //         <p><strong>Tech Stack:</strong> {selectedJob.techStack}</p>
//         //         <p><strong>Salary:</strong> {selectedJob.salary}</p>
//         //         <p><strong>Experience:</strong> {selectedJob.experience}</p>
//         //       </div>

//         //       <div className="w-1/2 pl-4">
//         //         <h3 className="text-xl font-medium mb-4">Apply for {selectedJob.title}</h3>
//         //         <form className="space-y-4">
//         //           <div>
//         //             <label className="block text-sm font-medium text-gray-700">Full Name</label>
//         //             <input type="text" className="w-full p-3 border rounded-md" placeholder="Your full name" required />
//         //           </div>
//         //           <div>
//         //             <label className="block text-sm font-medium text-gray-700">Email Address</label>
//         //             <input type="email" className="w-full p-3 border rounded-md" placeholder="Your email" required />
//         //           </div>
//         //           <div>
//         //             <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//         //             <input type="text" className="w-full p-3 border rounded-md" placeholder="Your phone number" required />
//         //           </div>
//         //           <div>
//         //             <label className="block text-sm font-medium text-gray-700">Upload Resume</label>
//         //             <input type="file" className="w-full p-3 border rounded-md" required />
//         //           </div>
//         //           <div className="mt-4 flex justify-end">
//         //             <button
//         //               type="submit"
//         //               className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-md"
//         //             >
//         //               Submit Application
//         //             </button>
//         //           </div>
//         //         </form>
//         //       </div>
//         //     </div>
//         //     <button
//         //       onClick={handleCloseModal}
//         //       className="absolute top-28 right-56 text-4xl font-semibold text-primary"
//         //     >
//         //       &times;
//         //     </button>
//         //   </div>
//         // </div>


//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
//           <div className="bg-white rounded-lg shadow-xl w-11/12 sm:w-10/12 md:w-3/4 p-6 sm:p-8">
//             <div className="flex flex-col sm:flex-row">
//               <div className="w-full sm:w-1/2 sm:pr-4">
//                 <h2 className="text-xl sm:text-2xl font-semibold">{selectedJob.title}</h2>
//                 <p className="mt-2 text-gray-700">{selectedJob.description}</p>
//                 <p className="mt-4">
//                   <strong>Location:</strong> {selectedJob.location}
//                 </p>
//                 <p>
//                   <strong>Type:</strong> {selectedJob.type}
//                 </p>
//                 <p>
//                   <strong>Tech Stack:</strong> {selectedJob.techStack}
//                 </p>
//                 <p>
//                   <strong>Salary:</strong> {selectedJob.salary}
//                 </p>
//                 <p>
//                   <strong>Experience:</strong> {selectedJob.experience}
//                 </p>
//               </div>

//               <div className="w-full sm:w-1/2 sm:pl-4 mt-6 sm:mt-0">
//                 <h3 className="text-lg sm:text-xl font-medium mb-4">
//                   Apply for {selectedJob.title}
//                 </h3>
//                 <form className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border rounded-md"
//                       placeholder="Your full name"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       className="w-full p-3 border rounded-md"
//                       placeholder="Your email"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Phone Number
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border rounded-md"
//                       placeholder="Your phone number"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Upload Resume
//                     </label>
//                     <input
//                       type="file"
//                       className="w-full p-3 border rounded-md"
//                       required
//                     />
//                   </div>
//                   <div className="mt-4 flex justify-end">
//                     <button
//                       type="submit"
//                       className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-md"
//                     >
//                       Submit Application
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-4 sm:top-6 right-6 mt-4 md:right-52 md:mt-20 sm:right-6 text-4xl sm:text-4xl font-semibold text-primary"
//             >
//               &times;
//             </button>
//           </div>
//         </div>

//       )}
//     </div>
//   )
// }

// export default ApplyPage






'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiBriefcase, FiPhone, FiMail } from 'react-icons/fi'
import { motion } from 'framer-motion'

const ApplyPage = () => {
  const [jobListings] = useState<any[]>([]) // Empty job listings array

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`career-bg-${i}`}
              className="absolute text-gray-200"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
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
              <FiBriefcase className="w-6 h-6" />
            </motion.div>
          ))}
        </div>
        

        <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
            >
              <span className="text-sm font-medium text-primary">
                Join Our Team
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              <span className="block">Current Job</span>
              <span className="relative inline-block">
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Opportunities
                  </span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
                  />
                </span>
              </span>
            </motion.h1>

            {/* No Jobs Available Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 bg-white/50 backdrop-blur-sm rounded-xl p-12 shadow-sm border border-gray-100 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-purple-100">
                  <FiBriefcase className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-gray-900">
                  No Open Positions Currently
                </h3>
                <p className="mt-4 text-gray-600">
                  We don't have any open positions at the moment, but we're always looking for talented individuals to join our team.
                </p>
                <div className="mt-8">
                  <p className="text-sm font-medium text-gray-500 mb-4">
                    STAY CONNECTED FOR FUTURE OPPORTUNITIES
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link
                      href="/contactus"
                      className="relative group rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="relative z-10">Contact Us</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <FiArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center justify-center gap-4">
                      <Link
                        href="mailto:careers@tiameds.ai"
                        className="flex items-center text-gray-900 font-medium hover:text-primary transition-colors"
                      >
                        <FiMail className="mr-2" />
                        Email Us
                      </Link>
                      <Link
                        href="tel:+9473337583"
                        className="flex items-center text-gray-900 font-medium hover:text-primary transition-colors"
                      >
                        <FiPhone className="mr-2" />
                        Call Us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Future Opportunities */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Roles We Typically Hire For
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  "Frontend Developers",
                  "Backend Engineers",
                  "DevOps Specialists",
                  "Product Managers",
                  "UI/UX Designers",
                  "QA Engineers"
                ].map((role, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-center"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiBriefcase className="text-primary" />
                    </div>
                    <p className="font-medium text-gray-900">{role}</p>
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

export default ApplyPage