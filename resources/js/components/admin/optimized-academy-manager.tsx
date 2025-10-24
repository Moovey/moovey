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

// Loading skeleton components
const StatsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg mr-3"></div>
                    <div>
                        <div className="h-6 w-8 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-12 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const TableSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="h-6 w-48 bg-gray-300 rounded"></div>
                            <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
                            <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-gray-300 rounded mb-3"></div>
                        <div className="flex items-center space-x-4">
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            <div className="h-4 w-20 bg-gray-300 rounded"></div>
                            <div className="h-4 w-28 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        <div className="h-6 w-12 bg-gray-300 rounded"></div>
                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
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
        <div className="bg-white rounded-xl shadow-lg p-8 academy-management">
            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <span className="text-3xl mr-3">🎓</span>
                        Moovey Academy Management
                        {loading && (
                            <div className="ml-3 w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {stats.total} total lessons • {stats.published} published • {stats.drafts} drafts • {stats.archived} archived
                        {(statusFilter !== 'All Lessons' || debouncedSearchQuery.trim()) && (
                            <span className="text-blue-600"> • Showing {filteredLessons.length} results • Page {currentPage} of {totalPages}</span>
                        )}
                    </p>
                </div>
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search lessons by title, description, stage, or difficulty..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    {/* Filter and Create Button */}
                    <div className="flex space-x-3">
                        <div className="relative">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none px-4 py-2 pr-8 border-2 border-gray-400 rounded-lg bg-gray-100 text-black font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none shadow-md hover:border-gray-500 hover:bg-gray-200 transition-all"
                                style={{ color: '#000000' }}
                            >
                                <option value="All Lessons" style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>All Lessons</option>
                                <option value="Published" style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Published</option>
                                <option value="Draft" style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Draft</option>
                                <option value="Archived" style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Archived</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateNewLesson}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                            + Create New Lesson
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics with Suspense */}
            <Suspense fallback={<StatsSkeleton />}>
                <LessonStats lessons={allLessons} />
            </Suspense>

            {/* Lessons Table with Suspense */}
            <Suspense fallback={<TableSkeleton />}>
                <LessonTable lessons={paginatedLessons} onLessonUpdate={refreshLessonsData} />
            </Suspense>

            {/* Pagination with Suspense */}
            {totalPages > 1 && (
                <Suspense fallback={<div className="h-16 bg-gray-50 rounded-lg animate-pulse mt-8"></div>}>
                    <AdminPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredLessons.length}
                        itemsPerPage={lessonsPerPage}
                        onPageChange={handlePageChange}
                        itemType="lessons"
                    />
                </Suspense>
            )}

            {/* Empty States */}
            {paginatedLessons.length === 0 && filteredLessons.length === 0 && allLessons.length > 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
                    <p>
                        {searchQuery ? `No lessons match "${searchQuery}"` : `No ${statusFilter.toLowerCase()} lessons found`}
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <Button
                            onClick={clearFilters}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Clear All Filters
                        </Button>
                    </div>
                </div>
            )}

            {paginatedLessons.length === 0 && filteredLessons.length > 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">No lessons on this page</h3>
                    <p>Try going to a different page or adjusting your search.</p>
                    <Button
                        onClick={() => setCurrentPage(1)}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Go to First Page
                    </Button>
                </div>
            )}

            {allLessons.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-xl font-semibold mb-2">No Lessons Yet</h3>
                    <p>Start by creating your first Moovey Academy lesson!</p>
                    <Button
                        onClick={handleCreateNewLesson}
                        className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                        + Create Your First Lesson
                    </Button>
                </div>
            )}
        </div>
    );
}