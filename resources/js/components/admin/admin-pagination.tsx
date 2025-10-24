import React, { memo, useCallback } from 'react';

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemType?: string;
}

const AdminPagination = memo(function AdminPagination({ 
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage, 
    onPageChange,
    itemType = "results"
}: AdminPaginationProps) {
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const handlePrevious = useCallback(() => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    const handlePageClick = useCallback((page: number) => {
        onPageChange(page);
    }, [onPageChange]);

    const getVisiblePages = useCallback(() => {
        const maxVisible = 5;
        const pages: (number | 'ellipsis')[] = [];
        
        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage <= 3) {
                // Show first few pages
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                if (totalPages > 4) {
                    pages.push('ellipsis');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                // Show last few pages
                if (totalPages > 4) {
                    pages.push('ellipsis');
                }
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    if (i > 1) pages.push(i);
                }
            } else {
                // Show pages around current
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }
        
        return pages;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) {
        return null;
    }

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-between mt-8 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {endIndex} of {totalItems} {itemType}
            </div>
            <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300'
                    }`}
                    aria-label="Previous page"
                >
                    Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                    {visiblePages.map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                    currentPage === page
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300'
                                }`}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300'
                    }`}
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </div>
    );
});

export default AdminPagination;