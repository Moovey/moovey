import { memo, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = memo(({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  const { startIndex, endIndex, pageNumbers } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, totalItems);
    
    // Generate page numbers with smart display logic
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and 2 pages on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return {
      startIndex: start + 1,
      endIndex: end,
      pageNumbers: pages
    };
  }, [currentPage, totalPages, totalItems, itemsPerPage]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-6 lg:mt-8">
      {/* Mobile/Tablet Pagination */}
      <div className="xl:hidden">
        <div className="flex flex-col space-y-3 px-2 sm:px-4">
          {/* Results info - hide on very small screens */}
          <div className="hidden xs:block text-xs sm:text-sm text-gray-700 text-center">
            Showing {startIndex} to {endIndex} of {totalItems} results
          </div>
          
          {/* Navigation controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white hover:from-[#00ACC1] hover:to-[#00BCD4] shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </button>
            
            {/* Page indicator with direct page input for larger mobile screens */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-1">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      onPageChange(page);
                    }
                  }}
                  className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4] focus:outline-none"
                />
                <span className="text-sm text-gray-500">of {totalPages}</span>
              </div>
              <div className="sm:hidden">
                <span className="text-sm font-medium text-[#1A237E] px-2 py-1 bg-gray-100 rounded">
                  {currentPage}/{totalPages}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white hover:from-[#00ACC1] hover:to-[#00BCD4] shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              <span className="hidden xs:inline">Next</span>
              <span className="xs:hidden">Next</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Quick jump buttons for mobile */}
          {totalPages > 5 && (
            <div className="flex items-center justify-center space-x-1">
              {currentPage > 3 && (
                <button
                  onClick={() => onPageChange(1)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 text-[#1A237E] rounded hover:bg-[#00BCD4] hover:text-white hover:border-[#00BCD4] transition-all"
                >
                  1
                </button>
              )}
              {currentPage > 4 && <span className="text-gray-400 text-xs">...</span>}
              
              {/* Show current page and adjacent pages (up to 5 pages) */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white'
                        : 'bg-white border border-gray-300 text-[#1A237E] hover:bg-[#00BCD4] hover:text-white hover:border-[#00BCD4]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {currentPage < totalPages - 3 && <span className="text-gray-400 text-xs">...</span>}
              {currentPage < totalPages - 2 && (
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 text-[#1A237E] rounded hover:bg-[#00BCD4] hover:text-white hover:border-[#00BCD4] transition-all"
                >
                  {totalPages}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden xl:flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm">
        <div className="text-sm text-gray-700 font-medium">
          Showing <span className="font-semibold text-[#1A237E]">{startIndex}-{endIndex}</span> of <span className="font-semibold text-[#1A237E]">{totalItems}</span> results
        </div>
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-[#1A237E] hover:bg-[#00BCD4] hover:text-white border border-gray-300 hover:border-[#00BCD4] shadow-sm hover:shadow-md'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {/* Show first page and ellipsis if needed */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 bg-white text-[#1A237E] hover:bg-[#00BCD4] hover:text-white border border-gray-300 hover:border-[#00BCD4] shadow-sm hover:shadow-md"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 py-2 text-gray-400">...</span>
              )}
            </>
          )}

          {/* Page Numbers */}
          <div className="flex space-x-1">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 ${
                  currentPage === pageNumber
                    ? 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white shadow-md'
                    : 'bg-white text-[#1A237E] hover:bg-[#00BCD4] hover:text-white border border-gray-300 hover:border-[#00BCD4] shadow-sm hover:shadow-md'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          {/* Show last page and ellipsis if needed */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 py-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 bg-white text-[#1A237E] hover:bg-[#00BCD4] hover:text-white border border-gray-300 hover:border-[#00BCD4] shadow-sm hover:shadow-md"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-[#1A237E] hover:bg-[#00BCD4] hover:text-white border border-gray-300 hover:border-[#00BCD4] shadow-sm hover:shadow-md'
            }`}
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;