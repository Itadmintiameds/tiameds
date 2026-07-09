"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NewPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return (
    <div className="flex items-center justify-center gap-2 py-5">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-300 disabled:opacity-50"
      >
        <ArrowLeft size={20} />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 rounded-full font-medium transition ${
            currentPage === page
              ? "bg-secondary-500 text-white"
              : "border border-pneutral-200 bg-white hover:bg-secondary-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-300 disabled:opacity-50"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default NewPagination;






// old code dated 09.07.2026..........

// "use client";

// import { ArrowLeft, ArrowRight } from "lucide-react";

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }

// const NewPagination = ({
//   currentPage,
//   totalPages,
//   onPageChange,
// }: PaginationProps) => {
//   return (
//     <div className="flex items-center justify-center gap-2 py-5">
//       <button
//         disabled={currentPage === 1}
//         onClick={() => onPageChange(currentPage - 1)}
//         className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-300 disabled:opacity-50"
//       >
//         <ArrowLeft size={24} />
//       </button>

//       {Array.from(
//         { length: totalPages },
//         (_, index) => index + 1
//       ).map((page) => (
//         <button
//           key={page}
//           onClick={() => onPageChange(page)}
//           className={`h-10 w-10 rounded-md font-medium ${
//             currentPage === page
//               ? "bg-secondary-500 text-white"
//               : "border border-pneutral-200 bg-white"
//           }`}
//         >
//           {page}
//         </button>
//       ))}

//       <button
//         disabled={currentPage === totalPages}
//         onClick={() => onPageChange(currentPage + 1)}
//         className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-300 disabled:opacity-50"
//       >
//         <ArrowRight size={24} />
//       </button>
//     </div>
//   );
// };

// export default NewPagination;