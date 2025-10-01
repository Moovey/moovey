import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';

interface Lesson {
    id: number;
    title: string;
    description?: string;
    lesson_stage?: string;
    duration?: string;
    difficulty?: string;
    lesson_order?: number;
    content_html: string;
    created_at: string;
    updated_at: string;
}

interface UserProgress {
    is_completed: boolean;
    progress_percentage: number;
    started_at?: string;
    completed_at?: string;
}

interface LessonNavigation {
    id: number;
    title: string;
    is_completed?: boolean;
    is_accessible?: boolean;
}

interface LessonViewProps {
    lesson: Lesson;
    userProgress?: UserProgress;
    previousLesson?: LessonNavigation;
    nextLesson?: LessonNavigation;
    isAuthenticated: boolean;
    canMarkComplete: boolean;
}

export default function LessonView({ 
    lesson, 
    userProgress, 
    previousLesson, 
    nextLesson, 
    isAuthenticated, 
    canMarkComplete 
}: LessonViewProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(userProgress?.is_completed || false);
    
    // Check if this is an admin view based on current route
    const isAdminView = window.location.pathname.includes('/admin/');

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleMarkComplete = async () => {
        if (!canMarkComplete || isCompleted || isCompleting) return;
        
        setIsCompleting(true);
        
        try {
            const response = await fetch(route('lessons.complete', lesson.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setIsCompleted(true);
                
                // Show success message
                if (data.nextLesson && data.nextLesson.is_accessible) {
                    // Optional: Auto-redirect to next lesson or show next lesson button
                    if (confirm(`Lesson completed! Would you like to continue to "${data.nextLesson.title}"?`)) {
                        router.visit(route('lessons.show', data.nextLesson.id));
                    }
                } else {
                    alert('Lesson completed successfully!');
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to mark lesson as complete');
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            alert('Failed to mark lesson as complete');
        } finally {
            setIsCompleting(false);
        }
    };

    // Simple wrapper for consistent styling without sidebar
    const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );

    // For admin view, keep the original layout
    if (isAdminView) {
        return (
            <DashboardLayout>
                <Head title={lesson.title} />

                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">📖</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                                    <p className="text-white/80">
                                        Admin View - Moovey Academy
                                        {lesson.lesson_stage && ` - ${lesson.lesson_stage}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.academy'))}
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                    ← Back to Academy
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            {/* Lesson Header */}
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
                                {lesson.description && (
                                    <p className="mt-2 text-lg text-gray-600">
                                        {lesson.description}
                                    </p>
                                )}
                                
                                {/* Lesson Meta Information */}
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {lesson.lesson_stage && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Stage:</span>
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {lesson.lesson_stage}
                                            </span>
                                        </div>
                                    )}
                                    {lesson.duration && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Duration:</span>
                                            <span className="text-sm text-gray-900">{lesson.duration}</span>
                                        </div>
                                    )}
                                    {lesson.difficulty && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                                                {lesson.difficulty}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4 text-sm text-gray-500">
                                    Created: {new Date(lesson.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            {/* Lesson Content */}
                            <div className="p-6">
                                <div 
                                    className="prose prose-lg max-w-none text-gray-900 leading-relaxed
                                               [&_h1]:text-gray-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                                               [&_h2]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6
                                               [&_h3]:text-gray-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
                                               [&_p]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed
                                               [&_ul]:text-gray-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:list-inside
                                               [&_ol]:text-gray-900 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:list-inside
                                               [&_li]:text-gray-900 [&_li]:mb-1
                                               [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:border [&_img]:border-gray-200
                                               [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
                                               [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                                               [&_strong]:font-bold [&_strong]:text-gray-900
                                               [&_em]:italic"
                                    dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                                />
                            </div>

                            {/* Lesson Footer */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Last updated: {new Date(lesson.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.academy'))}
                                        >
                                            ← Back to Academy
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            onClick={() => window.print()}
                                        >
                                            🖨️ Print
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // For housemover view, use simple wrapper without sidebar
    return (
        <LayoutWrapper>
            <Head title={lesson.title} />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => router.visit(route('academy'))}
                            className="flex items-center text-[#00BCD4] hover:text-[#0097A7] font-medium mb-4"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Academy
                        </button>
                        
                        <div className="flex items-center space-x-6 mb-6">
                            {/* Lesson Icon */}
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-lg">
                                <span className="text-3xl">📖</span>
                            </div>
                            
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {lesson.title}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {lesson.difficulty && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
                                            {lesson.difficulty}
                                        </span>
                                    )}
                                    {lesson.duration && (
                                        <span className="font-medium">{lesson.duration}</span>
                                    )}
                                    {lesson.lesson_stage && (
                                        <span>{lesson.lesson_stage}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Lesson Description */}
                        {lesson.description && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">About this lesson</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {lesson.description}
                                </p>
                            </div>
                        )}

                        {/* Progress Indicator for authenticated users */}
                        {isAuthenticated && userProgress && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            isCompleted ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                        }`}>
                                            {isCompleted ? '✓' : '📖'}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {isCompleted ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    {userProgress.started_at && (
                                        <div className="text-sm text-gray-600">
                                            Started: {new Date(userProgress.started_at).toLocaleDateString()}
                                            {isCompleted && userProgress.completed_at && (
                                                <span> • Completed: {new Date(userProgress.completed_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lesson Content */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Lesson Content</h3>
                        </div>
                        <div className="p-6">
                            <div 
                                className="prose prose-lg max-w-none text-gray-900 leading-relaxed
                                           [&_h1]:text-gray-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                                           [&_h2]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6
                                           [&_h3]:text-gray-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
                                           [&_p]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed
                                           [&_ul]:text-gray-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ul]:pl-2
                                           [&_ol]:text-gray-900 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_ol]:pl-2
                                           [&_li]:text-gray-900 [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:pl-1
                                           [&_ul_ul]:mt-2 [&_ul_ul]:mb-2 [&_ul_ul]:ml-4
                                           [&_ol_ol]:mt-2 [&_ol_ol]:mb-2 [&_ol_ol]:ml-4
                                           [&_ul_li]:marker:text-gray-600
                                           [&_ol_li]:marker:text-gray-600 [&_ol_li]:marker:font-semibold
                                           [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:border [&_img]:border-gray-200
                                           [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
                                           [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                                           [&_strong]:font-bold [&_strong]:text-gray-900
                                           [&_em]:italic"
                                dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isAuthenticated && (
                        <div className="mt-8 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={() => router.visit(route('academy'))}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    ← Back to Academy
                                </button>
                                
                                {/* Previous Lesson */}
                                {previousLesson && (
                                    <button 
                                        onClick={() => router.visit(route('lessons.show', previousLesson.id))}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        ← {previousLesson.title.length > 20 ? previousLesson.title.substring(0, 20) + '...' : previousLesson.title}
                                    </button>
                                )}
                                
                                {/* Complete Lesson */}
                                {!isCompleted && canMarkComplete && (
                                    <button 
                                        onClick={handleMarkComplete}
                                        disabled={isCompleting}
                                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {isCompleting ? 'Completing...' : 'Complete Lesson'}
                                    </button>
                                )}
                                
                                {/* Already Completed */}
                                {isCompleted && (
                                    <div className="flex-1 bg-green-100 text-green-800 py-3 px-6 rounded-xl font-semibold text-center">
                                        ✓ Completed
                                    </div>
                                )}
                                
                                {/* Next Lesson */}
                                {nextLesson && nextLesson.is_accessible && (
                                    <button 
                                        onClick={() => router.visit(route('lessons.show', nextLesson.id))}
                                        className="flex-1 bg-[#00BCD4] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0097A7] transition-colors"
                                    >
                                        {nextLesson.title.length > 20 ? nextLesson.title.substring(0, 20) + '...' : nextLesson.title} →
                                    </button>
                                )}
                                
                                {nextLesson && !nextLesson.is_accessible && (
                                    <div className="flex-1 bg-gray-100 text-gray-500 py-3 px-6 rounded-xl font-semibold text-center opacity-50">
                                        🔒 {nextLesson.title.length > 15 ? nextLesson.title.substring(0, 15) + '...' : nextLesson.title}
                                    </div>
                                )}
                            </div>
                            
                            {/* Completion section for authenticated users */}
                            {canMarkComplete && !isCompleted && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-green-800">Ready to complete this lesson?</h4>
                                            <p className="text-sm text-green-600">Mark this lesson as complete to unlock the next one.</p>
                                        </div>
                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={isCompleting}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {isCompleting ? 'Completing...' : 'Complete Lesson'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Already completed message */}
                            {isCompleted && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm">✓</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-800">Lesson Completed!</h4>
                                            <p className="text-sm text-blue-600">Great job! You've successfully completed this lesson.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    body {
                        background: white !important;
                    }
                    
                    .prose img {
                        max-width: 100% !important;
                        height: auto !important;
                        page-break-inside: avoid;
                    }
                    
                    .prose h1, .prose h2, .prose h3 {
                        page-break-after: avoid;
                    }
                    
                    .prose p {
                        orphans: 3;
                        widows: 3;
                    }
                }
            `}</style>
        </LayoutWrapper>
    );
}