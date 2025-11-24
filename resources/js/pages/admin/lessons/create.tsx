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

// Professional SVG icons for Lesson Creation
const getLessonIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        edit: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        document: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        rocket: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        draft: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        ),
        cancel: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        back: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        ),
        academy: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        )
    };
    
    return icons[name] || icons.edit;
};

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
            <div className="bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white py-4 sm:py-6 md:py-8">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                {getLessonIcon('academy', 'w-5 h-5 sm:w-6 sm:h-6 text-white')}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Create New Lesson</h1>
                                <p className="text-white/70 text-sm sm:text-base hidden xs:block">Admin - Moovey Academy Management</p>
                                <p className="text-white/70 text-sm sm:text-base xs:hidden">Academy Admin</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('admin.academy'))}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap self-start sm:self-center flex items-center space-x-2"
                        >
                            {getLessonIcon('back', 'w-4 h-4')}
                            <span className="hidden sm:inline">Back to Academy</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="py-4 sm:py-6 md:py-8 lg:py-12 bg-gradient-to-br from-white via-gray-50/30 to-[#17B7C7]/5 min-h-screen">
                <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg sm:rounded-xl">
                        <div className="p-4 sm:p-6 bg-white border-b border-gray-100">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                    {getLessonIcon('edit', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E]">Create New Lesson</h2>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">
                                Create a new lesson with rich content for your Moovey Academy.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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

                            {/* Duration and Difficulty Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                                                Creating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                {getLessonIcon('rocket', 'w-5 h-5')}
                                                <span>Create Lesson</span>
                                            </div>
                                        )}
                                    </Button>
                                    
                                    <div className="grid grid-cols-2 gap-3">
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
                            className="py-2.5 text-sm bg-white border-[#17B7C7] text-[#17B7C7] hover:bg-[#17B7C7]/10 hover:border-[#00BCD4] hover:text-[#00BCD4] transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                            {getLessonIcon('draft', 'w-4 h-4')}
                            <span>Draft</span>
                        </Button>                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.academy'))}
                                            className="py-2.5 text-sm bg-white border-[#1A237E] text-[#1A237E] hover:bg-[#1A237E]/10 hover:border-[#1A237E] transition-all flex items-center justify-center space-x-1"
                                        >
                                            {getLessonIcon('cancel', 'w-4 h-4')}
                                            <span>Cancel</span>
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('admin.academy'))}
                        className="bg-white border-[#1A237E] text-[#1A237E] hover:bg-[#1A237E]/10 hover:border-[#1A237E] transition-all flex items-center space-x-2"
                    >
                        {getLessonIcon('cancel', 'w-4 h-4')}
                        <span>Cancel</span>
                    </Button>                                    <div className="flex space-x-3">
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
                            className="bg-white border-[#17B7C7] text-[#17B7C7] hover:bg-[#17B7C7]/10 hover:border-[#00BCD4] hover:text-[#00BCD4] transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            {getLessonIcon('draft', 'w-4 h-4')}
                            <span>Save as Draft</span>
                        </Button>                                        <Button
                                            type="submit"
                                            disabled={processing || !data.title.trim()}
                                            className="min-w-[140px] bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white hover:from-[#139AAA] hover:to-[#0097A7] transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                        >
                                            {processing ? (
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Creating...
                                                </div>
                                            ) : (
                                                <>
                                                    {getLessonIcon('rocket', 'w-4 h-4')}
                                                    <span>Create Lesson</span>
                                                </>
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