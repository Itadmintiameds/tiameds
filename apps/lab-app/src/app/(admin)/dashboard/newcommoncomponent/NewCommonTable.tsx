"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import NewPagination from "./NewPagination";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

const ALIGN_CLASS: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

interface ServerPagination {
  currentPage: number; // 1-based, to match this component's existing convention
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface NewCommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  showPagination?: boolean;
  resetPageKey?: string | number;
  /** When provided, `data` is treated as already the current page's rows and
   * pagination is driven by the caller instead of being sliced client-side. */
  serverPagination?: ServerPagination;
}

const NewCommonTable = <T extends object>({
  columns,
  data,
  pageSize = 10,
  showPagination = true,
  resetPageKey,
  serverPagination,
}: NewCommonTableProps<T>) => {
  const [internalPage, setInternalPage] = useState(1);
  const internalTotalPages = Math.ceil(data.length / pageSize);

  useEffect(() => {
    if (!serverPagination) setInternalPage(1);
  }, [resetPageKey, serverPagination]);

  useEffect(() => {
    if (!serverPagination && internalPage > internalTotalPages && internalTotalPages > 0) {
      setInternalPage(internalTotalPages);
    }
  }, [internalPage, internalTotalPages, serverPagination]);

  const currentPage = serverPagination ? serverPagination.currentPage : internalPage;
  const totalPages = serverPagination ? serverPagination.totalPages : internalTotalPages;
  const onPageChange = serverPagination ? serverPagination.onPageChange : setInternalPage;

  const paginatedData = useMemo(() => {
    if (serverPagination) return data;
    const start = (internalPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [serverPagination, internalPage, data, pageSize]);

  return (
    <>
    <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="h-17 border-b border-pneutral-200 bg-pneutral-50">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={`px-5 font-heading font-semibold text-label-l3 text-pneutral-900 align-middle ${ALIGN_CLASS[column.align ?? "left"]}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-pneutral-200 last:border-none hover:bg-pneutral-50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-5 py-3.5 align-top ${ALIGN_CLASS[column.align ?? "left"]}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String(
                        row[
                        column.accessor as keyof T
                        ] ?? ""
                      )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {showPagination && (serverPagination ? totalPages > 1 : data.length > pageSize) && (
        <NewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
      </>
  );
};

export default NewCommonTable;












// code dated 07.07.2026 without new pagination table...................................
// 
// 
// 
// 
// "use client";

// import { ReactNode, useMemo, useState } from "react";
// import NewPagination from "./NewPagination";

// export interface Column<T> {
//   header: string;
//   accessor: keyof T | string;
//   render?: (row: T) => ReactNode;
// }

// interface NewCommonTableProps<T> {
//   columns: Column<T>[];
//   data: T[];
//   pageSize?: number;
//   showPagination?: boolean;
// }

// const NewCommonTable = <T extends object>({
//   columns,
//   data,
//   pageSize = 10,
//   showPagination = true,
// }: NewCommonTableProps<T>) => {
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(data.length / pageSize);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;

//     return data.slice(start, start + pageSize);
//   }, [currentPage, data, pageSize]);

//   return (
//     <>
//     <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="h-17 border-b border-pneutral-200 bg-pneutral-50">
//               {columns.map((column) => (
//                 <th
//                   key={column.header}
//                   className="
//                           px-5
//                           text-left
//                           font-heading
//                            font-semibold
//                            text-label-l3
//                            text-pneutral-900
//                            align-middle
//                              "
//                 >
//                   {column.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {paginatedData.map((row, rowIndex) => (
//               <tr
//                 key={rowIndex}
//                 className="border-b border-pneutral-200 last:border-none"
//               >
//                 {columns.map((column) => (
//                   <td
//                     key={column.header}
//                     className="px-5 py-3.5"
//                   >
//                     {column.render
//                       ? column.render(row)
//                       : String(
//                         row[
//                         column.accessor as keyof T
//                         ] ?? ""
//                       )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     {showPagination && data.length > pageSize && (
//         <NewPagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       )}
//       </>
//   );
// };

// export default NewCommonTable;