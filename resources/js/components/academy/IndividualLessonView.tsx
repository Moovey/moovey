import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { ArrowLeft, Clock, Star, CheckCircle, ArrowRight, ArrowLeft as ArrowLeftIcon, FileText, Download, ExternalLink } from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: string;
    lesson_order: number;
    status: string;
    content_html?: string;
    content_file_url?: string;
    thumbnail_file_url?: string;
    created_at: string;
    updated_at: string;
    is_accessible: boolean;
    is_completed: boolean;
    progress_percentage: number;
    started_at?: string;
    completed_at?: string;
    has_previous: boolean;
    has_next: boolean;
}

interface StageProgress {
    total: number;
    completed: number;
    percentage: number;
}

interface IndividualLessonViewProps {
    lesson: Lesson;
    stageLessons?: Lesson[];
    stage?: string;
    stageBadge?: string;
    stageProgress?: StageProgress;
    isAuthenticated: boolean;
}

export default function IndividualLessonView({
    lesson,
    stageLessons = [],
    stage = '',
    stageBadge = '',
    stageProgress = { total: 0, completed: 0, percentage: 0 },
    isAuthenticated
}: IndividualLessonViewProps) {
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);

    // Add CSS animations to the document head
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fireworks {
                0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                100% { transform: scale(1) rotate(360deg); opacity: 0; }
            }
            .fireworks {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 4rem;
                animation: fireworks 2s ease-in-out;
                z-index: 1000;
                pointer-events: none;
            }
            .lesson-content h1, .lesson-content h2, .lesson-content h3 {
                color: #1f2937;
                margin-top: 2rem;
                margin-bottom: 1rem;
                font-weight: 700;
                line-height: 1.3;
            }
            .lesson-content h1 { font-size: 2.25rem; margin-top: 0; }
            .lesson-content h2 { font-size: 1.875rem; }
            .lesson-content h3 { font-size: 1.5rem; }
            .lesson-content h4 { font-size: 1.25rem; font-weight: 600; color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            .lesson-content p {
                margin-bottom: 1.25rem;
                line-height: 1.75;
                color: #374151;
                font-size: 1.125rem;
            }
            .lesson-content strong {
                font-weight: 600;
                color: #1f2937;
            }
            .lesson-content ul, .lesson-content ol {
                margin: 1.5rem 0;
                padding-left: 2rem;
            }
            .lesson-content li {
                margin-bottom: 0.75rem;
                color: #374151;
                line-height: 1.75;
                font-size: 1.125rem;
            }
            .lesson-content a {
                color: #17B7C7;
                text-decoration: underline;
                font-weight: 500;
                transition: color 0.2s;
            }
            .lesson-content a:hover {
                color: #139AAA;
                text-decoration: none;
            }
            .lesson-content blockquote {
                border-left: 4px solid #17B7C7;
                margin: 2rem 0;
                padding: 1rem 1.5rem;
                background: #f8fafc;
                border-radius: 0 0.5rem 0.5rem 0;
                font-style: italic;
                color: #475569;
            }
            .lesson-content code {
                background: #f1f5f9;
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                color: #475569;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .lesson-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'text-green-600 bg-green-100';
            case 'intermediate': return 'text-yellow-600 bg-yellow-100';
            case 'advanced': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleBackToStage = () => {
        router.visit('/academy');
    };

    const handleBackToLessons = () => {
        router.visit(`/academy/stage/${encodeURIComponent(stage)}`);
    };

    const handleMarkComplete = async () => {
        if (!isAuthenticated) {
            alert('Please log in to mark lessons as complete.');
            return;
        }

        if (lesson.is_completed) {
            alert('This lesson is already marked as complete! 🎉');
            return;
        }

        setIsMarkingComplete(true);

        try {
            const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setShowFireworks(true);
                    setTimeout(() => setShowFireworks(false), 2000);
                    
                    // Refresh the page to update lesson progress
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                } else {
                    alert(data.message || 'Failed to mark lesson as complete. Please try again.');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server responded with error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                alert(errorData.error || `Failed to mark lesson as complete (${response.status}). Please try again.`);
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            alert('An error occurred. Please check your connection and try again.');
        } finally {
            setIsMarkingComplete(false);
        }
    };

    const handleNextLesson = () => {
        if (!stageLessons || stageLessons.length === 0) return;
        const currentIndex = stageLessons.findIndex(l => l.id === lesson.id);
        if (currentIndex < stageLessons.length - 1) {
            const nextLesson = stageLessons[currentIndex + 1];
            router.visit(`/academy/lesson/${nextLesson.id}`);
        }
    };

    const handlePreviousLesson = () => {
        if (!stageLessons || stageLessons.length === 0) return;
        const currentIndex = stageLessons.findIndex(l => l.id === lesson.id);
        if (currentIndex > 0) {
            const prevLesson = stageLessons[currentIndex - 1];
            router.visit(`/academy/lesson/${prevLesson.id}`);
        }
    };

    const getCurrentLessonNavInfo = () => {
        if (!stageLessons || stageLessons.length === 0) {
            return {
                hasPrevious: false,
                hasNext: false,
                currentNumber: 1,
                totalLessons: 1
            };
        }
        const currentIndex = stageLessons.findIndex(l => l.id === lesson.id);
        return {
            hasPrevious: currentIndex > 0,
            hasNext: currentIndex < stageLessons.length - 1,
            currentNumber: currentIndex + 1,
            totalLessons: stageLessons.length
        };
    };

    const navInfo = getCurrentLessonNavInfo();

    return (
        <>
            <Head title={lesson.title}>
                <meta name="description" content={lesson.description} />
            </Head>

            {/* Fireworks overlay */}
            {showFireworks && (
                <div className="fireworks">🎉✨🎊</div>
            )}

            <div className="min-h-screen bg-white">
                <GlobalHeader currentPage="academy" />

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* Navigation */}
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 overflow-x-auto">
                        <button
                            onClick={() => router.visit('/academy')}
                            className="flex items-center gap-1 hover:text-[#17B7C7] transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Back to Academy</span>
                            <span className="xs:hidden">Academy</span>
                        </button>
                        <span className="text-gray-400">/</span>
                        <button
                            onClick={() => router.visit(`/academy/stage/${encodeURIComponent(stage)}`)}
                            className="hover:text-[#17B7C7] transition-colors truncate max-w-[120px] sm:max-w-none"
                            title={stage}
                        >
                            {stage}
                        </button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium flex-shrink-0">Lesson {lesson.lesson_order}</span>
                    </div>

                    <div className="py-4 sm:py-6 lg:py-8">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                            {/* Main Content */}
                            <div className="flex-1 min-w-0 order-2 lg:order-1">
                                {/* Mobile/Tablet Stage Overview */}
                                <div className="lg:hidden mb-6 sm:mb-8">
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                            <img 
                                                src={`/images/Badges/${stageBadge}`} 
                                                alt={`${stage} badge`}
                                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{stage}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    Lesson {lesson.lesson_order} of {stageProgress.total}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-base sm:text-lg font-bold text-[#17B7C7]">
                                                    {Math.round(stageProgress.percentage)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                            <div 
                                                className="bg-[#17B7C7] h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${stageProgress.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Title & Description */}
                                <div className="mb-8 sm:mb-10 lg:mb-12">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                                        {lesson.title}
                                    </h1>
                                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8">
                                        {lesson.description}
                                    </p>
                                    
                                    {/* Progress Bar */}
                                    {lesson.progress_percentage > 0 && (
                                        <div className="mb-6 sm:mb-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs sm:text-sm font-medium text-gray-700">Reading Progress</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-900">{lesson.progress_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                                <div 
                                                    className="bg-[#17B7C7] h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${lesson.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                        {/* Main Content */}
                        <div className="prose prose-sm sm:prose-base lg:prose-lg prose-gray max-w-none mb-12 sm:mb-14 lg:mb-16">
                            {lesson.content_html ? (
                                <div 
                                    className="lesson-content"
                                    dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                                />
                            ) : lesson.content_file_url ? (
                                <div className="not-prose">
                                    {lesson.content_file_url.toLowerCase().includes('.pdf') ? (
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <h3 className="font-medium text-blue-900 text-sm sm:text-base">PDF Lesson Content</h3>
                                                            <p className="text-xs sm:text-sm text-blue-700">View the lesson material below or download for offline reading</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={lesson.content_file_url}
                                                        download
                                                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ height: '60vh', minHeight: '400px' }}>
                                                <iframe
                                                    src={`${lesson.content_file_url}#view=FitH&toolbar=0`}
                                                    className="w-full h-full"
                                                    title={`${lesson.title} Content`}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Downloadable Content</h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                                                This lesson includes downloadable materials to help you learn.
                                            </p>
                                            <a
                                                href={lesson.content_file_url}
                                                download
                                                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-colors font-semibold text-sm sm:text-base"
                                            >
                                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                                Download Lesson Content
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg">
                                    <div className="text-6xl mb-6">📚</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Content Coming Soon</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">This lesson's content is being prepared and will be available shortly.</p>
                                </div>
                            )}
                        </div>

                        {/* Complete Lesson Section */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8 mb-12 sm:mb-14 lg:mb-16">
                            <div className="text-center">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                    {lesson.is_completed ? 'Lesson Completed!' : 'Finished Reading?'}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-2">
                                    {lesson.is_completed 
                                        ? 'Great job! You can review this lesson anytime or continue with the next one.' 
                                        : 'Mark this lesson as complete when you\'re ready to move forward in your learning journey.'
                                    }
                                </p>
                                
                                <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4">
                                    {lesson.content_file_url && (
                                        <a
                                            href={lesson.content_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Content
                                        </a>
                                    )}
                                    
                                    {!lesson.is_completed && isAuthenticated && (
                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={isMarkingComplete}
                                            className="px-8 py-3 bg-[#17B7C7] text-white rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isMarkingComplete ? 'Marking Complete...' : '✓ Mark as Complete'}
                                        </button>
                                    )}
                                    
                                    {lesson.is_completed && (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-lg">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lesson Navigation */}
                        <div className="border-t border-gray-200 pt-8 sm:pt-10 lg:pt-12 mb-12 sm:mb-14 lg:mb-16">
                            {/* Mobile Navigation */}
                            <div className="block sm:hidden space-y-4">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 mb-1">Lesson Progress</div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {navInfo.currentNumber} <span className="text-gray-400">of</span> {navInfo.totalLessons}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <div className="flex-1">
                                        {navInfo.hasPrevious ? (
                                            <button
                                                onClick={handlePreviousLesson}
                                                className="flex items-center gap-2 w-full p-3 text-gray-600 hover:text-[#17B7C7] transition-colors group bg-gray-50 rounded-lg"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#17B7C7] group-hover:text-white transition-colors flex-shrink-0">
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <div className="text-xs text-gray-500 mb-0.5">Previous</div>
                                                    <div className="font-semibold text-sm truncate">Lesson {lesson.lesson_order - 1}</div>
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="flex-1"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {navInfo.hasNext ? (
                                            <button
                                                onClick={handleNextLesson}
                                                className="flex items-center gap-2 w-full p-3 text-gray-600 hover:text-[#17B7C7] transition-colors group bg-gray-50 rounded-lg justify-end"
                                            >
                                                <div className="text-right min-w-0">
                                                    <div className="text-xs text-gray-500 mb-0.5">Next</div>
                                                    <div className="font-semibold text-sm truncate">Lesson {lesson.lesson_order + 1}</div>
                                                </div>
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#17B7C7] group-hover:text-white transition-colors flex-shrink-0">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="flex-1"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop Navigation */}
                            <div className="hidden sm:flex items-center justify-between">
                                <div className="flex-1">
                                    {navInfo.hasPrevious && (
                                        <button
                                            onClick={handlePreviousLesson}
                                            className="flex items-center gap-3 sm:gap-4 text-gray-600 hover:text-[#17B7C7] transition-colors group"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#17B7C7] group-hover:text-white transition-colors">
                                                <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div>
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Previous Lesson</div>
                                                <div className="font-semibold text-sm sm:text-base">Lesson {lesson.lesson_order - 1}</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                                
                                <div className="text-center px-4 sm:px-8">
                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Lesson Progress</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {navInfo.currentNumber} <span className="text-gray-400">of</span> {navInfo.totalLessons}
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex justify-end">
                                    {navInfo.hasNext && (
                                        <button
                                            onClick={handleNextLesson}
                                            className="flex items-center gap-3 sm:gap-4 text-gray-600 hover:text-[#17B7C7] transition-colors group"
                                        >
                                            <div className="text-right">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Next Lesson</div>
                                                <div className="font-semibold text-sm sm:text-base">Lesson {lesson.lesson_order + 1}</div>
                                            </div>
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#17B7C7] group-hover:text-white transition-colors">
                                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                            </div>
                            
                            {/* Right Sidebar - Stage Lessons */}
                            <div className="w-full lg:w-64 flex-shrink-0 order-1 lg:order-2">
                                <div className="lg:sticky lg:top-24">
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                            <img 
                                                src={`/images/Badges/${stageBadge}`} 
                                                alt={`${stage} badge`}
                                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{stage}</h3>
                                                <p className="text-xs text-gray-600">
                                                    {stageProgress.completed} of {stageProgress.total} lessons
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 sm:mb-3">
                                            <div 
                                                className="bg-[#17B7C7] h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${stageProgress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 text-center">
                                            {Math.round(stageProgress.percentage)}% Complete
                                        </p>
                                    </div>

                                    {/* Mobile: Horizontal scrollable lessons */}
                                    <div className="lg:hidden">
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{scrollbarWidth: 'thin'}}>
                                            {stageLessons.map((stageLesson) => (
                                                <button
                                                    key={stageLesson.id}
                                                    onClick={() => router.visit(`/academy/lesson/${stageLesson.id}`)}
                                                    className={`flex-shrink-0 w-48 text-left p-3 rounded-md border transition-colors ${
                                                        stageLesson.id === lesson.id
                                                            ? 'bg-[#17B7C7] text-white border-[#17B7C7] shadow-sm'
                                                            : stageLesson.is_completed
                                                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                            : stageLesson.is_accessible
                                                            ? 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                                                            : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                                    }`}
                                                    disabled={!stageLesson.is_accessible}
                                                >
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className={`text-xs font-medium leading-tight line-clamp-2 ${
                                                            stageLesson.id === lesson.id
                                                                ? 'text-white'
                                                                : stageLesson.is_completed
                                                                ? 'text-green-800'
                                                                : stageLesson.is_accessible
                                                                ? 'text-gray-900'
                                                                : 'text-gray-500'
                                                        }`}>
                                                            {stageLesson.lesson_order}. {stageLesson.title}
                                                        </span>
                                                        {stageLesson.is_completed && (
                                                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5 ml-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className={`${
                                                            stageLesson.id === lesson.id
                                                                ? 'text-white opacity-75'
                                                                : stageLesson.is_completed
                                                                ? 'text-green-700'
                                                                : stageLesson.is_accessible
                                                                ? 'text-gray-600'
                                                                : 'text-gray-400'
                                                        }`}>
                                                            {stageLesson.duration}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className={`${
                                                            stageLesson.id === lesson.id
                                                                ? 'text-white opacity-75'
                                                                : stageLesson.is_completed
                                                                ? 'text-green-700'
                                                                : stageLesson.is_accessible
                                                                ? 'text-gray-600'
                                                                : 'text-gray-400'
                                                        }`}>
                                                            {stageLesson.difficulty}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Desktop: Vertical lessons list */}
                                    <div className="hidden lg:block space-y-1.5">
                                        {stageLessons.map((stageLesson) => (
                                            <button
                                                key={stageLesson.id}
                                                onClick={() => router.visit(`/academy/lesson/${stageLesson.id}`)}
                                                className={`w-full text-left p-2.5 rounded-md border transition-colors ${
                                                    stageLesson.id === lesson.id
                                                        ? 'bg-[#17B7C7] text-white border-[#17B7C7] shadow-sm'
                                                        : stageLesson.is_completed
                                                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                        : stageLesson.is_accessible
                                                        ? 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                                                        : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                                }`}
                                                disabled={!stageLesson.is_accessible}
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className={`text-xs font-medium leading-tight ${
                                                        stageLesson.id === lesson.id
                                                            ? 'text-white'
                                                            : stageLesson.is_completed
                                                            ? 'text-green-800'
                                                            : stageLesson.is_accessible
                                                            ? 'text-gray-900'
                                                            : 'text-gray-500'
                                                    }`}>
                                                        {stageLesson.lesson_order}. {stageLesson.title}
                                                    </span>
                                                    {stageLesson.is_completed && (
                                                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className={`${
                                                        stageLesson.id === lesson.id
                                                            ? 'text-white opacity-75'
                                                            : stageLesson.is_completed
                                                            ? 'text-green-700'
                                                            : stageLesson.is_accessible
                                                            ? 'text-gray-600'
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {stageLesson.duration}
                                                    </span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className={`${
                                                        stageLesson.id === lesson.id
                                                            ? 'text-white opacity-75'
                                                            : stageLesson.is_completed
                                                            ? 'text-green-700'
                                                            : stageLesson.is_accessible
                                                            ? 'text-gray-600'
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {stageLesson.difficulty}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <WelcomeFooter />
            </div>
        </>
    );
}