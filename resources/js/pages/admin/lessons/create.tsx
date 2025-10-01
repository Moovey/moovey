import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { toast } from 'react-toastify';

interface CreateLessonProps {
    // Add any props if needed
}

export default function CreateLesson({}: CreateLessonProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        lesson_stage: '',
        duration: '',
        difficulty: 'Beginner' as const,
        content_html: '',
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
        
        // Show loading toast
        const loadingToast = toast.loading('Creating lesson...');
        
        post(route('admin.lessons.store'), {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Lesson created successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                // Redirect will be handled by Inertia
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                toast.error('Failed to create lesson. Please check the form and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            },
        });
    };

    const handleContentChange = (content: string) => {
        setData('content_html', content);
    };

    return (
        <DashboardLayout>
            <Head title="Create New Lesson" />

            {/* Admin Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">✏️</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Create New Lesson</h1>
                                <p className="text-red-100">Admin - Moovey Academy Management</p>
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Lesson</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Create a new lesson with rich content for your academy.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500/20"
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
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500/20"
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
                                    className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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

                            {/* Duration and Difficulty Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="duration" className="block text-sm font-bold text-gray-900 mb-2">
                                        Duration
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="text"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500/20"
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
                                        className="mt-1 block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    >
                                        <option value="Beginner" className="text-gray-900">Beginner</option>
                                        <option value="Intermediate" className="text-gray-900">Intermediate</option>
                                        <option value="Advanced" className="text-gray-900">Advanced</option>
                                    </select>
                                    <InputError message={errors.difficulty} className="mt-2" />
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

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.academy'))}
                                >
                                    Cancel
                                </Button>
                                
                                <div className="flex space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            toast.info('Save as draft functionality coming soon!', {
                                                position: "top-right",
                                                autoClose: 3000,
                                            });
                                        }}
                                        disabled={processing}
                                    >
                                        Save as Draft
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.title.trim()}
                                        className="min-w-[120px]"
                                    >
                                        {processing ? 'Creating...' : 'Create Lesson'}
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