import React, { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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

interface LessonTableProps {
    lessons: Lesson[];
    onLessonUpdate?: () => void; // Callback to refresh data
}

const LessonTable = memo(function LessonTable({ lessons, onLessonUpdate }: LessonTableProps) {
    const [actionStates, setActionStates] = useState<Record<number, boolean>>({});

    const getDifficultyColor = useCallback((difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }, []);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    const updateLesson = useCallback((id: number, updates: { status: string }) => {
        setActionStates(prev => ({ ...prev, [id]: true }));
        const loadingToast = toast.loading('Updating lesson status...');
        
        router.put(`/admin/lessons/${id}`, updates, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success(`Lesson ${updates.status.toLowerCase()} successfully!`, {
                    position: "top-right",
                    autoClose: 3000,
                });
                setActionStates(prev => ({ ...prev, [id]: false }));
                // Trigger parent refresh
                onLessonUpdate?.();
            },
            onError: () => {
                toast.dismiss(loadingToast);
                toast.error('Failed to update lesson status. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
                setActionStates(prev => ({ ...prev, [id]: false }));
            }
        });
    }, []);

    const deleteLesson = useCallback((id: number, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            setActionStates(prev => ({ ...prev, [id]: true }));
            const loadingToast = toast.loading('Deleting lesson...');
            
            router.delete(`/admin/lessons/${id}`, {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success('Lesson deleted successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    setActionStates(prev => ({ ...prev, [id]: false }));
                    // Trigger parent refresh
                    onLessonUpdate?.();
                },
                onError: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to delete lesson. Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                    setActionStates(prev => ({ ...prev, [id]: false }));
                }
            });
        }
    }, []);

    const editLesson = useCallback((id: number) => {
        router.visit(route('admin.lessons.edit', id));
    }, []);

    return (
        <div className="space-y-3 sm:space-y-4">
            {lessons.map((lesson) => {
                const isLoading = actionStates[lesson.id] || false;
                
                return (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                            {/* Header with title and status */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 pr-2">
                                    <h3 className="text-base font-semibold text-[#1A237E] leading-tight mb-2 line-clamp-2">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                            {lesson.status}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                                            {lesson.difficulty}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#17B7C7]/10 text-[#17B7C7]">
                                            {lesson.lesson_stage}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lesson.description}</p>
                            
                            {/* Meta info */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span>⏱️ {lesson.duration}</span>
                                    <span>📅 {formatDate(lesson.created_at)}</span>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                                {isLoading ? (
                                    <div className="flex items-center justify-center w-full py-2">
                                        <div className="w-5 h-5 border-2 border-[#17B7C7] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-2 text-sm text-gray-600">Updating...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Button 
                                            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all touch-manipulation ${
                                                lesson.status === 'Published' 
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                            onClick={() => updateLesson(lesson.id, { 
                                                status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                            })}
                                        >
                                            {lesson.status === 'Published' ? '📋 Draft' : '✅ Publish'}
                                        </Button>
                                        <Button 
                                            className="flex-1 py-2.5 text-xs font-medium bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-all touch-manipulation"
                                            onClick={() => editLesson(lesson.id)}
                                        >
                                            ✏️ Edit
                                        </Button>
                                        <Button 
                                            className="px-4 py-2.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all touch-manipulation"
                                            onClick={() => deleteLesson(lesson.id, lesson.title)}
                                        >
                                            🗑️
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tablet & Desktop Layout */}
                        <div className="hidden sm:block">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Title and badges */}
                                    <div className="flex items-start flex-wrap gap-2 mb-3">
                                        <h3 className="text-lg font-semibold text-[#1A237E] mr-2">{lesson.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                                {lesson.status}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                                                {lesson.difficulty}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#17B7C7]/10 text-[#17B7C7]">
                                                {lesson.lesson_stage}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    <p className="text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                                    
                                    {/* Meta information */}
                                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <span className="mr-1">🎓</span>
                                            {lesson.lesson_stage}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="mr-1">⏱️</span>
                                            {lesson.duration}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="mr-1">📅</span>
                                            {formatDate(lesson.created_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                    {isLoading ? (
                                        <div className="flex items-center px-4 py-2">
                                            <div className="w-4 h-4 border-2 border-[#17B7C7] border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span className="text-sm text-gray-600">Updating...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Button 
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    lesson.status === 'Published' 
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                                onClick={() => updateLesson(lesson.id, { 
                                                    status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                                })}
                                            >
                                                {lesson.status === 'Published' ? 'Unpublish' : 'Publish'}
                                            </Button>
                                            <Button 
                                                className="px-3 py-1.5 text-xs font-medium bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-colors"
                                                onClick={() => editLesson(lesson.id)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                onClick={() => deleteLesson(lesson.id, lesson.title)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default LessonTable;