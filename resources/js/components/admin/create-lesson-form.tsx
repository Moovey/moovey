import React from 'react';
import { useForm } from '@inertiajs/react';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface CreateLessonFormProps {
    onSuccess?: () => void;
}

export default function CreateLessonForm({ onSuccess }: CreateLessonFormProps) {
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
        
        post(route('admin.lessons.store'), {
            onSuccess: () => {
                reset();
                if (onSuccess) onSuccess();
            },
        });
    };

    const handleContentChange = (content: string) => {
        setData('content_html', content);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-red-600 flex items-center">
                    <span className="text-3xl mr-3">✏️</span>
                    Create New Lesson
                </h2>
                <p className="mt-2 text-gray-600">
                    Create a new lesson with rich content for your academy.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field */}
                <div>
                    <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Lesson Title
                    </Label>
                    <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter lesson title..."
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                {/* Description Field */}
                <div>
                    <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full"
                        placeholder="Brief description of the lesson..."
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                {/* Lesson Stage Field */}
                <div>
                    <Label htmlFor="lesson_stage" className="block text-sm font-medium text-gray-700">
                        Lesson Stage
                    </Label>
                    <select
                        id="lesson_stage"
                        value={data.lesson_stage}
                        onChange={(e) => setData('lesson_stage', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    >
                        <option value="">Select a lesson stage...</option>
                        {lessonStages.map((stage, index) => (
                            <option key={index} value={stage}>
                                {stage}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.lesson_stage} className="mt-2" />
                </div>

                {/* Duration and Difficulty Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                            Duration
                        </Label>
                        <Input
                            id="duration"
                            type="text"
                            value={data.duration}
                            onChange={(e) => setData('duration', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="e.g., 15 mins"
                            required
                        />
                        <InputError message={errors.duration} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                            Difficulty Level
                        </Label>
                        <select
                            id="difficulty"
                            value={data.difficulty}
                            onChange={(e) => setData('difficulty', e.target.value as any)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <InputError message={errors.difficulty} className="mt-2" />
                    </div>
                </div>

                {/* Rich Text Content */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Content
                    </Label>
                    <RichTextEditor
                        content={data.content_html}
                        onChange={handleContentChange}
                        placeholder="Start writing your lesson content here..."
                    />
                    <InputError message={errors.content_html} className="mt-2" />
                    <p className="mt-2 text-sm text-gray-500">
                        Use the toolbar above to format your content. You can add images, links, lists, and more.
                    </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => reset()}
                    >
                        Reset Form
                    </Button>
                    
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // Save as draft logic could go here
                                console.log('Save as draft');
                            }}
                            disabled={processing}
                        >
                            Save as Draft
                        </Button>
                        
                        <Button
                            type="submit"
                            disabled={processing || !data.title.trim()}
                            className="min-w-[120px] bg-red-600 hover:bg-red-700"
                        >
                            {processing ? 'Creating...' : 'Create Lesson'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}