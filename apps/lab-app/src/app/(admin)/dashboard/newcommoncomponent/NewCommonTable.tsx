"use client";

import { ReactNode, useMemo, useState } from "react";
import NewPagination from "./NewPagination";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => ReactNode;
}

interface NewCommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  showPagination?: boolean;
}

const NewCommonTable = <T extends object>({
  columns,
  data,
  pageSize = 10,
  showPagination = true,
}: NewCommonTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return data.slice(start, start + pageSize);
  }, [currentPage, data, pageSize]);

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
                  className="
                          px-5
                          text-left
                          font-heading
                           font-semibold
                           text-label-l3
                           text-pneutral-900
                           align-middle
                             "
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
                className="border-b border-pneutral-200 last:border-none"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className="px-5 py-3.5"
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
    {showPagination && data.length > pageSize && (
        <NewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      </>
  );
};

export default NewCommonTable;