import React from 'react';

interface TableProps<T> {
  data: T[]; // Array of data to be displayed
  columns: {
    header: string; // Header text
    accessor: keyof T | ((item: T) => React.ReactNode); // Field name or custom renderer
  }[];
  actions?: (item: T) => React.ReactNode; // Optional actions for each row
  noDataMessage?: string; // Message when there's no data
}

const TableComponent = <T,>({ data, columns, actions, noDataMessage = "No data available" }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-sm bg-white">
      <table className="table-auto w-full text-sm text-gray-700">
        <thead>
          <tr className="bg-primary text-left text-white">
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-1 font-medium text-gray-100">{col.header}</th>
            ))}
            {actions && <th className="px-3 py-1 font-medium text-textwhite text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50 transition duration-300">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-3 py-1">
                    {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor])}
                  </td>
                ))}
                {actions && (
                  <td className="px-3 py-1 text-center space-x-3 flex justify-center">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-1 text-gray-500">
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent



