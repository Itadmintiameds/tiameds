// import React from 'react';
// import { FaBriefcase, FaUserGraduate, FaRocket, FaHandshake, FaBuilding } from 'react-icons/fa';

// const careerOpportunities = [
//   {
//     title: 'Software Engineer',
//     description: 'Join our dynamic team and work on cutting-edge technologies to build scalable solutions.',
//     points: [
//       'Collaborative work environment',
//       'Opportunities for continuous learning',
//       'Competitive salary and benefits',
//     ],
//     imageSrc: 'https://via.placeholder.com/600x400',
//     imageAlt: 'Software Engineer working on code.',
//     link: '/careers/software-engineer'
//   },
//   {
//     title: 'Product Manager',
//     description: 'Drive product vision and strategy to deliver impactful solutions for our customers.',
//     points: [
//       'Lead cross-functional teams',
//       'Define and prioritize product features',
//       'Work closely with stakeholders',
//     ],
//     imageSrc: 'https://via.placeholder.com/600x400',
//     imageAlt: 'Product Manager in a meeting.',
//     link: '/careers/product-manager'
//   },
//   {
//     title: 'UX Designer',
//     description: 'Create intuitive and engaging user experiences that delight our customers.',
//     points: [
//       'User-centric design approach',
//       'Collaboration with developers and product teams',
//       'Focus on accessibility and usability',
//     ],
//     imageSrc: 'https://via.placeholder.com/600x400',
//     imageAlt: 'UX Designer sketching wireframes.',
//     link: '/careers/ux-designer'
//   },
// ];

// function classNames(...classes) {
//   return classes.filter(Boolean).join(' ');
// }

// const CareerPage = () => {
//   return (
//     <div className="bg-white">
//       <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//         <div className="mx-auto max-w-3xl text-center">
//           <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Join Our Team</h2>
//           <p className="mt-6 text-lg text-gray-600">
//             Discover exciting career opportunities and become a part of a company where innovation meets growth.
//           </p>
//         </div>

//         <div className="mt-16 space-y-16">
//           {careerOpportunities.map((opportunity, index) => (
//             <div
//               key={opportunity.title}
//               className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
//             >
//               <div
//                 className={classNames(
//                   index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-8 xl:col-start-9',
//                   'mt-6 lg:col-span-5 lg:row-start-1 lg:mt-0 xl:col-span-4'
//                 )}
//               >
//                 <h3 className="text-2xl font-bold text-gray-800 flex items-center">
//                   <FaBriefcase className="mr-3 text-blue-600" /> {opportunity.title}
//                 </h3>
//                 <p className="mt-4 text-gray-600">{opportunity.description}</p>
//                 <ul className="mt-4 space-y-2">
//                   {opportunity.points.map((point) => (
//                     <li key={point} className="flex items-center">
//                       <FaRocket className="text-green-500 mr-2" />
//                       <span className="text-gray-700">{point}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <a
//                   href={opportunity.link}
//                   className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                 >
//                   Apply for {opportunity.title}
//                 </a>
//               </div>
//               <div
//                 className={classNames(
//                   index % 2 === 0 ? 'lg:col-start-6 xl:col-start-5' : 'lg:col-start-1',
//                   'flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8'
//                 )}
//               >
//                 <img
//                   alt={opportunity.imageAlt}
//                   src={opportunity.imageSrc}
//                   className="aspect-[5/2] w-full rounded-lg bg-gray-100 object-cover shadow-lg"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CareerPage;










'use client'

import Link from 'next/link'

const CareerSection = () => {
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
              Join Our Mission to Transform Healthcare
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-500 sm:text-xl/8 animate-fade-in">
              At Tiameds Technology, we are on a mission to revolutionize the healthcare industry. Join a team of innovators who are passionate about building solutions that make a real difference.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="careers/apply"
                className="rounded-md bg-gradient-to-r from-primary to-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 animate-bounce"
              >
                View Open Positions
              </Link>
              <Link href="/about" className="text-sm/6 font-semibold text-gray-900">
                Learn About Us <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900">Why Work With Us?</h2>
              <p className="mt-4 text-md text-gray-600">
                - Make an impact in the healthcare industry.<br />
                - Work with cutting-edge technology.<br />
                - Collaborate with a passionate, supportive team.<br />
                - Enjoy flexible work arrangements and competitive benefits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareerSection
