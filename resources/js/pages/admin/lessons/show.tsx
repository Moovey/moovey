import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

interface Lesson {
    id: number;
    title: string;
    description?: string;
    lesson_stage?: string;
    duration?: string;
    difficulty?: string;
    status?: string;
    content_html: string;
    created_at: string;
    updated_at: string;
}

interface AdminLessonViewProps {
    lesson: Lesson;
}

export default function AdminLessonView({ lesson }: AdminLessonViewProps) {
    return (
        <DashboardLayout>
            <Head title={`View: ${lesson.title}`} />

            {/* Admin Header - matching edit lesson style */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">👁️</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">View: {lesson.title}</h1>
                                <p className="text-green-100">Admin - Moovey Academy Management</p>
                            </div>
                        </div>
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

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <Heading title={`View: ${lesson.title}`} />
                            <p className="mt-2 text-sm text-gray-600">
                                Preview of lesson content and metadata.
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Title Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Lesson Title
                                </label>
                                <div className="mt-1 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                                    {lesson.title}
                                </div>
                            </div>

                            {/* Description Section */}
                            {lesson.description && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Description
                                    </label>
                                    <div className="mt-1 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                                        {lesson.description}
                                    </div>
                                </div>
                            )}

                            {/* Lesson Stage Section */}
                            {lesson.lesson_stage && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Lesson Stage
                                    </label>
                                    <div className="mt-1 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                                        {lesson.lesson_stage}
                                    </div>
                                </div>
                            )}

                            {/* Duration, Difficulty, and Status Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {lesson.duration && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Duration
                                        </label>
                                        <div className="mt-1 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                                            {lesson.duration}
                                        </div>
                                    </div>
                                )}

                                {lesson.difficulty && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Difficulty Level
                                        </label>
                                        <div className="mt-1 w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {lesson.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {lesson.status && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Status
                                        </label>
                                        <div className="mt-1 w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                lesson.status === 'Published' ? 'bg-green-100 text-green-800' :
                                                lesson.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {lesson.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Content */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Lesson Content
                                </label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                    <div className="p-4">
                                        <div 
                                            className="prose prose-lg max-w-none text-gray-900 leading-relaxed
                                                       [&_h1]:text-gray-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                                                       [&_h2]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6
                                                       [&_h3]:text-gray-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
                                                       [&_p]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed
                                                       [&_ul]:text-gray-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-6
                                                       [&_ol]:text-gray-900 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-6
                                                       [&_li]:text-gray-900 [&_li]:mb-1 [&_li]:ml-0
                                                       [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:block [&_img]:mx-auto
                                                       [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
                                                       [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                                                       [&_strong]:font-bold [&_strong]:text-gray-900
                                                       [&_em]:italic"
                                            dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                                            style={{
                                                // Ensure images are responsive
                                                '--tw-prose-img': 'max-width: 100%; height: auto;'
                                            } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    This is the content that users will see when they view this lesson.
                                </p>
                            </div>

                            {/* Metadata Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Lesson Metadata:</h4>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p>📅 Created: {new Date(lesson.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                    <p>🔄 Last Updated: {new Date(lesson.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                            </div>

                            {/* Action Buttons - matching edit lesson style */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                                
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.visit(route('lessons.show', lesson.id))}
                                    >
                                        👁️ Preview Lesson
                                    </Button>
                                    
                                    <Button
                                        variant="default"
                                        onClick={() => router.visit(route('admin.lessons.edit', lesson.id))}
                                        className="min-w-[120px] bg-green-600 hover:bg-green-700"
                                    >
                                        ✏️ Edit Lesson
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                    
                    /* Hide admin action buttons when printing */
                    .bg-gray-50 {
                        display: none !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}