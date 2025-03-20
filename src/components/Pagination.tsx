import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
  previousLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  breakLabel?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageNumbers = true,
  pageRangeDisplayed = 3,
  marginPagesDisplayed = 1,
  previousLabel = <ChevronLeft className="h-4 w-4" />,
  nextLabel = <ChevronRight className="h-4 w-4" />,
  breakLabel = '...'
}) => {
  // Don't render if there's only 1 page
  if (totalPages <= 1) {
    return null;
  }

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Always include first page
    if (marginPagesDisplayed >= 1) {
      for (let i = 1; i <= Math.min(marginPagesDisplayed, totalPages); i++) {
        pages.push(i);
      }
    }
    
    // Calculate center range
    const leftSide = Math.max(1, currentPage - Math.floor(pageRangeDisplayed / 2));
    const rightSide = Math.min(totalPages, currentPage + Math.floor(pageRangeDisplayed / 2));
    
    // Add break if needed before center range
    if (leftSide > marginPagesDisplayed + 1) {
      pages.push('break-left');
    }
    
    // Add center range
    for (let i = leftSide; i <= rightSide; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Add break if needed after center range
    if (rightSide < totalPages - marginPagesDisplayed) {
      pages.push('break-right');
    }
    
    // Always include last pages
    if (marginPagesDisplayed >= 1) {
      for (let i = Math.max(totalPages - marginPagesDisplayed + 1, rightSide + 1); i <= totalPages; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  // Base button styling
  const baseButtonClass = "px-3 py-2 inline-flex items-center justify-center text-sm font-medium";
  const enabledClass = "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
  const disabledClass = "border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed";
  const activeClass = "border border-indigo-500 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400";

  return (
    <nav className={`flex items-center justify-center ${className}`} aria-label="Pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First page button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`${baseButtonClass} rounded-md ${currentPage === 1 ? disabledClass : enabledClass}`}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseButtonClass} rounded-md ${currentPage === 1 ? disabledClass : enabledClass}`}
          aria-label="Previous page"
        >
          {previousLabel}
        </button>
        
        {/* Page numbers */}
        {showPageNumbers && getPageNumbers().map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span 
                key={`${page}-${index}`} 
                className={`${baseButtonClass} ${disabledClass} border-transparent`}
              >
                {breakLabel}
              </span>
            );
          }
          
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${baseButtonClass} rounded-md ${currentPage === page ? activeClass : enabledClass}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
        
        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} rounded-md ${currentPage === totalPages ? disabledClass : enabledClass}`}
          aria-label="Next page"
        >
          {nextLabel}
        </button>
        
        {/* Last page button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} rounded-md ${currentPage === totalPages ? disabledClass : enabledClass}`}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
