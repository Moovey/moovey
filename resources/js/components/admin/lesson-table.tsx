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
        <div className="space-y-4">
            {lessons.map((lesson) => {
                const isLoading = actionStates[lesson.id] || false;
                
                return (
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
                                <p className="text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>🎓 {lesson.lesson_stage}</span>
                                    <span>⏱️ {lesson.duration}</span>
                                    <span>📅 {formatDate(lesson.created_at)}</span>
                                    <span>📊 {lesson.difficulty}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                {isLoading && (
                                    <div className="flex items-center px-3 py-1">
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {!isLoading && (
                                    <>
                                        <Button 
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            onClick={() => updateLesson(lesson.id, { 
                                                status: lesson.status === 'Published' ? 'Draft' : 'Published' 
                                            })}
                                        >
                                            {lesson.status === 'Published' ? 'Unpublish' : 'Publish'}
                                        </Button>
                                        <Button 
                                            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                                            onClick={() => editLesson(lesson.id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            onClick={() => deleteLesson(lesson.id, lesson.title)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default LessonTable;