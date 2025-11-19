import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import Heading from '@/components/heading';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { toast } from 'react-toastify';

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Draft' | 'Published' | 'Archived';
    content_html?: string;
    content_file_path?: string;
    thumbnail_file_path?: string;
    created_at: string;
    updated_at: string;
}

interface EditLessonProps {
    lesson: Lesson;
}

export default function EditLesson({ lesson }: EditLessonProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: lesson.title,
        description: lesson.description,
        lesson_stage: lesson.lesson_stage,
        duration: lesson.duration,
        difficulty: lesson.difficulty,
        status: lesson.status,
        content_html: lesson.content_html || '',
    });

    // Define the 9 lesson stages
    const lessonStages = [
        'Move Dreamer',
        'Plan Starter',
        'Moovey Critic',
        'Prep Pioneer',
        'Moovey Director',
        'Move Rockstar',
        'Home Navigator',
        'Settler Specialist',
        'Moovey Star'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const loadingToast = toast.loading('Updating lesson...');
        
        put(route('admin.lessons.update', lesson.id), {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Lesson updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                // Redirect will be handled by Inertia
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                toast.error('Failed to update lesson. Please check the form and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            },
        });
    };

    const handleContentChange = (content: string) => {
        setData('content_html', content);
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
            const loadingToast = toast.loading('Deleting lesson...');
            
            router.delete(route('admin.lessons.destroy', lesson.id), {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success('Lesson deleted successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    // Redirect will be handled by Inertia
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

    // Prevent form submission when clicking on editor content
    const handleFormClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Prevent form submission if clicking on editor content or images
        if (target.closest('.ProseMirror') || target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Edit Lesson: ${lesson.title}`} />

            {/* Admin Header */}
            <div className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white py-4 sm:py-6 md:py-8">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-xl sm:text-2xl">✏️</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">
                                    <span className="hidden sm:inline">Edit: </span>{lesson.title}
                                </h1>
                                <p className="text-[#17B7C7]/20 text-sm sm:text-base hidden xs:block truncate">Admin - Moovey Academy Management</p>
                                <p className="text-[#17B7C7]/20 text-sm xs:hidden">Editing Lesson</p>
                            </div>
                        </div>
                        <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('lessons.show', lesson.id))}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm px-3 py-2 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">👁️ Preview</span>
                                <span className="sm:hidden">👁️</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('admin.academy'))}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm px-3 py-2 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">← Back to Academy</span>
                                <span className="sm:hidden">← Back</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-4 sm:py-6 md:py-8 lg:py-12 bg-gradient-to-br from-white via-gray-50/30 to-[#17B7C7]/5 min-h-screen">
                <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg sm:rounded-xl">
                        <div className="p-4 sm:p-6 bg-white border-b border-gray-100">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                    <span className="text-lg sm:text-xl text-white">📝</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E] truncate">
                                        <span className="hidden sm:inline">Edit: </span>{lesson.title}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">
                                Update the lesson content and settings for your Moovey Academy.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} onClick={handleFormClick} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Title Field */}
                            <div>
                                <Label htmlFor="title" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                    Lesson Title
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-[#17B7C7] focus:ring-2 focus:ring-[#17B7C7]/20 focus:outline-none text-sm sm:text-base"
                                    placeholder="Enter lesson title..."
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Description Field */}
                            <div>
                                <Label htmlFor="description" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-[#17B7C7] focus:ring-2 focus:ring-[#17B7C7]/20 focus:outline-none text-sm sm:text-base resize-y"
                                    placeholder="Brief description of the lesson..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Lesson Stage Field */}
                            <div>
                                <Label htmlFor="lesson_stage" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                    Lesson Stage
                                </Label>
                                <select
                                    id="lesson_stage"
                                    value={data.lesson_stage}
                                    onChange={(e) => setData('lesson_stage', e.target.value)}
                                    className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#17B7C7]/20 focus:border-[#17B7C7] text-sm sm:text-base"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select a lesson stage...</option>
                                    {lessonStages.map((stage, index) => (
                                        <option key={index} value={stage} className="text-gray-900">
                                            {stage}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.lesson_stage} className="mt-2" />
                            </div>

                            {/* Duration, Difficulty, and Status Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div>
                                    <Label htmlFor="duration" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                        Duration
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="text"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-[#17B7C7] focus:ring-2 focus:ring-[#17B7C7]/20 focus:outline-none text-sm sm:text-base"
                                        placeholder="e.g., 15 mins"
                                        required
                                    />
                                    <InputError message={errors.duration} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="difficulty" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                        Difficulty Level
                                    </Label>
                                    <select
                                        id="difficulty"
                                        value={data.difficulty}
                                        onChange={(e) => setData('difficulty', e.target.value as any)}
                                        className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#17B7C7]/20 focus:border-[#17B7C7] text-sm sm:text-base"
                                        required
                                    >
                                        <option value="Beginner" className="text-gray-900">Beginner</option>
                                        <option value="Intermediate" className="text-gray-900">Intermediate</option>
                                        <option value="Advanced" className="text-gray-900">Advanced</option>
                                    </select>
                                    <InputError message={errors.difficulty} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-1">
                                    <Label htmlFor="status" className="block text-sm font-semibold text-[#1A237E] mb-2">
                                        Status
                                    </Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="mt-1 block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#17B7C7]/20 focus:border-[#17B7C7] text-sm sm:text-base"
                                        required
                                    >
                                        <option value="Draft" className="text-gray-900">Draft</option>
                                        <option value="Published" className="text-gray-900">Published</option>
                                        <option value="Archived" className="text-gray-900">Archived</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </div>

                            {/* Rich Text Content */}
                            <div>
                                <Label className="block text-sm font-semibold text-[#1A237E] mb-2">
                                    Lesson Content
                                </Label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                                    <div className="min-h-[300px] sm:min-h-[400px]">
                                        <RichTextEditor
                                            content={data.content_html}
                                            onChange={handleContentChange}
                                            placeholder="Start writing your lesson content here..."
                                        />
                                    </div>
                                </div>
                                <InputError message={errors.content_html} className="mt-2" />
                                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                                    Use the toolbar above to format your content. You can add images, links, lists, and more.
                                </p>
                            </div>

                            {/* Current Files Info (if any) */}
                            {(lesson.content_file_path || lesson.thumbnail_file_path) && (
                                <div className="bg-gradient-to-r from-[#17B7C7]/10 to-[#00BCD4]/10 border border-[#17B7C7]/20 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-[#1A237E] mb-2 flex items-center">
                                        <span className="w-5 h-5 bg-[#17B7C7] rounded-full flex items-center justify-center mr-2">
                                            <span className="text-white text-xs">📁</span>
                                        </span>
                                        Current Files:
                                    </h4>
                                    <div className="space-y-1 text-sm text-[#1A237E]/80">
                                        {lesson.content_file_path && (
                                            <p className="flex items-center">
                                                <span className="mr-2">📄</span>
                                                <span className="break-all">Content File: {lesson.content_file_path.split('/').pop()}</span>
                                            </p>
                                        )}
                                        {lesson.thumbnail_file_path && (
                                            <p className="flex items-center">
                                                <span className="mr-2">🖼️</span>
                                                <span className="break-all">Thumbnail: {lesson.thumbnail_file_path.split('/').pop()}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="pt-4 sm:pt-6 border-t border-gray-100">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden space-y-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.title.trim()}
                                        className="w-full bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white py-3 rounded-lg font-semibold hover:from-[#139AAA] hover:to-[#0097A7] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <span className="mr-2">✨</span>
                                                Update Lesson
                                            </div>
                                        )}
                                    </Button>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.academy'))}
                                            className="py-2.5 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            ❌ Cancel
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('lessons.show', lesson.id))}
                                            className="py-2.5 text-sm border-[#17B7C7] text-[#17B7C7] hover:bg-[#17B7C7]/10"
                                        >
                                            👁️ Preview
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDelete}
                                            className="py-2.5 text-sm text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            🗑️ Delete
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center justify-between">
                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.academy'))}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDelete}
                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            🗑️ Delete Lesson
                                        </Button>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('lessons.show', lesson.id))}
                                            className="border-[#17B7C7] text-[#17B7C7] hover:bg-[#17B7C7]/10"
                                        >
                                            Preview Lesson
                                        </Button>
                                        
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.title.trim()}
                                            className="min-w-[140px] bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white hover:from-[#139AAA] hover:to-[#0097A7] transition-all transform hover:scale-105 shadow-lg"
                                        >
                                            {processing ? (
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Updating...
                                                </div>
                                            ) : (
                                                'Update Lesson'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}