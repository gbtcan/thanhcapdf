import React, { ReactNode } from 'react';
import LoadingIndicator from '../LoadingIndicator';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

/**
 * Reusable table component for displaying data in the admin panel
 */
function AdminTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = "No data available",
  className = '',
  rowClassName,
  onRowClick
}: AdminTableProps<T>) {
  // Helper function to get cell value
  const getCellValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <LoadingIndicator size="medium" message="Loading data..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowKey = String(row[keyField]);
                const baseRowClass = "hover:bg-gray-50 dark:hover:bg-gray-750";
                const customRowClass = rowClassName ? rowClassName(row) : '';
                const clickableClass = onRowClick ? "cursor-pointer" : "";
                
                return (
                  <tr 
                    key={rowKey}
                    className={`${baseRowClass} ${customRowClass} ${clickableClass}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                        {column.cell
                          ? column.cell(getCellValue(row, column.accessor), row)
                          : getCellValue(row, column.accessor)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable;
