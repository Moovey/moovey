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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">✏️</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Edit: {lesson.title}</h1>
                                <p className="text-blue-100">Admin - Moovey Academy Management</p>
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
                            <Heading title={`Edit: ${lesson.title}`} />
                            <p className="mt-2 text-sm text-gray-600">
                                Update the lesson content and settings.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} onClick={handleFormClick} className="p-6 space-y-6">
                            {/* Title Field */}
                            <div>
                                <Label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
                                    Lesson Title
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                                    placeholder="Enter lesson title..."
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Description Field */}
                            <div>
                                <Label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                                    placeholder="Brief description of the lesson..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Lesson Stage Field */}
                            <div>
                                <Label htmlFor="lesson_stage" className="block text-sm font-bold text-gray-900 mb-2">
                                    Lesson Stage
                                </Label>
                                <select
                                    id="lesson_stage"
                                    value={data.lesson_stage}
                                    onChange={(e) => setData('lesson_stage', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="duration" className="block text-sm font-bold text-gray-900 mb-2">
                                        Duration
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="text"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                                        placeholder="e.g., 15 mins"
                                        required
                                    />
                                    <InputError message={errors.duration} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="difficulty" className="block text-sm font-bold text-gray-900 mb-2">
                                        Difficulty Level
                                    </Label>
                                    <select
                                        id="difficulty"
                                        value={data.difficulty}
                                        onChange={(e) => setData('difficulty', e.target.value as any)}
                                        className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="Beginner" className="text-gray-900">Beginner</option>
                                        <option value="Intermediate" className="text-gray-900">Intermediate</option>
                                        <option value="Advanced" className="text-gray-900">Advanced</option>
                                    </select>
                                    <InputError message={errors.difficulty} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2">
                                        Status
                                    </Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                <Label className="block text-sm font-bold text-gray-900 mb-2">
                                    Lesson Content
                                </Label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <RichTextEditor
                                        content={data.content_html}
                                        onChange={handleContentChange}
                                        placeholder="Start writing your lesson content here..."
                                    />
                                </div>
                                <InputError message={errors.content_html} className="mt-2" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Use the toolbar above to format your content. You can add images, links, lists, and more.
                                </p>
                            </div>

                            {/* Current Files Info (if any) */}
                            {(lesson.content_file_path || lesson.thumbnail_file_path) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Current Files:</h4>
                                    <div className="space-y-1 text-sm text-blue-800">
                                        {lesson.content_file_path && (
                                            <p>📄 Content File: {lesson.content_file_path.split('/').pop()}</p>
                                        )}
                                        {lesson.thumbnail_file_path && (
                                            <p>🖼️ Thumbnail: {lesson.thumbnail_file_path.split('/').pop()}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <div className="flex space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.academy'))}
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
                                    >
                                        Preview Lesson
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.title.trim()}
                                        className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                                    >
                                        {processing ? 'Updating...' : 'Update Lesson'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}