import React from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
      >
        <FaSortAmountDown className="text-gray-600" /> Previous
      </button>
      <span className="mx-4 text-xs">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
      >
        Next <FaSortAmountUp className="text-gray-600" />
      </button>
    </div>
  );
};

export default Pagination;
