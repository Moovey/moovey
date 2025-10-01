import React from 'react';
import { Link } from '@inertiajs/react';

interface StageProgress {
    percentage: number;
    completed: number;
    total: number;
}

interface LessonsByStage {
    [stageName: string]: any[];
}

interface LearningJourneyProgressProps {
    lessonsByStage: LessonsByStage;
    stageProgress: Record<string, StageProgress>;
    isAuthenticated: boolean;
    totalLessons: number;
    completedLessons: number;
    handleBeginProgress: (stageName: string, badge: string) => void;
}

export default function LearningJourneyProgress({
    lessonsByStage,
    stageProgress,
    isAuthenticated,
    totalLessons,
    completedLessons,
    handleBeginProgress
}: LearningJourneyProgressProps) {
    // Define the 9 stages in order (used in multiple places)
    const stages = [
        { label: 'Move Dreamer', badge: 'Move Dreamer.png' },
        { label: 'Plan Starter', badge: 'Plan Starter.png' },
        { label: 'Moovey Critic', badge: 'Moovey Critic.png' },
        { label: 'Prep Pioneer', badge: 'Prep Pioneer.png' },
        { label: 'Moovey Director', badge: 'Moovey Director.png' },
        { label: 'Move Rockstar', badge: 'Move Rockstar.png' },
        { label: 'Home Navigator', badge: 'Home Navigator.png' },
        { label: 'Settler Specialist', badge: 'Settler Specialist.png' },
        { label: 'Moovey Star', badge: 'Moovey Star.png' }
    ];

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Your{" "}
                        <span className="text-[#00BCD4]">Learning Journey</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Advance from Move Dreamer to Moovey Star through comprehensive e-learning achievements.
                    </p>
                </div>

                {/* Dynamic Progress Message */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-[#E0F7FA] px-8 py-3 rounded-full">
                        <span className="text-[#00BCD4] font-medium">
                            {(() => {
                                const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                                if (overallProgress === 0) {
                                    return "Welcome to your learning journey! Start with your first lesson to begin your path to moving mastery.";
                                } else if (overallProgress < 25) {
                                    return "Great start! You've taken the first steps. Keep going to build momentum!";
                                } else if (overallProgress < 50) {
                                    return "Excellent progress! You're building solid moving knowledge. Stay on track!";
                                } else if (overallProgress < 75) {
                                    return "Amazing work! You're more than halfway to becoming a moving expert!";
                                } else if (overallProgress < 100) {
                                    return "Outstanding! You're so close to mastering all the moving skills. Push through to the finish!";
                                } else {
                                    return "Congratulations! You've completed your journey and become a true Moovey Star! 🌟";
                                }
                            })()}
                        </span>
                    </div>
                </div>

                {/* Dynamic Progress Timeline with 9 Stages */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    {!isAuthenticated ? (
                        // Not authenticated - show login message
                        <div className="text-center py-16">
                            <div className="mb-6">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Please Login to See Progress</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Create an account or sign in to track your learning journey and unlock your moving mastery path.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link 
                                        href="/login" 
                                        className="bg-[#00BCD4] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0097A7] transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        href="/register" 
                                        className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Authenticated - show normal progress timeline
                        <>
                    <div className="relative mb-8">
                        <div className="flex justify-between items-center">
                            {(() => {
                                // Calculate dynamic progress for each stage
                                return stages.map((stage, index) => {
                                    const currentStageProgress = Object.entries(stageProgress || {})
                                        .find(([stageName]) => stageName === stage.label)?.[1];
                                    
                                    const isCompleted = currentStageProgress?.percentage === 100;
                                    const isActive = currentStageProgress && currentStageProgress.percentage > 0 && currentStageProgress.percentage < 100;
                                    const isAccessible = isAuthenticated && (index === 0 || 
                                        (index > 0 && Object.entries(stageProgress || {})
                                            .find(([stageName]) => stageName === stages[index - 1].label)?.[1]?.percentage === 100));
                                    
                                    return (
                                        <div key={index} className="flex flex-col items-center relative z-10">
                                            {/* Badge Image */}
                                            <div className={`relative w-20 h-20 mb-3 transition-transform ${
                                                isCompleted 
                                                    ? 'transform scale-110' 
                                                    : isActive
                                                    ? 'transform scale-105'
                                                    : 'opacity-60'
                                            }`}>
                                                {/* Badge Container */}
                                                <div className={`w-20 h-20 rounded-full shadow-lg transition-all ${
                                                    isCompleted 
                                                        ? 'ring-4 ring-yellow-300' 
                                                        : isActive 
                                                        ? 'ring-2 ring-blue-300' 
                                                        : isAccessible
                                                        ? 'ring-1 ring-gray-300'
                                                        : ''
                                                }`}>
                                                    {/* Badge Image */}
                                                    <img 
                                                        src={`/images/Badges/${stage.badge}`}
                                                        alt={stage.label}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                    
                                                    {/* Completion Checkmark */}
                                                    {isCompleted && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Active Indicator */}
                                                    {isActive && !isCompleted && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        </div>
                                                    )}

                                                    {/* Lock Icon for inaccessible stages */}
                                                    {!isAccessible && !isCompleted && !isActive && (
                                                        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Banner underneath */}
                                                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold text-white shadow-md ${
                                                    isCompleted 
                                                        ? 'bg-green-600' 
                                                        : isActive 
                                                        ? 'bg-blue-600' 
                                                        : isAccessible
                                                        ? 'bg-orange-500'
                                                        : 'bg-gray-400'
                                                }`}>
                                                    {isCompleted 
                                                        ? 'DONE' 
                                                        : isActive 
                                                        ? 'NOW' 
                                                        : isAccessible
                                                        ? 'READY'
                                                        : 'SOON'}
                                                </div>
                                            </div>
                                            
                                            {/* Stage Label */}
                                            <span className={`text-sm text-center max-w-20 leading-tight font-medium mt-3 ${
                                                isCompleted 
                                                    ? 'text-green-700' 
                                                    : isActive 
                                                    ? 'text-blue-700' 
                                                    : isAccessible
                                                    ? 'text-orange-600'
                                                    : 'text-gray-500'
                                            }`}>
                                                {stage.label}
                                            </span>
                                            
                                            {/* Connecting Line */}
                                            {index < 8 && (
                                                <div className={`absolute top-10 left-10 w-full h-1 -z-10 transition-colors ${
                                                    isCompleted 
                                                        ? 'bg-gradient-to-r from-green-400 to-teal-400' 
                                                        : 'bg-gray-300'
                                                }`} style={{ width: 'calc(100% - 2.5rem)' }} />
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Dynamic Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {(() => {
                                    const completedStages = Object.values(stageProgress || {}).filter(progress => progress.percentage === 100).length;
                                    const activeStages = Object.values(stageProgress || {}).filter(progress => progress.percentage > 0 && progress.percentage < 100).length;
                                    const currentStep = completedStages + (activeStages > 0 ? 1 : 0);
                                    return `Step ${currentStep > 9 ? 9 : currentStep}`;
                                })()}
                            </div>
                            <div className="text-sm text-gray-600">Current Stage</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00BCD4] mb-1">
                                {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Progress</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {completedLessons * 50}
                            </div>
                            <div className="text-sm text-gray-600">XP Earned</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {totalLessons - completedLessons}
                            </div>
                            <div className="text-sm text-gray-600">Lessons Remaining</div>
                        </div>
                    </div>

                    {/* Dynamic Motivational Message & CTA */}
                    <div className="text-center">
                        <p className="text-gray-600 mb-6 text-lg">
                            {(() => {
                                const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                                if (overallProgress === 0) {
                                    return (
                                        <>
                                            🚀 <strong>Ready to start your journey?</strong><br />
                                            Take your first step into the world of moving mastery. Every expert was once a beginner!
                                        </>
                                    );
                                } else if (overallProgress < 25) {
                                    return (
                                        <>
                                            🎯 <strong>You're off to a great start!</strong><br />
                                            You've taken the first important steps. Keep this momentum going – 
                                            each lesson brings you closer to moving mastery!
                                        </>
                                    );
                                } else if (overallProgress < 50) {
                                    return (
                                        <>
                                            🔥 <strong>You're building real expertise!</strong><br />
                                            Your dedication is showing results. You're developing solid moving knowledge 
                                            that will serve you for life!
                                        </>
                                    );
                                } else if (overallProgress < 75) {
                                    return (
                                        <>
                                            💪 <strong>You're more than halfway there!</strong><br />
                                            Your progress is impressive! You've mastered most of the fundamentals. 
                                            The finish line is in sight!
                                        </>
                                    );
                                } else if (overallProgress < 100) {
                                    return (
                                        <>
                                            🌟 <strong>Almost a Moovey Star!</strong><br />
                                            You're so close to completing your journey! Just a few more lessons 
                                            and you'll have mastered all the moving skills.
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            🏆 <strong>Congratulations, Moovey Star!</strong><br />
                                            You've completed your entire learning journey! You now have the knowledge 
                                            and skills to handle any move with confidence.
                                        </>
                                    );
                                }
                            })()}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] h-4 rounded-full transition-all duration-500 shadow-sm" 
                                style={{ 
                                    width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` 
                                }}
                            ></div>
                        </div>
                        {(() => {
                            const nextIncompleteStage = Object.entries(stageProgress || {})
                                .find(([stageName, progress]) => progress.percentage < 100)?.[0];
                            
                            if (nextIncompleteStage) {
                                const stageBadge = stages.find(stage => stage.label === nextIncompleteStage)?.badge || 'default-badge.png';
                                
                                return (
                                    <button 
                                        onClick={() => handleBeginProgress(nextIncompleteStage, stageBadge)}
                                        className="bg-[#00BCD4] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0097A7] transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Continue to {nextIncompleteStage}
                                    </button>
                                );
                            } else {
                                return (
                                    <button className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold cursor-default shadow-lg">
                                        🎉 Journey Complete!
                                    </button>
                                );
                            }
                        })()}
                        <div className="mt-4">
                            <Link href="#lessons" className="text-[#00BCD4] hover:text-[#0097A7] font-medium">
                                View All Lessons →
                            </Link>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}