import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface AcademyProgress {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    currentLevel: number;
    currentRank: string;
    nextRank: string;
    nextLesson?: {
        id: number;
        title: string;
        description: string;
        stage: string;
        duration: string;
        difficulty: string;
    };
}

interface LearningJourneyProps {
    academyProgress: AcademyProgress;
}

export default function LearningJourney({ academyProgress }: LearningJourneyProps) {
    return (
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {/* Learning Journey Section - Light Blue Container - Responsive */}
            <div className="bg-[#E0F7FA] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 shadow-lg">
                {/* Mobile Header */}
                <div className="block sm:hidden mb-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-[#1A237E] mb-2 flex items-center justify-center">
                            <svg className="w-6 h-6 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Learning Journey
                        </h2>
                        <p className="text-sm font-medium text-gray-700">Track your progress and achievements</p>
                    </div>
                </div>

                {/* Tablet & Desktop Header */}
                <div className="hidden sm:block mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Your Learning Journey
                    </h2>
                    <p className="text-base sm:text-lg font-medium text-gray-700">Track your personal progress and learning achievements</p>
                </div>

                {/* Moovey Academy Rank & Recent Achievements - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    
                    {/* Moovey Academy Rank - Responsive */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-[#00BCD4] flex items-center justify-center text-white shadow-sm mx-auto mb-3">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A237E] mb-1">YOUR MOOVEY RANK</h3>
                                <p className="text-gray-600 text-sm mb-3">Current learning level</p>
                                <div className="bg-[#E0F7FA] rounded-xl p-3 inline-block">
                                    <div className="text-2xl font-bold text-[#1A237E]">Level {academyProgress.currentLevel}</div>
                                    <div className="text-[#1A237E] text-sm font-medium">{academyProgress.progressPercentage}% Complete</div>
                                </div>
                            </div>
                        </div>

                        {/* Tablet & Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-[#00BCD4] flex items-center justify-center text-white shadow-sm">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A237E]">YOUR MOOVEY RANK</h3>
                                    <p className="text-gray-600 text-sm">Current learning level</p>
                                </div>
                            </div>
                            <div className="text-right bg-[#E0F7FA] rounded-xl p-3">
                                <div className="text-3xl font-bold text-[#1A237E]">Level {academyProgress.currentLevel}</div>
                                <div className="text-[#1A237E] text-sm font-medium">{academyProgress.progressPercentage}% Complete</div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-base sm:text-lg font-bold text-[#1A237E]">{academyProgress.currentRank}</span>
                                {academyProgress.currentRank !== academyProgress.nextRank && (
                                    <span className="text-xs sm:text-sm text-[#1A237E] font-medium bg-[#E0F7FA] rounded px-2 py-1">
                                        Next: {academyProgress.nextRank}
                                    </span>
                                )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                                <div 
                                    className="bg-[#00BCD4] h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${academyProgress.progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span className="truncate">{academyProgress.completedLessons} of {academyProgress.totalLessons} lessons completed</span>
                                <span className="ml-2">{academyProgress.progressPercentage}%</span>
                            </div>
                        </div>
                        
                        {academyProgress.nextLesson ? (
                            <Link
                                href={route('academy')}
                                className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold text-sm shadow-sm"
                                title={`Continue with: ${academyProgress.nextLesson.title}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="hidden sm:inline">CONTINUE LEARNING</span>
                                <span className="sm:hidden">CONTINUE</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : academyProgress.progressPercentage === 100 ? (
                            <div className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                </svg>
                                <span className="hidden sm:inline">ALL LESSONS COMPLETED!</span>
                                <span className="sm:hidden">COMPLETED!</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <Link
                                href={route('academy')}
                                className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold text-sm shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="hidden sm:inline">START LEARNING</span>
                                <span className="sm:hidden">START</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Recent Achievements - Responsive */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden mb-4">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-[#1A237E] flex items-center justify-center text-white shadow-sm mx-auto mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A237E] mb-1">RECENT ACHIEVEMENTS</h3>
                                <p className="text-gray-600 text-sm mb-3">Your latest accomplishments</p>
                                <Link
                                    href="/achievements"
                                    className="text-xs text-white bg-[#00BCD4] hover:bg-[#00ACC1] font-semibold transition-all duration-200 px-3 py-2 rounded-lg inline-block"
                                >
                                    <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    VIEW ALL
                                </Link>
                            </div>
                        </div>

                        {/* Tablet & Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-[#1A237E] flex items-center justify-center text-white shadow-sm">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A237E]">RECENT ACHIEVEMENTS</h3>
                                    <p className="text-gray-600 text-sm">Your latest accomplishments</p>
                                </div>
                            </div>
                            <Link
                                href="/achievements"
                                className="text-sm text-white bg-[#00BCD4] hover:bg-[#00ACC1] font-semibold transition-all duration-200 px-4 py-2 rounded-lg"
                            >
                                VIEW ALL
                                <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </Link>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { icon: "target", title: "Move Planned", points: 50, time: "2 days ago" },
                                { icon: "clipboard", title: "Task Master", points: 100, time: "1 week ago" },
                                { icon: "home", title: "Property Hunter", points: 75, time: "2 weeks ago" }
                            ].map((achievement, index) => {
                                const getAchievementIcon = (iconType: string) => {
                                    switch (iconType) {
                                        case 'target':
                                            return <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                        case 'clipboard':
                                            return <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
                                        case 'home':
                                            return <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
                                        default:
                                            return <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                    }
                                };
                                return (
                                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#F5F5F5] hover:bg-[#E0F7FA] transition-colors duration-200">
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            {getAchievementIcon(achievement.icon)}
                                            <div>
                                                <div className="font-medium text-[#1A237E] text-xs sm:text-sm">{achievement.title}</div>
                                                <div className="text-xs text-gray-500">{achievement.time}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-[#00BCD4]">+{achievement.points}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            href="/achievements"
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold text-sm shadow-sm mt-4 w-full"
                        >
                            <span className="hidden sm:inline">Explore All Achievements</span>
                            <span className="sm:hidden">All Achievements</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Learning Progress & Profile Details - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Next Lesson - Learning Journey - Responsive */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                        {academyProgress.nextLesson ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-[#1A237E] flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="hidden sm:inline">Next Lesson</span>
                                        <span className="sm:hidden">Next</span>
                                    </h3>
                                    <div className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        {academyProgress.nextLesson.duration || '15 min'}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                        <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#F5F5F5"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#00BCD4"
                                                strokeWidth="4"
                                                strokeDasharray={`${academyProgress.progressPercentage}, 100`}
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00BCD4] flex items-center justify-center text-white shadow-lg">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h4 className="font-bold text-[#1A237E] text-sm mb-2">
                                        {academyProgress.nextLesson.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 font-medium mb-3">
                                        {academyProgress.nextLesson.description || 'Continue your learning journey'}
                                    </p>
                                    
                                    {/* Dynamic Progress indicator - Responsive */}
                                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-3">
                                        {Array.from({ length: academyProgress.totalLessons }, (_, index) => (
                                            <div 
                                                key={index}
                                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                                    index < academyProgress.completedLessons 
                                                        ? 'bg-[#00BCD4]' 
                                                        : 'bg-[#F5F5F5]'
                                                }`}
                                            ></div>
                                        )).slice(0, 5)}
                                        {academyProgress.totalLessons > 5 && (
                                            <span className="text-xs text-gray-500">...</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full text-center">
                                        <span className="hidden sm:inline">{academyProgress.completedLessons} of {academyProgress.totalLessons} lessons • {academyProgress.progressPercentage}% complete</span>
                                        <span className="sm:hidden">{academyProgress.completedLessons}/{academyProgress.totalLessons} • {academyProgress.progressPercentage}%</span>
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span className="hidden sm:inline">START LESSON</span>
                                    <span className="sm:hidden">START</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </Link>
                            </>
                        ) : academyProgress.progressPercentage === 100 ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-[#1A237E] flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <span className="hidden sm:inline">Congratulations!</span>
                                        <span className="sm:hidden">Complete!</span>
                                    </h3>
                                    <div className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-full">
                                        Complete
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                        <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#F5F5F5"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#10B981"
                                                strokeWidth="4"
                                                strokeDasharray="100, 100"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h4 className="font-bold text-[#1A237E] text-sm mb-2">
                                        All Lessons Completed!
                                    </h4>
                                    <p className="text-xs text-gray-600 font-medium mb-3">
                                        You've mastered the Moovey Academy curriculum
                                    </p>
                                    
                                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-3">
                                        {Array.from({ length: Math.min(academyProgress.totalLessons, 5) }, (_, index) => (
                                            <div key={index} className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                                        ))}
                                        {academyProgress.totalLessons > 5 && (
                                            <span className="text-xs text-green-600">+{academyProgress.totalLessons - 5}</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-full text-center">
                                        <span className="hidden sm:inline">{academyProgress.totalLessons} lessons completed • 100% mastery</span>
                                        <span className="sm:hidden">{academyProgress.totalLessons} lessons • 100%</span>
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span className="hidden sm:inline">VIEW ACHIEVEMENTS</span>
                                    <span className="sm:hidden">ACHIEVEMENTS</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-[#1A237E] flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="hidden sm:inline">Start Learning</span>
                                        <span className="sm:hidden">Start</span>
                                    </h3>
                                    <div className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        Begin
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                        <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#F5F5F5"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#00BCD4"
                                                strokeWidth="4"
                                                strokeDasharray="0, 100"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00BCD4] flex items-center justify-center text-white shadow-lg">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h4 className="font-bold text-[#1A237E] text-sm mb-2">
                                        Begin Your Learning Journey
                                    </h4>
                                    <p className="text-xs text-gray-600 font-medium mb-3">
                                        Start with your first lesson in the Moovey Academy
                                    </p>
                                    
                                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-3">
                                        {Array.from({ length: Math.min(academyProgress.totalLessons || 5, 5) }, (_, index) => (
                                            <div key={index} className="w-2 h-2 sm:w-3 sm:h-3 bg-[#F5F5F5] rounded-full"></div>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full text-center">
                                        <span className="hidden sm:inline">0 of {academyProgress.totalLessons || 5} lessons • Ready to start!</span>
                                        <span className="sm:hidden">0/{academyProgress.totalLessons || 5} • Ready!</span>
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span className="hidden sm:inline">START LEARNING</span>
                                    <span className="sm:hidden">START</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Profile Completeness - Responsive */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden sm:inline">Profile Progress</span>
                            <span className="sm:hidden">Profile</span>
                        </h3>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#F5F5F5"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#00BCD4"
                                        strokeWidth="4"
                                        strokeDasharray="70, 100"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg sm:text-xl font-bold text-[#1A237E]">70%</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#E0F7FA] rounded-lg p-3">
                            <p className="text-xs sm:text-sm font-bold text-[#1A237E] text-center">
                                <span className="hidden sm:inline">Complete your profile to unlock all features!</span>
                                <span className="sm:hidden">Complete profile to unlock features!</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}