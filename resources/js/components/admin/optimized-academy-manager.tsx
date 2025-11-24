import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { useDebounce, useDebounceCallback } from '@/hooks/useDebounce';
import axios from 'axios';

// Lazy load components for better performance
const LessonStats = lazy(() => import('@/components/admin/lesson-stats'));
const LessonTable = lazy(() => import('@/components/admin/lesson-table'));
const AdminPagination = lazy(() => import('@/components/admin/admin-pagination'));

// Professional SVG icons for Academy Management
const getAcademyIcon = (name: string, className: string = "w-5 h-5") => {
    const icons: Record<string, React.JSX.Element> = {
        academy: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        ),
        lessons: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        ),
        published: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        drafts: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        archived: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
        plus: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
        ),
        search: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        close: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        chevronDown: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        ),
        success: (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        emptySearch: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8c2.027 0 3.9.756 5.291 2M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        emptyPage: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        rocket: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    };
    
    return icons[name] || icons.lessons;
};

// Simple loading components
const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 w-12 bg-gray-300 rounded"></div>
            </div>
        ))}
    </div>
);

const TableSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="h-5 w-3/4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-16 bg-gray-300 rounded"></div>
                        <div className="h-8 w-16 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Draft' | 'Published' | 'Archived';
    content_file_path?: string;
    thumbnail_file_path?: string;
    content_file_url?: string;
    thumbnail_file_url?: string;
    created_at: string;
    updated_at: string;
}

interface InitialFilters {
    search: string;
    status: string;
    page: number;
}

interface PageProps {
    lessons?: Lesson[];
    success?: string;
    errors?: Record<string, string>;
    initialFilters: InitialFilters;
    [key: string]: any;
}

