import React, { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';

// Professional SVG icons for Lesson Table
const getLessonIcon = (name: string, className: string = "w-4 h-4") => {
    const icons: Record<string, React.JSX.Element> = {
        time: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        calendar: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        stage: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        ),
        draft: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        publish: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        edit: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        delete: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        )
    };
    
    return icons[name] || icons.stage;
};

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
                                    <span className="flex items-center">
                                        {getLessonIcon('time', 'w-3 h-3 mr-1')}
                                        {lesson.duration}
                                    </span>
                                    <span className="flex items-center">
                                        {getLessonIcon('calendar', 'w-3 h-3 mr-1')}
                                        {formatDate(lesson.created_at)}
                                    </span>
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
                                            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all touch-manipulation flex items-center justify-center ${
                                                lesson.status === 'Published' 
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                            onClick={() => updateLesson(lesson.id, { 
                                                status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                            })}
                                        >
                                            {lesson.status === 'Published' 
                                                ? <>{getLessonIcon('draft', 'w-4 h-4 mr-1')} Draft</>
                                                : <>{getLessonIcon('publish', 'w-4 h-4 mr-1')} Publish</>
                                            }
                                        </Button>
                                        <Button 
                                            className="flex-1 py-2.5 text-xs font-medium bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-all touch-manipulation flex items-center justify-center"
                                            onClick={() => editLesson(lesson.id)}
                                        >
                                            {getLessonIcon('edit', 'w-4 h-4 mr-1')} Edit
                                        </Button>
                                        <Button 
                                            className="px-4 py-2.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all touch-manipulation flex items-center justify-center"
                                            onClick={() => deleteLesson(lesson.id, lesson.title)}
                                        >
                                            {getLessonIcon('delete', 'w-4 h-4')}
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
                                            {getLessonIcon('stage', 'w-4 h-4 mr-1')}
                                            {lesson.lesson_stage}
                                        </span>
                                        <span className="flex items-center">
                                            {getLessonIcon('time', 'w-4 h-4 mr-1')}
                                            {lesson.duration}
                                        </span>
                                        <span className="flex items-center">
                                            {getLessonIcon('calendar', 'w-4 h-4 mr-1')}
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
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center ${
                                                    lesson.status === 'Published' 
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                                onClick={() => updateLesson(lesson.id, { 
                                                    status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                                })}
                                            >
                                                {lesson.status === 'Published' 
                                                    ? <>{getLessonIcon('draft', 'w-3 h-3 mr-1')} Unpublish</>
                                                    : <>{getLessonIcon('publish', 'w-3 h-3 mr-1')} Publish</>
                                                }
                                            </Button>
                                            <Button 
                                                className="px-3 py-1.5 text-xs font-medium bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-colors flex items-center"
                                                onClick={() => editLesson(lesson.id)}
                                            >
                                                {getLessonIcon('edit', 'w-3 h-3 mr-1')} Edit
                                            </Button>
                                            <Button 
                                                className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                                                onClick={() => deleteLesson(lesson.id, lesson.title)}
                                            >
                                                {getLessonIcon('delete', 'w-3 h-3 mr-1')} Delete
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