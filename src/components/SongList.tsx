import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, User, Tag, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { HymnWithRelations } from '../types';
import { getLyricExcerpt } from '../utils/formatLyrics';
import LoadingIndicator from './LoadingIndicator';

interface SongListProps {
  hymns: HymnWithRelations[];
  isLoading?: boolean;
  error?: Error | null;
  showPagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

const SongList: React.FC<SongListProps> = ({
  hymns,
  isLoading = false,
  error = null,
  showPagination = false,
  pageSize = 10,
  currentPage = 1,
  totalCount = 0,
  onPageChange = () => {}
}) => {
  const [expandedHymn, setExpandedHymn] = useState<string | null>(null);
  
  // Toggle hymn details expansion
  const toggleExpand = (hymnId: string) => {
    if (expandedHymn === hymnId) {
      setExpandedHymn(null);
    } else {
      setExpandedHymn(hymnId);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingIndicator size="large" message="Loading hymns..." />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error loading hymns</h3>
            <div className="mt-2 text-sm">
              <p>{error.message || 'An unknown error occurred'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (hymns.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Music className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hymns found</h3>
        <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  // Calculate pagination info
  const totalPages = showPagination ? Math.ceil(totalCount / pageSize) : 0;
  
  return (
    <div className="space-y-6">
      {/* Hymn list */}
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
        {hymns.map((hymn) => (
          <li key={hymn.id} className="group hover:bg-gray-50">
            {/* Main hymn row - always visible */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <Link to={`/songs/${hymn.id}`} className="block focus:outline-none">
                    <h3 className="text-lg font-medium text-indigo-700 group-hover:text-indigo-900 truncate">
                      {hymn.title}
                    </h3>
                  </Link>
                  
                  {/* Authors */}
                  {hymn.authors && hymn.authors.length > 0 && (
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {hymn.authors.map((author, index) => (
                        <span key={author.id}>
                          {index > 0 && ", "}
                          <Link
                            to={`/authors/${author.id}`} 
                            className="hover:text-indigo-600"
                          >
                            {author.name}
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Categories */}
                  {hymn.categories && hymn.categories.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {hymn.categories.map(category => (
                        <Link
                          key={category.id}
                          to={`/categories/${category.id}`}
                          className="inline-flex items-center py-0.5 px-2 text-xs rounded-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Expand/collapse button */}
                <button
                  onClick={() => toggleExpand(hymn.id)}
                  className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-expanded={expandedHymn === hymn.id}
                >
                  {expandedHymn === hymn.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Preview of lyrics - only when collapsed */}
              {expandedHymn !== hymn.id && hymn.lyrics && (
                <div className="mt-2 text-sm text-gray-600 line-clamp-1">
                  {getLyricExcerpt(hymn.lyrics, 120)}
                </div>
              )}
              
              {/* Expanded view - only when expanded */}
              {expandedHymn === hymn.id && (
                <div className="mt-4 space-y-4">
                  {/* Lyrics preview */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Lyrics Preview</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">
                      {hymn.lyrics}
                    </div>
                  </div>
                  
                  {/* View full button */}
                  <div className="flex justify-end">
                    <Link
                      to={`/songs/${hymn.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-sm rounded-md font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                    >
                      View Full Hymn
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      {/* Pagination UI */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {/* Previous page */}
                <button
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  &lsaquo;
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 
                        ${currentPage === page 
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {/* Next page */}
                <button
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  &rsaquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongList;
