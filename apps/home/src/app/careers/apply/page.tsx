// 'use client'

// import Link from 'next/link'

// const jobListings = [
//   {
//     id: 1,
//     title: 'Frontend Developer',
//     location: 'Remote',
//     type: 'Full-time',
//     description:
//       'We are looking for a talented Frontend Developer to build intuitive user interfaces using React and modern web technologies.',
//     applyLink: '/apply/frontend-developer',
//   },
//   {
//     id: 2,
//     title: 'Backend Engineer',
//     location: 'Remote',
//     type: 'Full-time',

//     description:
//       'Join our backend team to design and implement scalable APIs and database solutions for our SaaS products.',
//     applyLink: '/apply/backend-engineer',
//   },
//   {
//     id: 3,
//     title: 'Product Manager',
//     location: 'Bangalore, India',
//     type: 'Full-time',
//     description:
//       'We need a Product Manager to define and drive product strategy, ensuring alignment with business objectives.',
//     applyLink: '/apply/product-manager',
//   },
// ]

// const ApplyPage = () => {
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
//             {jobListings.map((job) => (
//               <div
//                 key={job.id}
//                 className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <h2 className="text-2xl font-semibold text-gray-900">
//                   {job.title}
//                 </h2>
//                 <p className="mt-2 text-gray-700">{job.description}</p>
//                 <div className="mt-4 text-sm text-gray-600">
//                   <p>
//                     <strong>Location:</strong> {job.location}
//                   </p>
//                   <p>
//                     <strong>Type:</strong> {job.type}
//                   </p>
//                 </div>
//                 <div className="mt-6">
//                   <Link
//                     href={job.applyLink}
//                     className="rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary"
//                   >
//                     Apply Now
//                   </Link>
//                 </div>
//               </div>
//             ))}
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
//     </div>
//   )
// }

// export default ApplyPage





// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'

// const jobListings = [
//   {
//     id: 1,
//     title: 'Frontend Developer',
//     location: 'Remote',
//     type: 'Full-time',
//     description:
//       'We are looking for a talented Frontend Developer to build intuitive user interfaces using React and modern web technologies.',
//     techStack: ['React', 'JavaScript', 'CSS', 'HTML'],
//     salary: '₹8,00,000 - ₹12,00,000',
//     experience: '2-5 years',
//     applyLink: '/apply/frontend-developer',
//   },
//   {
//     id: 2,
//     title: 'Backend Engineer',
//     location: 'Remote',
//     type: 'Full-time',
//     description:
//       'Join our backend team to design and implement scalable APIs and database solutions for our SaaS products.',
//     techStack: ['Node.js', 'Express', 'MongoDB', 'RESTful APIs'],
//     salary: '₹10,00,000 - ₹15,00,000',
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
//     techStack: ['Agile', 'Product Management', 'Roadmapping'],
//     salary: '₹15,00,000 - ₹25,00,000',
//     experience: '5-8 years',
//     applyLink: '/apply/product-manager',
//   },
// ]

// const ApplyPage = () => {
//   const [modalVisible, setModalVisible] = useState(false)
//   const [selectedJob, setSelectedJob] = useState(null)
//   const [personalInfo, setPersonalInfo] = useState({
//     name: '',
//     email: '',
//     phone: '',
//   })

