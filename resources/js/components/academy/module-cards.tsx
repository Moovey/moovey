import React from 'react';
import { Link } from '@inertiajs/react';

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
    // Progress and accessibility
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

interface ModuleCardsProps {
    lessonsByStage: Record<string, Lesson[]>;
    stageProgress: Record<string, StageProgress>;
    isAuthenticated: boolean;
    handleBeginProgress: (stageName: string, badge: string) => void;
    stagePagination: {[key: string]: number};
    getPaginatedLessons: (stageName: string, lessons: Lesson[]) => {
        lessons: Lesson[];
        totalPages: number;
        currentPage: number;
        totalLessons: number;
    };
    changePage: (stageName: string, newPage: number) => void;
}

export default function ModuleCards({
    lessonsByStage,
    stageProgress,
    isAuthenticated,
    handleBeginProgress,
    stagePagination,
    getPaginatedLessons,
    changePage
}: ModuleCardsProps) {
    // Define the correct stage order
    const stageOrder = [
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

    // Stage metadata mapping
    const stageMetadata: Record<string, { subtitle: string; badge: string }> = {
        'Move Dreamer': { 
            subtitle: 'Your journey begins here - discover your moving motivation', 
            badge: 'Move Dreamer.png' 
        },
        'Plan Starter': { 
            subtitle: 'Build the foundation of your moving plan', 
            badge: 'Plan Starter.png' 
        },
        'Moovey Critic': { 
            subtitle: 'Learn to evaluate and make smart moving decisions', 
            badge: 'Moovey Critic.png' 
        },
        'Prep Pioneer': { 
            subtitle: 'Master the art of moving preparation', 
            badge: 'Prep Pioneer.png' 
        },
        'Moovey Director': { 
            subtitle: 'Take charge and coordinate your entire move', 
            badge: 'Moovey Director.png' 
        },
        'Move Rockstar': { 
            subtitle: 'Execute your move like a professional', 
            badge: 'Move Rockstar.png' 
        },
        'Home Navigator': { 
            subtitle: 'Navigate your way to your new home successfully', 
            badge: 'Home Navigator.png' 
        },
        'Settler Specialist': { 
            subtitle: 'Become an expert at settling into your new environment', 
            badge: 'Settler Specialist.png' 
        },
        'Moovey Star': { 
            subtitle: 'Achieve moving mastery and help others on their journey', 
            badge: 'Moovey Star.png' 
        }
    };

    const getStatusLabel = (percentage: number) => {
        if (percentage === 100) return 'Completed';
        if (percentage >= 75) return 'High Progress';
        if (percentage >= 50) return 'Medium Progress';
        if (percentage >= 25) return 'Low Progress';
        return 'Not Started';
    };

    return (
        <section id="lessons" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Dynamic Modules based on predefined stage order */}
                    {stageOrder.map((stageName, index) => {
                        const stageLessons = lessonsByStage[stageName];
                        
                        // Skip if no lessons exist for this stage
                        if (!stageLessons || stageLessons.length === 0) {
                            return null;
                        }

                        const progress = stageProgress[stageName];
                        const progressPercentage = progress ? progress.percentage : 0;
                        
                        // Check if stage is locked based on previous stage completion
                        const previousStageIndex = index - 1;
                        const previousStageName = previousStageIndex >= 0 ? stageOrder[previousStageIndex] : null;
                        const previousStageProgress = previousStageName ? stageProgress[previousStageName] : null;
                        const isLocked = !isAuthenticated || (index > 0 && (!previousStageProgress || previousStageProgress.percentage < 100));
                        
                        const metadata = stageMetadata[stageName] || { 
                            subtitle: `Master the ${stageName} stage`, 
                            badge: 'default-badge.png' 
                        };

                        return (
                            <div key={stageName} className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
                                <div className="flex flex-col lg:flex-row">
                                    {/* Left Content */}
                                    <div className="flex-1 p-4 sm:p-6 md:p-8">
                                        {/* Module Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                                            <div className="flex items-center space-x-3 sm:space-x-4">
                                                {/* Badge Image */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                                                    <img 
                                                        src={`/images/Badges/${metadata.badge}`}
                                                        alt={`${stageName} Badge`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{stageName}</h3>
                                                    <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{metadata.subtitle}</p>
                                                </div>
                                            </div>
                                            {/* Progress Circle */}
                                            <div className="text-center flex-shrink-0">
                                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto">
                                                    <svg className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 transform -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            d="M18 2.0845
                                                            a 15.9155 15.9155 0 0 1 0 31.831
                                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="#E5E7EB"
                                                            strokeWidth="3"
                                                        />
                                                        <path
                                                            d="M18 2.0845
                                                            a 15.9155 15.9155 0 0 1 0 31.831
                                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke={progressPercentage > 0 ? "#10B981" : "#9CA3AF"}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${progressPercentage}, 100`}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-700">{progressPercentage}%</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{getStatusLabel(progressPercentage)}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                                            <button 
                                                className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base ${
                                                    isLocked
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                        : 'bg-[#00BCD4] text-white hover:bg-[#0097A7]'
                                                }`} 
                                                disabled={isLocked}
                                                onClick={() => !isLocked && handleBeginProgress(stageName, metadata.badge)}
                                            >
                                                {isLocked ? 'Locked' : 'Begin Progress'}
                                            </button>
                                            <button className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base ${
                                                isLocked
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`} disabled={isLocked}>
                                                {isLocked ? 'Quiz Locked' : 'Take Quiz'}
                                            </button>
                                            <button className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-colors text-sm sm:text-base ${
                                                isLocked
                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                    : 'text-[#00BCD4] hover:text-[#0097A7]'
                                            }`} disabled={isLocked}>
                                                Glossary
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Sidebar */}
                                    <div className="w-full lg:w-80 xl:w-96 bg-[#00BCD4] p-4 sm:p-6 text-white border-t lg:border-t-0 lg:border-l border-white border-opacity-20">
                                        <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Lessons in this Stage</h4>
                                        {(() => {
                                            const paginatedData = getPaginatedLessons(stageName, stageLessons);
                                            return (
                                                <>
                                                    {/* Lessons List */}
                                                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                                        {paginatedData.lessons.map((lesson, lessonIndex) => (
                                                            <div key={lesson.id} className="flex items-start space-x-3">
                                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                                    !lesson.is_accessible
                                                                        ? 'bg-white bg-opacity-10' 
                                                                        : lesson.is_completed
                                                                        ? 'bg-green-500' 
                                                                        : lesson.is_accessible && !lesson.is_completed
                                                                        ? 'bg-white' 
                                                                        : 'bg-white bg-opacity-10'
                                                                }`}>
                                                                    {!lesson.is_accessible ? (
                                                                        <svg className="w-3 h-3 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : lesson.is_completed ? (
                                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    ) : lesson.is_accessible && !lesson.is_completed ? (
                                                                        <svg className="w-4 h-4 text-[#00BCD4]" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : (
                                                                        <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
                                                                    )}
                                                                </div>
                                                                <button 
                                                                    onClick={() => lesson.is_accessible && handleBeginProgress(stageName, metadata.badge)}
                                                                    className={`text-xs sm:text-sm text-left flex-1 min-w-0 leading-relaxed ${
                                                                        !lesson.is_accessible
                                                                            ? 'opacity-50 cursor-not-allowed' 
                                                                            : lesson.is_accessible && !lesson.is_completed
                                                                            ? 'font-medium hover:underline' 
                                                                            : lesson.is_completed
                                                                            ? 'opacity-75 hover:underline' 
                                                                            : ''
                                                                    }`}
                                                                    disabled={!lesson.is_accessible}
                                                                >
                                                                    <span className="line-clamp-2">{lesson.title}</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Pagination Controls */}
                                                    {paginatedData.totalPages > 1 && (
                                                        <div className="border-t border-white border-opacity-20 pt-3 sm:pt-4">
                                                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                                                <span className="text-white text-opacity-80">
                                                                    {paginatedData.currentPage} of {paginatedData.totalPages}
                                                                </span>
                                                                <div className="flex space-x-1 sm:space-x-2">
                                                                    <button
                                                                        onClick={() => changePage(stageName, paginatedData.currentPage - 1)}
                                                                        disabled={paginatedData.currentPage === 1}
                                                                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs font-medium border transition-colors ${
                                                                            paginatedData.currentPage === 1
                                                                                ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                                                                                : 'bg-white text-[#00BCD4] border-white hover:bg-gray-100 hover:text-[#0097A7]'
                                                                        }`}
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <button
                                                                        onClick={() => changePage(stageName, paginatedData.currentPage + 1)}
                                                                        disabled={paginatedData.currentPage === paginatedData.totalPages}
                                                                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs font-medium border transition-colors ${
                                                                            paginatedData.currentPage === paginatedData.totalPages
                                                                                ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                                                                                : 'bg-white text-[#00BCD4] border-white hover:bg-gray-100 hover:text-[#0097A7]'
                                                                        }`}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 text-xs text-white text-opacity-70 text-center">
                                                                {paginatedData.totalLessons} total lessons
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}