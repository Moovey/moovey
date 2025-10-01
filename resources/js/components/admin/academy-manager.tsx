import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'react-toastify';

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

interface PageProps {
    lessons?: Lesson[];
    success?: string;
    errors?: Record<string, string>;
    [key: string]: any;
}

export default function AcademyManager() {
    const { lessons = [], success, errors } = usePage<PageProps>().props;
    const [statusFilter, setStatusFilter] = useState<string>('All Lessons');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const lessonsPerPage = 5;

    // Filter lessons based on selected status and search query
    const filteredLessons = useMemo(() => {
        let filtered = lessons;
        
        // Filter by status
        if (statusFilter !== 'All Lessons') {
            filtered = filtered.filter(lesson => lesson.status === statusFilter);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(lesson => 
                lesson.title.toLowerCase().includes(query) ||
                lesson.description.toLowerCase().includes(query) ||
                lesson.lesson_stage.toLowerCase().includes(query) ||
                lesson.difficulty.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }, [lessons, statusFilter, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
    const startIndex = (currentPage - 1) * lessonsPerPage;
    const endIndex = startIndex + lessonsPerPage;
    const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery]);

    const updateLesson = (id: number, updates: { status: string }) => {
        const loadingToast = toast.loading('Updating lesson status...');
        
        router.put(`/admin/lessons/${id}`, updates, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success(`Lesson ${updates.status.toLowerCase()} successfully!`, {
                    position: "top-right",
                    autoClose: 3000,
                });
            },
            onError: () => {
                toast.dismiss(loadingToast);
                toast.error('Failed to update lesson status. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        });
    };

    const deleteLesson = (id: number) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            const loadingToast = toast.loading('Deleting lesson...');
            
            router.delete(`/admin/lessons/${id}`, {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success('Lesson deleted successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                },
                onError: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to delete lesson. Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            });
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
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
            
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <span className="text-3xl mr-3">🎓</span>
                        Moovey Academy Management
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {lessons.length} total lessons • {lessons.filter(l => l.status === 'Published').length} published • {lessons.filter(l => l.status === 'Draft').length} drafts • {lessons.filter(l => l.status === 'Archived').length} archived
                        {(statusFilter !== 'All Lessons' || searchQuery.trim()) && (
                            <span className="text-blue-600"> • Showing {filteredLessons.length} results • Page {currentPage} of {totalPages}</span>
                        )}
                    </p>
                </div>
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
                            onClick={() => router.visit(route('admin.lessons.create'))}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                            + Create New Lesson
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
                {paginatedLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {lesson.lesson_stage}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                                        {lesson.difficulty}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                        {lesson.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">{lesson.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>🎓 {lesson.lesson_stage}</span>
                                    <span>⏱️ {lesson.duration}</span>
                                    <span>📅 {new Date(lesson.created_at).toLocaleDateString()}</span>
                                    <span>📊 {lesson.difficulty}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <Button 
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => {
                                        // Toggle status between Published and Draft
                                        updateLesson(lesson.id, { 
                                            status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                        });
                                    }}
                                >
                                    {lesson.status === 'Published' ? 'Unpublish' : 'Publish'}
                                </Button>
                                <Button 
                                    className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                                    onClick={() => {
                                        router.visit(route('admin.lessons.edit', lesson.id));
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
                                            deleteLesson(lesson.id);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredLessons.length)} of {filteredLessons.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
                            }`}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                                // Show first page, last page, current page, and pages around current page
                                const showPage = pageNumber === 1 || 
                                               pageNumber === totalPages || 
                                               Math.abs(pageNumber - currentPage) <= 1;
                                
                                if (!showPage) {
                                    // Show ellipsis for gaps
                                    if (pageNumber === 2 && currentPage > 4) {
                                        return <span key={pageNumber} className="px-2 py-2 text-gray-400">...</span>;
                                    }
                                    if (pageNumber === totalPages - 1 && currentPage < totalPages - 3) {
                                        return <span key={pageNumber} className="px-2 py-2 text-gray-400">...</span>;
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                            currentPage === pageNumber
                                                ? 'bg-red-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {paginatedLessons.length === 0 && filteredLessons.length === 0 && lessons.length > 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
                    <p>
                        {searchQuery ? `No lessons match "${searchQuery}"` : `No ${statusFilter.toLowerCase()} lessons found`}
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                        {searchQuery && (
                            <Button
                                onClick={() => setSearchQuery('')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Clear Search
                            </Button>
                        )}
                        {statusFilter !== 'All Lessons' && (
                            <Button
                                onClick={() => setStatusFilter('All Lessons')}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Show All Lessons
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {paginatedLessons.length === 0 && filteredLessons.length > 0 && (
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

            {lessons.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-xl font-semibold mb-2">No Lessons Yet</h3>
                    <p>Start by uploading your first Moovey Academy lesson!</p>
                </div>
            )}
        </div>
    );
}