//   const handleApplyClick = (job) => {
//     setSelectedJob(job)
//     setModalVisible(true)
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setPersonalInfo({
//       ...personalInfo,
//       [name]: value,
//     })
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     // Handle form submission logic here
//     console.log('Submitted Personal Info:', personalInfo)
//     setModalVisible(false)
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
//             {jobListings.map((job) => (
//               <div
//                 key={job.id}
//                 className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <h2 className="text-2xl font-semibold text-gray-900">
//                   {job.title}
//                 </h2>
//                 <p className="mt-2 text-gray-700">{job.description}</p>
//                 <div className="mt-4 text-sm text-gray-600">
//                   <p>
//                     <strong>Location:</strong> {job.location}
//                   </p>
//                   <p>
//                     <strong>Type:</strong> {job.type}
//                   </p>
//                   <p>
//                     <strong>Tech Stack:</strong> {job.techStack.join(', ')}
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

//       {modalVisible && selectedJob && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
//               Apply for {selectedJob.title}
//             </h2>
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={personalInfo.name}
//                     onChange={handleInputChange}
//                     className="mt-2 p-2 w-full border border-gray-300 rounded-md"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={personalInfo.email}
//                     onChange={handleInputChange}
//                     className="mt-2 p-2 w-full border border-gray-300 rounded-md"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     id="phone"
//                     name="phone"
//                     value={personalInfo.phone}
//                     onChange={handleInputChange}
//                     className="mt-2 p-2 w-full border border-gray-300 rounded-md"
//                     required
//                   />
//                 </div>
//                 <div className="mt-4 text-right">
//                   <button
//                     type="submit"
//                     className="rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary"
//                   >
//                     Submit Application
//                   </button>
//                 </div>
//               </div>
//             </form>
//             <button
//               onClick={() => setModalVisible(false)}
//               className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//             >
//               X
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ApplyPage





// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'

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
// ]

// const ApplyPage = () => {
//   const [showModal, setShowModal] = useState(false)
//   const [selectedJob, setSelectedJob] = useState(null)

//   const handleApplyClick = (job) => {
//     setSelectedJob(job)
//     setShowModal(true)
//   }

//   const handleCloseModal = () => {
//     setShowModal(false)
//     setSelectedJob(null)
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
//             {jobListings.map((job) => (
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

//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
//           <div className="bg-white rounded-lg shadow-xl w-10/12 md:w-3/4 p-8">
//             <div className="flex">
//               <div className="w-1/2 pr-4">
//                 <h2 className="text-2xl font-semibold">{selectedJob.title}</h2>
//                 <p className="mt-2 text-gray-700">{selectedJob.description}</p>
//                 <p className="mt-4"><strong>Location:</strong> {selectedJob.location}</p>
//                 <p><strong>Type:</strong> {selectedJob.type}</p>
//                 <p><strong>Tech Stack:</strong> {selectedJob.techStack}</p>
//                 <p><strong>Salary:</strong> {selectedJob.salary}</p>
//                 <p><strong>Experience:</strong> {selectedJob.experience}</p>
//               </div>

//               <div className="w-1/2 pl-4">
//                 <h3 className="text-xl font-medium mb-4">Apply for {selectedJob.title}</h3>
//                 <form className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                     <input type="text" className="w-full p-3 border rounded-md" placeholder="Your full name" required />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Email Address</label>
//                     <input type="email" className="w-full p-3 border rounded-md" placeholder="Your email" required />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                     <input type="text" className="w-full p-3 border rounded-md" placeholder="Your phone number" required />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Upload Resume</label>
//                     <input type="file" className="w-full p-3 border rounded-md" required />
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
//               className="absolute top-4 right-4 text-2xl font-semibold text-gray-500"
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


interface JobListing {
  id: number
  title: string
  location: string
  type: string
  description: string
  techStack: string
  salary: string
  experience: string
  applyLink: string
}

const jobListings = [
  {
    id: 1,
    title: 'Frontend Developer',
    location: 'Remote',
    type: 'Full-time',
    description:
      'We are looking for a talented Frontend Developer to build intuitive user interfaces using React and modern web technologies.',
    techStack: 'React, JavaScript, CSS, HTML, Redux',
    salary: '₹8-12 LPA',
    experience: '3-5 years',
    applyLink: '/apply/frontend-developer',
  },
  {
    id: 2,
    title: 'Backend Engineer',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Join our backend team to design and implement scalable APIs and database solutions for our SaaS products.',
    techStack: 'Node.js, Express, MongoDB, AWS, Docker',
    salary: '₹10-15 LPA',
    experience: '3-6 years',
    applyLink: '/apply/backend-engineer',
  },
  {
    id: 3,
    title: 'Product Manager',
    location: 'Bangalore, India',
    type: 'Full-time',
    description:
      'We need a Product Manager to define and drive product strategy, ensuring alignment with business objectives.',
    techStack: 'Product Management, Agile, Jira, Scrum',
    salary: '₹15-20 LPA',
    experience: '5+ years',
    applyLink: '/apply/product-manager',
  },
  // Add more jobs as needed...
]

const ApplyPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 2

  const totalPages = Math.ceil(jobListings.length / jobsPerPage)
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = jobListings.slice(indexOfFirstJob, indexOfLastJob)

  const handleApplyClick = (job: JobListing) => {
    
    setSelectedJob(job)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedJob(null)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-28 animate-fade-in-up">
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl animate-slide-in">
              Explore Open Positions
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-500 sm:text-xl/8 animate-fade-in">
              Join us in transforming healthcare with innovation and technology. Browse our current job openings below and apply today.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {currentJobs.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-900">{job.title}</h2>
                <p className="mt-2 text-gray-700">{job.description}</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {job.type}
                  </p>
                  <p>
                    <strong>Tech Stack:</strong> {job.techStack}
                  </p>
                  <p>
                    <strong>Salary:</strong> {job.salary}
                  </p>
                  <p>
                    <strong>Experience:</strong> {job.experience}
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => handleApplyClick(job)}
                    className="rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-300' : 'bg-primary'} text-white font-semibold`}
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-300' : 'bg-primary'} text-white font-semibold`}
              >
                Next
              </button>
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-gray-600">
            Don’t see a position that fits you?{' '}
            <Link href="/contact" className="font-medium text-primary">
              Contact us
            </Link>{' '}
            to share your interest.
          </p>
        </div>
      </div>

      {showModal && selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl w-10/12 md:w-3/4 p-8">
            <div className="flex">
              <div className="w-1/2 pr-4">
                <h2 className="text-2xl font-semibold">{selectedJob.title}</h2>
                <p className="mt-2 text-gray-700">{selectedJob.description}</p>
                <p className="mt-4"><strong>Location:</strong> {selectedJob.location}</p>
                <p><strong>Type:</strong> {selectedJob.type}</p>
                <p><strong>Tech Stack:</strong> {selectedJob.techStack}</p>
                <p><strong>Salary:</strong> {selectedJob.salary}</p>
                <p><strong>Experience:</strong> {selectedJob.experience}</p>
              </div>

              <div className="w-1/2 pl-4">
                <h3 className="text-xl font-medium mb-4">Apply for {selectedJob.title}</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" className="w-full p-3 border rounded-md" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" className="w-full p-3 border rounded-md" placeholder="Your email" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="text" className="w-full p-3 border rounded-md" placeholder="Your phone number" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Resume</label>
                    <input type="file" className="w-full p-3 border rounded-md" required />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-md"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="absolute top-28 right-56 text-4xl font-semibold text-primary"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplyPage
