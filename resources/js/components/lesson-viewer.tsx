import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

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

interface LessonViewerProps {
    stage: string;
    lessons: Lesson[];
    onBack: () => void;
    stageBadge: string;
    isAuthenticated: boolean;
}

export default function LessonViewer({ stage, lessons, onBack, stageBadge, isAuthenticated }: LessonViewerProps) {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    
    // Add CSS animations to the document head
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes firework {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: scale(1) rotate(180deg);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.2) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes particle {
                0% {
                    transform: translateX(0) translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100px) translateY(-100px) scale(0);
                    opacity: 0;
                }
            }
            
            .animate-firework {
                animation: firework 2s ease-out forwards;
            }
            
            .animate-particle {
                animation: particle 1.5s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Filter lessons by stage and sort by lesson_order
    const stageLessons = lessons
        .filter(lesson => lesson.lesson_stage === stage)
        .sort((a, b) => a.lesson_order - b.lesson_order);

    const handleStartLesson = (lesson: Lesson) => {
        if (!lesson.is_accessible && isAuthenticated) {
            alert('🔒 You must complete the previous lessons to access this one.');
            return;
        }
        setSelectedLesson(lesson);
    };

    const handleBackToLessons = () => {
        setSelectedLesson(null);
    };

    // Add keyboard navigation support
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!selectedLesson) return;
            
            const navInfo = getCurrentLessonNavInfo();
            
            switch (event.key) {
                case 'ArrowLeft':
                    if (!navInfo.isFirst) {
                        handlePreviousLesson();
                    }
                    break;
                case 'ArrowRight':
                    if (!navInfo.isLast && (navInfo.nextLessonAccessible || !isAuthenticated)) {
                        handleNextLesson();
                    }
                    break;
                case 'Escape':
                    handleBackToLessons();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLesson, isAuthenticated]);

    const handleMarkComplete = async () => {
        if (!selectedLesson || !isAuthenticated || isMarkingComplete) return;
        
        setIsMarkingComplete(true);
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch(route('lessons.complete', selectedLesson.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Update the lesson state locally
                if (selectedLesson) {
                    selectedLesson.is_completed = true;
                    selectedLesson.completed_at = data.progress?.completed_at || new Date().toISOString();
                    selectedLesson.progress_percentage = 100;
                }
                
                // Update other lessons accessibility if needed
                if (data.nextLesson) {
                    const nextLesson = stageLessons.find(l => l.id === data.nextLesson.id);
                    if (nextLesson) {
                        nextLesson.is_accessible = data.nextLesson.is_accessible;
                    }
                }
                
                // Show success message and offer navigation
                setShowFireworks(true);
                
                // Hide fireworks after animation
                setTimeout(() => {
                    setShowFireworks(false);
                }, 3000);
                
                if (data.nextLesson && data.nextLesson.is_accessible) {
                    // Auto navigate to next lesson after fireworks
                    setTimeout(() => {
                        const nextLesson = stageLessons.find(l => l.id === data.nextLesson.id);
                        if (nextLesson) {
                            setSelectedLesson(nextLesson);
                        }
                    }, 2000);
                }
            } else {
                let errorMessage = 'Failed to mark lesson as complete';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server error (${response.status})`;
                }
                console.error('Error marking lesson complete:', errorMessage);
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            let errorMessage = 'Network error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(`❌ ${errorMessage}. Please check your connection and try again.`);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    const handleNextLesson = () => {
        if (!selectedLesson) return;
        
        const currentIndex = stageLessons.findIndex(l => l.id === selectedLesson.id);
        const nextLesson = stageLessons[currentIndex + 1];
        
        if (nextLesson) {
            if (!nextLesson.is_accessible && isAuthenticated) {
                alert('🔒 You must complete the current lesson before proceeding to the next one.');
                return;
            }
            setSelectedLesson(nextLesson);
        } else {
            alert('🎉 Congratulations! You\'ve reached the last lesson in this stage. Great job!');
        }
    };

    const handlePreviousLesson = () => {
        if (!selectedLesson) return;
        
        const currentIndex = stageLessons.findIndex(l => l.id === selectedLesson.id);
        const previousLesson = stageLessons[currentIndex - 1];
        
        if (previousLesson) {
            setSelectedLesson(previousLesson);
        } else {
            alert('ℹ️ This is the first lesson in this stage.');
        }
    };

    // Get navigation info for current lesson
    const getCurrentLessonNavInfo = () => {
        if (!selectedLesson) return { currentIndex: -1, totalLessons: 0, isFirst: true, isLast: true };
        
        const currentIndex = stageLessons.findIndex(l => l.id === selectedLesson.id);
        return {
            currentIndex,
            totalLessons: stageLessons.length,
            isFirst: currentIndex === 0,
            isLast: currentIndex === stageLessons.length - 1,
            nextLessonAccessible: currentIndex < stageLessons.length - 1 ? 
                stageLessons[currentIndex + 1]?.is_accessible || !isAuthenticated : false
        };
    };

    // If a lesson is selected, show the lesson content viewer
    if (selectedLesson) {
        const navInfo = getCurrentLessonNavInfo();
        const completedLessonsCount = stageLessons.filter(l => l.is_completed).length;
        const progressPercentage = stageLessons.length > 0 ? (completedLessonsCount / stageLessons.length) * 100 : 0;
        
        return (
            <div className="min-h-screen bg-white">
                <GlobalHeader currentPage="academy" />
                
                <div className="max-w-full mx-auto">
                    {/* Main Layout - Two Columns */}
                    <div className="flex flex-col lg:flex-row min-h-screen">
                        {/* Left Column - Main Content (70%) */}
                        <div className="flex-1 lg:w-[70%] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl lg:max-w-none">
                            {/* Breadcrumb Navigation */}
                            <nav className="mb-6">
                                <button 
                                    onClick={handleBackToLessons}
                                    className="flex items-center text-[#00BCD4] hover:text-[#0097A7] font-medium text-sm mb-4"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Academy
                                </button>
                            </nav>

                            {/* Lesson Header */}
                            <div className="mb-8">
                                {/* Lesson Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Lesson {navInfo.currentIndex + 1}: {selectedLesson.title}
                                </h1>
                                
                                {/* Lesson Metadata */}
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(selectedLesson.difficulty)}`}>
                                        {selectedLesson.difficulty}
                                    </span>
                                    <span className="text-gray-600 font-medium">{selectedLesson.duration}</span>
                                    <span className="text-gray-600">{stage}</span>
                                </div>
                            </div>

                            {/* Lesson Content Area */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {selectedLesson.content_html ? (
                            /* Rich HTML Content */
                            <div className="w-full">
                                <div className="p-8">
                                    <div 
                                        className="prose prose-lg max-w-none text-gray-900 leading-relaxed
                                                   [&_h1]:text-gray-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8 [&_h1:first-child]:mt-0
                                                   [&_h2]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-8
                                                   [&_h3]:text-gray-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-6
                                                   [&_p]:text-gray-900 [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-base
                                                   [&_ul]:text-gray-900 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ul]:pl-2
                                                   [&_ol]:text-gray-900 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_ol]:pl-2
                                                   [&_li]:text-gray-900 [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:pl-1
                                                   [&_ul_ul]:mt-2 [&_ul_ul]:mb-2 [&_ul_ul]:ml-4
                                                   [&_ol_ol]:mt-2 [&_ol_ol]:mb-2 [&_ol_ol]:ml-4
                                                   [&_ul_li]:marker:text-gray-600
                                                   [&_ol_li]:marker:text-gray-600 [&_ol_li]:marker:font-semibold
                                                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-8 [&_img]:border [&_img]:border-gray-200
                                                   [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:my-6
                                                   [&_a]:text-[#00BCD4] [&_a]:underline [&_a]:hover:text-[#0097A7]
                                                   [&_strong]:font-bold [&_strong]:text-gray-900
                                                   [&_em]:italic"
                                        dangerouslySetInnerHTML={{ __html: selectedLesson.content_html }}
                                    />
                                </div>
                            </div>
                        ) : selectedLesson.content_file_url ? (
                            <div className="w-full">
                                {/* PDF/Document Viewer */}
                                {selectedLesson.content_file_url.toLowerCase().endsWith('.pdf') ? (
                                    <div className="w-full">
                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900">Lesson Content</h3>
                                                <a 
                                                    href={selectedLesson.content_file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 text-[#00BCD4] hover:text-[#0097A7] font-medium"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Download PDF</span>
                                                </a>
                                            </div>
                                            <iframe
                                                src={selectedLesson.content_file_url}
                                                className="w-full h-96 border border-gray-200 rounded-lg"
                                                title={selectedLesson.title}
                                            />
                                            <p className="text-sm text-gray-500 mt-4 text-center">
                                                If the PDF doesn't display properly, you can{' '}
                                                <a 
                                                    href={selectedLesson.content_file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[#00BCD4] hover:text-[#0097A7] font-medium"
                                                >
                                                    download it here
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Other file types */
                                    <div className="p-8 text-center">
                                        <div className="w-20 h-20 bg-[#00BCD4] rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lesson Material</h3>
                                        <p className="text-gray-600 mb-6">
                                            Click the button below to download and view the lesson content.
                                        </p>
                                        <a
                                            href={selectedLesson.content_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 bg-[#00BCD4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0097A7] transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Download Lesson Content</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* No content available */
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Coming Soon</h3>
                                <p className="text-gray-600">
                                    The lesson content for this module is being prepared and will be available soon.
                                </p>
                            </div>
                        )}
                            </div>

                            {/* Bottom Navigation Buttons */}
                            {isAuthenticated && (
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    {/* Previous Lesson Button */}
                                    {!navInfo.isFirst && (
                                        <button 
                                            onClick={handlePreviousLesson}
                                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            ← Previous Lesson
                                        </button>
                                    )}
                                    
                                    {/* Mark as Complete Button */}
                                    {!selectedLesson.is_completed && (
                                        <button 
                                            onClick={handleMarkComplete}
                                            disabled={isMarkingComplete}
                                            className="flex-1 bg-[#00BCD4] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#0097A7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isMarkingComplete ? 'Marking Complete...' : '✓ Mark as Complete'}
                                        </button>
                                    )}
                                    
                                    {/* Next Lesson Button */}
                                    {!navInfo.isLast && (
                                        <button 
                                            onClick={handleNextLesson}
                                            disabled={!navInfo.nextLessonAccessible && isAuthenticated}
                                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                                                navInfo.nextLessonAccessible || !isAuthenticated
                                                    ? 'bg-[#00BCD4] text-white hover:bg-[#0097A7]'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {navInfo.nextLessonAccessible || !isAuthenticated ? 'Next Lesson →' : '🔒 Complete Current First'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Sidebar (30%) */}
                        <div className="w-full lg:w-[30%] bg-gray-50 lg:border-l border-gray-200 p-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
                            {/* Course Navigation Section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">{stage}</h2>
                                
                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>{completedLessonsCount} of {stageLessons.length} lessons completed</span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-[#00BCD4] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Lesson List */}
                                <div className="space-y-2">
                                    {stageLessons.map((lesson, index) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setSelectedLesson(lesson)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                selectedLesson?.id === lesson.id
                                                    ? 'bg-[#00BCD4] text-white'
                                                    : lesson.is_completed
                                                    ? 'bg-green-50 text-green-800 hover:bg-green-100'
                                                    : lesson.is_accessible || !isAuthenticated
                                                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            disabled={!lesson.is_accessible && isAuthenticated && selectedLesson?.id !== lesson.id}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{lesson.title}</span>
                                                {lesson.is_completed && (
                                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {!lesson.is_accessible && isAuthenticated && (
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Tracker Widget */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Moovey Academy</h3>
                                    <p className="text-sm text-gray-600 mb-4">Your Learning Progress Tracker</p>
                                    
                                    {/* Gauge Style Progress */}
                                    <div className="mb-4">
                                        <svg viewBox="0 0 200 120" className="w-40 h-20 mx-auto">
                                            {/* Background Arc */}
                                            <path
                                                d="M 20 100 A 80 80 0 0 1 180 100"
                                                fill="none"
                                                stroke="#E5E7EB"
                                                strokeWidth="16"
                                                strokeLinecap="round"
                                            />

                                            {/* Progress Arc */}
                                            {stageLessons.length > 0 && progressPercentage > 0 && (
                                                <path
                                                    d={`M 20 100 A 80 80 0 0 ${progressPercentage > 50 ? 1 : 0} ${
                                                        20 + 160 * (progressPercentage / 100)
                                                    } ${100 - 80 * Math.sin(Math.PI * (progressPercentage / 100))}`}
                                                    fill="none"
                                                    stroke="#00BCD4"
                                                    strokeWidth="12"
                                                    strokeLinecap="round"
                                                    className="transition-all duration-500"
                                                    style={{
                                                        filter: 'drop-shadow(0 2px 4px rgba(0, 188, 212, 0.3))'
                                                    }}
                                                />
                                            )}

                                            {/* Needle */}
                                            {stageLessons.length > 0 && (
                                                <g>
                                                    {/* Needle shadow */}
                                                    <line
                                                        x1="100"
                                                        y1="100"
                                                        x2={100 + 60 * Math.cos(Math.PI * (progressPercentage / 100) - Math.PI) + 1}
                                                        y2={100 + 60 * Math.sin(Math.PI * (progressPercentage / 100) - Math.PI) + 1}
                                                        stroke="rgba(0, 0, 0, 0.2)"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                    />
                                                    
                                                    {/* Main needle */}
                                                    <line
                                                        x1="100"
                                                        y1="100"
                                                        x2={100 + 60 * Math.cos(Math.PI * (progressPercentage / 100) - Math.PI)}
                                                        y2={100 + 60 * Math.sin(Math.PI * (progressPercentage / 100) - Math.PI)}
                                                        stroke="#1F2937"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        className="transition-all duration-500"
                                                        style={{
                                                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                                                        }}
                                                    />
                                                    
                                                    {/* Needle tip */}
                                                    <circle 
                                                        cx={100 + 60 * Math.cos(Math.PI * (progressPercentage / 100) - Math.PI)}
                                                        cy={100 + 60 * Math.sin(Math.PI * (progressPercentage / 100) - Math.PI)}
                                                        r="3" 
                                                        fill="#00BCD4"
                                                        className="transition-all duration-500"
                                                        style={{
                                                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                                                        }}
                                                    />
                                                </g>
                                            )}

                                            {/* Needle center circle */}
                                            <circle cx="100" cy="100" r="10" fill="#1F2937" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }} />
                                            <circle cx="100" cy="100" r="6" fill="#374151" />
                                            <circle cx="100" cy="100" r="3" fill="#6B7280" />
                                            
                                            {/* Progress percentage text */}
                                            <text 
                                                x="100" 
                                                y="85" 
                                                textAnchor="middle" 
                                                className="fill-gray-700 text-xs font-bold"
                                                style={{ fontSize: '10px' }}
                                            >
                                                {Math.round(progressPercentage)}%
                                            </text>
                                        </svg>
                                    </div>

                                    {/* Progress details */}
                                    <div className="text-center mb-4">
                                        <div className="text-xl font-bold text-gray-900 mb-1">
                                            {completedLessonsCount} <span className="text-gray-500">of</span> {stageLessons.length}
                                        </div>
                                        <div className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                            Lessons Completed
                                        </div>
                                    </div>
                                    
                                    {!isAuthenticated ? (
                                        <button className="w-full bg-[#00BCD4] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0097A7] transition-colors">
                                            Unlock Tracking, Sign In
                                        </button>
                                    ) : (
                                        <div className="text-sm text-green-600 font-medium">
                                            ✓ Progress Tracking Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fireworks Animation */}
                    {showFireworks && (
                        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                            <div className="relative">
                                {/* Multiple firework bursts */}
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute animate-firework"
                                        style={{
                                            left: `${Math.random() * 200 - 100}px`,
                                            top: `${Math.random() * 200 - 100}px`,
                                            animationDelay: `${i * 0.2}s`,
                                            animationDuration: '2s'
                                        }}
                                    >
                                        {/* Firework particles */}
                                        {[...Array(8)].map((_, j) => (
                                            <div
                                                key={j}
                                                className="absolute w-2 h-2 rounded-full animate-particle"
                                                style={{
                                                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'][Math.floor(Math.random() * 6)],
                                                    transform: `rotate(${j * 45}deg)`,
                                                    animationDelay: `${i * 0.2}s`,
                                                    animationDuration: '1.5s'
                                                }}
                                            />
                                        ))}
                                    </div>
                                ))}
                                
                                {/* Success message */}
                                <div className="text-center bg-white rounded-lg shadow-lg p-6 animate-bounce">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson Completed!</h3>
                                    <p className="text-gray-600">Great job! Keep up the excellent work!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <WelcomeFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <GlobalHeader currentPage="academy" />
            
            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={onBack}
                        className="flex items-center text-[#00BCD4] hover:text-[#0097A7] font-medium mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Academy
                    </button>
                    
                    <div className="flex items-center space-x-6">
                        {/* Stage Badge */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                            <img 
                                src={`/images/Badges/${stageBadge}`}
                                alt={`${stage} Badge`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {stage} Lessons
                            </h1>
                            <p className="text-lg text-gray-600">
                                {stageLessons.length} {stageLessons.length === 1 ? 'lesson' : 'lessons'} available
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lessons Grid */}
                {stageLessons.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stageLessons.map((lesson) => (
                            <div key={lesson.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Lesson Thumbnail */}
                                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                                    {lesson.thumbnail_file_url ? (
                                        <img 
                                            src={lesson.thumbnail_file_url} 
                                            alt={lesson.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-[#00BCD4] rounded-xl flex items-center justify-center mb-2 mx-auto">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Content Lesson</div>
                                        </div>
                                    )}
                                    
                                    {/* Document Icon Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all cursor-pointer">
                                            <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Content */}
                                <div className="p-6">
                                    {/* Lesson Meta */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
                                            {lesson.difficulty}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {lesson.duration}
                                        </span>
                                    </div>

                                    {/* Lesson Title & Description */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {lesson.description}
                                    </p>

                                    {/* Action Button */}
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => handleStartLesson(lesson)}
                                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                                                lesson.is_accessible || !isAuthenticated
                                                    ? 'bg-[#00BCD4] text-white hover:bg-[#0097A7]'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            disabled={!lesson.is_accessible && isAuthenticated}
                                        >
                                            {lesson.is_accessible || !isAuthenticated ? "Start Lesson" : "🔒 Locked"}
                                        </button>
                                        
                                        {/* Progress indicator */}
                                        {isAuthenticated && (
                                            <div className="text-center">
                                                {lesson.is_completed ? (
                                                    <span className="text-sm text-green-600 font-medium">
                                                        ✓ Completed
                                                    </span>
                                                ) : lesson.progress_percentage > 0 ? (
                                                    <span className="text-sm text-blue-600 font-medium">
                                                        {lesson.progress_percentage}% Progress
                                                    </span>
                                                ) : !lesson.is_accessible ? (
                                                    <span className="text-sm text-red-600">
                                                        Complete previous lessons to unlock
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-600">
                                                        Ready to start
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* No Lessons State */
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Available</h3>
                        <p className="text-gray-600 mb-6">
                            There are no published lessons for the {stage} stage yet.
                        </p>
                        <button 
                            onClick={onBack}
                            className="bg-[#00BCD4] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0097A7] transition-colors"
                        >
                            Return to Academy
                        </button>
                    </div>
                )}
                </div>
            </div>
            
            <WelcomeFooter />
        </div>
    );
}