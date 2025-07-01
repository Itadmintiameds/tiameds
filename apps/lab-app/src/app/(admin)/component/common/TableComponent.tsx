// import React from 'react';

// interface TableProps<T> {
//   data: T[]; // Array of data to be displayed
//   columns: {
//     header: string; // Header text
//     accessor: keyof T | ((item: T) => React.ReactNode); // Field name or custom renderer
//   }[];
//   actions?: (item: T) => React.ReactNode; // Optional actions for each row
//   noDataMessage?: string; // Message when there's no data
// }

// const TableComponent = <T,>({ data, columns, actions, noDataMessage = "No data available" }: TableProps<T>) => {
//   return (
//     <div className="overflow-x-auto shadow-md rounded-sm bg-white">
//       <table className="table-auto w-full text-sm text-gray-700">
//         <thead>
//           <tr className="bg-primary text-left text-gray-700">
//             {columns.map((col, index) => (
//               <th key={index} className="px-3 py-1 font-medium text-gray-700">{col.header}</th>
//             ))}
//             {actions && <th className="px-3 py-1 font-medium text-gray-700 text-center">Actions</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {data.length > 0 ? (
//             data.map((item, rowIndex) => (
//               <tr key={rowIndex} className="border-b hover:bg-gray-50 transition duration-300">
//                 {columns.map((col, colIndex) => (
//                   <td key={colIndex} className="px-3 py-1">
//                     {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor])}
//                   </td>
//                 ))}
//                 {actions && (
//                   <td className="px-3 py-1 text-center space-x-3 flex justify-center">
//                     {actions(item)}
//                   </td>
//                 )}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-1 text-gray-500">
//                 {noDataMessage}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TableComponent







import React from 'react';

interface TableProps<T> {
  data: T[]; // Array of data to be displayed
  columns: {
    header: string; // Header text
    accessor: keyof T | ((item: T) => React.ReactNode); // Field name or custom renderer
  }[];
  actions?: (item: T) => React.ReactNode; // Optional actions for each row
  noDataMessage?: string; // Message when there's no data
  className?: string; // Additional className for the table container
}

const TableComponent = <T,>({ 
  data, 
  columns, 
  actions, 
  noDataMessage = "No data available",
  className = ""
}: TableProps<T>) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th 
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.length > 0 ? (
              data?.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                >
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                    >
                      <div className="flex items-center">
                        {typeof col.accessor === 'function' 
                          ? col.accessor(item) 
                          : (
                            <span className="text-gray-900 font-medium">
                              {String(item[col.accessor])}
                            </span>
                          )}
                      </div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex justify-center space-x-2">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-gray-400 mb-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-gray-600 font-medium">{noDataMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;

