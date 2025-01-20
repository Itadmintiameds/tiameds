// 'use client';

// import { CaseStudy } from "../types/casestudies";
// import {casestudiesdata} from "../data/casestudies";


// const CaseStudiesSection = () => {
//   const caseStudies: CaseStudy[] = casestudiesdata;
  

//   return (
//     <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background">
//       {/* Background Gradient */}
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
//         />
//       </div>

//       <div className="mx-auto max-w-6xl text-center">
//         <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
//           Our Successful Case Studies
//         </h2>
//         <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
//           Discover how Tiameds has transformed healthcare operations through innovative software solutions.
//         </p>
//       </div>

//       <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//         {caseStudies.map((caseStudy, index) => (
//           <div
//             key={index}
//             className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-xl rounded-xl transition-all duration-300 hover:bg-cardhover transform hover:scale-105"
//           >
//             <img
//               src={caseStudy.image}
//               alt={caseStudy.title}
//               className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300"
//             />
//             <h3 className="text-xl font-semibold text-textdark">{caseStudy.title}</h3>
//             <p className="text-sm text-textmuted mt-4">{caseStudy.description}</p>
//             <a
//               href={caseStudy.link}
//               className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
//             >
//               Read Full Case Study →
//             </a>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default CaseStudiesSection;






// 'use client';

// import { useState } from 'react';
// import { CaseStudy } from '../types/casestudies';
// import { casestudiesdata } from '../data/casestudies';

// const CaseStudiesSection = () => {
//   const caseStudies: CaseStudy[] = casestudiesdata;
//   const [currentPage, setCurrentPage] = useState(1);
//   const studiesPerPage = 3; // Number of case studies to show per page
  
//   // Calculate pagination
//   const totalPages = Math.ceil(caseStudies.length / studiesPerPage);
//   const indexOfLastStudy = currentPage * studiesPerPage;
//   const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
//   const currentStudies = caseStudies.slice(indexOfFirstStudy, indexOfLastStudy);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   return (
//     <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background">
//       {/* Background Gradient */}
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
//         />
//       </div>

//       <div className="mx-auto max-w-6xl text-center">
//         <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
//           Our Successful Case Studies
//         </h2>
//         <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
//           Discover how Tiameds has transformed healthcare operations through innovative software solutions.
//         </p>
//       </div>

//       <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//         {currentStudies.map((caseStudy, index) => (
//           <div
//             key={index}
//             className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-xl rounded-xl transition-all duration-300 hover:bg-cardhover transform hover:scale-105"
//           >
//             <img
//               src={caseStudy.image}
//               alt={caseStudy.title}
//               className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300"
//             />
//             <h3 className="text-xl font-semibold text-textdark">{caseStudy.title}</h3>
//             <p className="text-sm text-textmuted mt-4">{caseStudy.description}</p>
//             <a
//               href={caseStudy.link}
//               className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
//             >
//               Read Full Case Study →
//             </a>
//           </div>
//         ))}
//       </div>

//       {/* Pagination Controls */}
//       <div className="flex justify-center mt-8 space-x-4">
//         <button
//           onClick={handlePrevPage}
//           disabled={currentPage === 1}
//           className={`px-4 py-2 rounded bg-primary text-white hover:bg-secondary disabled:opacity-50`}
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 text-textmuted">Page {currentPage} of {totalPages}</span>
//         <button
//           onClick={handleNextPage}
//           disabled={currentPage === totalPages}
//           className={`px-4 py-2 rounded bg-primary text-white hover:bg-secondary disabled:opacity-50`}
//         >
//           Next
//         </button>
//       </div>
//     </section>
//   );
// };

// export default CaseStudiesSection;


'use client';

import { useState } from 'react';
import { CaseStudy } from '../types/casestudies';
import { casestudiesdata } from '../data/casestudies';
import { useRouter } from "next/navigation";

const CaseStudiesSection = () => {
  const caseStudies: CaseStudy[] = casestudiesdata;
  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 3;
  
  const totalPages = Math.ceil(caseStudies.length / studiesPerPage);
  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = caseStudies.slice(indexOfFirstStudy, indexOfLastStudy);

  const router = useRouter();

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewPost = (id: number) => {
    console.log(`View post with ID: ${id}`);
    router.push(`/casestudies/${id}`); // Redirects to the post page
    
  };

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          Our Successful Case Studies
        </h2>
        <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
          Discover how Tiameds has transformed healthcare operations through innovative software solutions.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {currentStudies.map((caseStudy, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-xl rounded-xl transition-all duration-300 hover:bg-cardhover transform hover:scale-105"
          >
            <img
              src={caseStudy.image}
              alt={caseStudy.title}
              className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300"
            />
            <h3 className="text-xl font-semibold text-textdark">{caseStudy.title}</h3>
            <p className="text-sm text-textmuted mt-4">{caseStudy.description}</p>
            <button
              onClick={() => handleViewPost(caseStudy.id)}
              className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
            >
              Read Full Case Study →
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full bg-primary text-white shadow-md hover:bg-secondary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        >
          <span className="inline-block transform rotate-180">➜</span>
        </button>
        <span className="px-4 py-2 text-textmuted">Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full bg-primary text-white shadow-md hover:bg-secondary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        >
          <span className="inline-block">➜</span>
        </button>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
