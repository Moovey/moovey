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
                // Show first 5 pages (1, 2, 3, 4, 5)
                for (let i = 2; i <= Math.min(5, totalPages); i++) {
                    pages.push(i);
                }
                if (totalPages > 5) {
                    pages.push('ellipsis');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                // Show last 5 pages
                if (totalPages > 5) {
                    pages.push('ellipsis');
                }
                for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
                    if (i > 1) pages.push(i);
                }
            } else {
                // Show current page and 2 pages on each side (5 total)
                pages.push('ellipsis');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
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
        <div>
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {/* Page info */}
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                            Page {currentPage} of {totalPages}
                        </p>
                        <p className="text-xs text-gray-500">
                            {startIndex + 1}-{endIndex} of {totalItems} {itemType}
                        </p>
                    </div>
                    
                    {/* Navigation buttons */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                                currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white hover:from-[#139AAA] hover:to-[#0097A7] shadow-sm'
                            }`}
                            aria-label="Previous page"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Prev
                        </button>
                        
                        {/* Current page indicator */}
                        <div className="px-4 py-2 bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white rounded-lg font-bold text-sm min-w-[50px] text-center">
                            {currentPage} / {totalPages}
                        </div>
                        
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white hover:from-[#139AAA] hover:to-[#0097A7] shadow-sm'
                            }`}
                            aria-label="Next page"
                        >
                            Next
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Quick jump for many pages */}
                    {totalPages > 5 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-500">Go to:</span>
                                <select
                                    value={currentPage}
                                    onChange={(e) => handlePageClick(parseInt(e.target.value))}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:border-[#17B7C7] focus:ring-1 focus:ring-[#17B7C7] focus:outline-none"
                                >
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <option key={page} value={page}>Page {page}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {endIndex} of {totalItems} {itemType}
                </div>
                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] border border-gray-300 hover:border-[#17B7C7]'
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
                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
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
                                            ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] border border-gray-300 hover:border-[#17B7C7]'
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
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] border border-gray-300 hover:border-[#17B7C7]'
                        }`}
                        aria-label="Next page"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
});

export default AdminPagination;