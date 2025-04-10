import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  siblingCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const totalNumbers = siblingCount * 2 + 3; // Total numbers to display including first, current, last, and siblings
    const totalBlocks = totalNumbers + 2; // Total including dots
    
    if (totalPages <= totalBlocks) {
      // Show all page numbers
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with dots
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);
      
      const shouldShowLeftDots = leftSiblingIndex > 1;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Show pages from start, no left dots, but right dots
        for (let i = 0; i <= rightSiblingIndex + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // right dots
        pages.push(totalPages - 1); // last page
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Show pages near end, left dots, but no right dots
        pages.push(0); // first page
        pages.push(-1); // left dots
        for (let i = Math.max(totalPages - 3, 0); i < totalPages; i++) {
          pages.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show pages around current, with dots on both sides
        pages.push(0); // first page
        pages.push(-1); // left dots
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push(-2); // right dots
        pages.push(totalPages - 1); // last page
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1 || totalPages === 0;
  
  // Page size options
  const pageSizeOptions = [10, 25, 50, 100];
  
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between mt-4">
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        <span className="text-sm text-muted-foreground">Hiển thị</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">trên {totalItems} mục</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(0)}
          disabled={isFirstPage}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Trang đầu</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Trang trước</span>
        </Button>
        
        {pageNumbers.map((pageNumber, i) => {
          // Render dots
          if (pageNumber === -1) {
            return <span key={`dots-${i}`} className="px-2">...</span>;
          }
          if (pageNumber === -2) {
            return <span key={`dots-${i}`} className="px-2">...</span>;
          }
          
          // Render page number
          return (
            <Button
              key={`page-${pageNumber}`}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber + 1}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Trang sau</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={isLastPage}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Trang cuối</span>
        </Button>
      </div>
    </div>
  );
};