export default function OptimizedAcademyManager() {
    const { lessons: initialLessons = [], success, errors, initialFilters } = usePage<PageProps>().props;
    
    // State management with initial values from server
    const [allLessons, setAllLessons] = useState<Lesson[]>(initialLessons); // Keep all lessons
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status);
    const [searchQuery, setSearchQuery] = useState<string>(initialFilters.search);
    const [currentPage, setCurrentPage] = useState<number>(initialFilters.page);
    const lessonsPerPage = 5;

    // Debounced search to avoid excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    // Client-side filtering for better performance
    const filteredLessons = useMemo(() => {
        let filtered = allLessons;
        
        // Filter by status
        if (statusFilter !== 'All Lessons') {
            filtered = filtered.filter(lesson => lesson.status === statusFilter);
        }
        
        // Filter by search query
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(lesson => 
                lesson.title.toLowerCase().includes(query) ||
                lesson.description.toLowerCase().includes(query) ||
                lesson.lesson_stage.toLowerCase().includes(query) ||
                lesson.difficulty.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }, [allLessons, statusFilter, debouncedSearchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
    const startIndex = (currentPage - 1) * lessonsPerPage;
    const endIndex = startIndex + lessonsPerPage;
    const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, debouncedSearchQuery]);

    // Debounced API call for partial data reload - only when search changes significantly
    const debouncedApiCall = useDebounceCallback(async (params: any) => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/api/lessons', { params });
            setAllLessons(response.data.lessons);
        } catch (error) {
            console.error('Failed to fetch lessons:', error);
            toast.error('Failed to refresh lesson data', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    }, 500);

    // Only refresh data when search query changes (not status filter)
    useEffect(() => {
        if (debouncedSearchQuery !== initialFilters.search) {
            debouncedApiCall({
                search: debouncedSearchQuery
            });
        }
    }, [debouncedSearchQuery, initialFilters.search]);

    // Memoized handlers for better performance
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Smooth scroll to top of lessons
        document.querySelector('.academy-management')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, []);

    const handleCreateNewLesson = useCallback(() => {
        router.visit(route('admin.lessons.create'));
    }, []);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setStatusFilter('All Lessons');
        setCurrentPage(1);
    }, []);

    // Refresh all lessons data from server
    const refreshLessonsData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/api/lessons');
            setAllLessons(response.data.lessons);
        } catch (error) {
            console.error('Failed to refresh lessons:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Statistics calculation based on all lessons
    const stats = useMemo(() => {
        return {
            total: allLessons.length,
            published: allLessons.filter(l => l.status === 'Published').length,
            drafts: allLessons.filter(l => l.status === 'Draft').length,
            archived: allLessons.filter(l => l.status === 'Archived').length
        };
    }, [allLessons]);

    return (
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-[#17B7C7]/5 min-h-screen academy-management">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-[#17B7C7] text-gray-800 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#17B7C7] rounded-full flex items-center justify-center mr-3">
                                {getAcademyIcon('success', 'w-5 h-5 text-white')}
                            </div>
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}
                
                {/* Header */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start md:items-center sm:justify-between">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A237E] flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 md:mr-4 flex-shrink-0">
                                    {getAcademyIcon('academy', 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white')}
                                </div>
                                <span className="leading-tight">Academy Management</span>
                                {loading && (
                                    <div className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-[#17B7C7] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                )}
                            </h1>
                            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                                Manage your Moovey Academy lessons
                            </p>
                        </div>
                        
                        <Button
                            onClick={handleCreateNewLesson}
                            className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:from-[#139AAA] hover:to-[#0097A7] transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base whitespace-nowrap self-start sm:self-center flex items-center"
                        >
                            {getAcademyIcon('plus', 'w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2')}
                            <span className="hidden xs:inline">Create New </span>Lesson
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                {getAcademyIcon('lessons', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A237E] truncate">{stats.total}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Lessons</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                {getAcademyIcon('published', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A237E] truncate">{stats.published}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Published</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                {getAcademyIcon('drafts', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A237E] truncate">{stats.drafts}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Drafts</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                {getAcademyIcon('archived', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A237E] truncate">{stats.archived}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Archived</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 md:gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {getAcademyIcon('search', 'h-4 w-4 sm:h-5 sm:w-5 text-gray-400')}
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search lessons..."
                                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#17B7C7] focus:ring-2 focus:ring-[#17B7C7]/20 focus:outline-none transition-all text-sm sm:text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 touch-manipulation"
                                >
                                    {getAcademyIcon('close', 'h-4 w-4 sm:h-5 sm:w-5')}
                                </button>
                            )}
                        </div>
                        
                        {/* Status Filter */}
                        <div className="relative sm:min-w-[140px] md:min-w-[160px]">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full px-3 sm:px-4 py-2.5 sm:py-2 pr-8 sm:pr-8 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-[#17B7C7] focus:ring-2 focus:ring-[#17B7C7]/20 focus:outline-none transition-all text-sm sm:text-base touch-manipulation"
                            >
                                <option value="All Lessons">All Lessons</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Drafts</option>
                                <option value="Archived">Archived</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                {getAcademyIcon('chevronDown', 'w-4 h-4 text-gray-500')}
                            </div>
                        </div>
                    </div>
                    
                    {/* Results info */}
                    {(statusFilter !== 'All Lessons' || debouncedSearchQuery.trim()) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Showing {filteredLessons.length} results
                                {totalPages > 1 && (
                                    <span className="hidden xs:inline"> • Page {currentPage} of {totalPages}</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Lessons Table */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Suspense fallback={<TableSkeleton />}>
                        <LessonTable lessons={paginatedLessons} onLessonUpdate={refreshLessonsData} />
                    </Suspense>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 sm:mt-6">
                        <Suspense fallback={<div className="h-12 sm:h-16 bg-gray-50 rounded-lg animate-pulse"></div>}>
                            <AdminPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredLessons.length}
                                itemsPerPage={lessonsPerPage}
                                onPageChange={handlePageChange}
                                itemType="lessons"
                            />
                        </Suspense>
                    </div>
                )}

                {/* Empty States */}
                {paginatedLessons.length === 0 && filteredLessons.length === 0 && allLessons.length > 0 && !loading && (
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            {getAcademyIcon('emptySearch', 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white')}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-[#1A237E] mb-2 sm:mb-3">No lessons found</h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                            {searchQuery ? `No lessons match "${searchQuery}"` : `No ${statusFilter.toLowerCase()} lessons found`}
                        </p>
                        <Button
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:from-[#139AAA] hover:to-[#0097A7] transition-all text-sm sm:text-base touch-manipulation"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}

                {paginatedLessons.length === 0 && filteredLessons.length > 0 && !loading && (
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            {getAcademyIcon('emptyPage', 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white')}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-[#1A237E] mb-2 sm:mb-3">No lessons on this page</h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">Try going to a different page or adjusting your search.</p>
                        <Button
                            onClick={() => setCurrentPage(1)}
                            className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:from-[#139AAA] hover:to-[#0097A7] transition-all text-sm sm:text-base touch-manipulation"
                        >
                            Go to First Page
                        </Button>
                    </div>
                )}

                {allLessons.length === 0 && !loading && (
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            {getAcademyIcon('academy', 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-white')}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#1A237E] mb-2 sm:mb-3">Welcome to Moovey Academy</h3>
                        <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-2 sm:px-4">Start by creating your first lesson to help house movers succeed!</p>
                        <Button
                            onClick={handleCreateNewLesson}
                            className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:from-[#139AAA] hover:to-[#0097A7] transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg touch-manipulation flex items-center justify-center"
                        >
                            {getAcademyIcon('rocket', 'w-5 h-5 sm:w-6 sm:h-6 mr-2')}
                            Create Your First Lesson
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}