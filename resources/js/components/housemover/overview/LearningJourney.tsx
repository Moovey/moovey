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
        <section className="bg-white rounded-xl shadow-lg p-8">
            {/* Learning Journey Section - Light Blue Container */}
            <div className="bg-[#E0F7FA] rounded-xl p-8 mb-10 shadow-lg">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                        <span className="text-3xl mr-3">📚</span>
                        Your Learning Journey
                    </h2>
                    <p className="text-lg font-medium text-gray-700">Track your personal progress and learning achievements</p>
                </div>

                {/* Moovey Academy Rank & Recent Achievements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    
                    {/* Moovey Academy Rank */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-[#00BCD4] flex items-center justify-center text-white text-3xl shadow-sm">
                                    🎓
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
                                <span className="text-lg font-bold text-[#1A237E]">{academyProgress.currentRank}</span>
                                {academyProgress.currentRank !== academyProgress.nextRank && (
                                    <span className="text-sm text-[#1A237E] font-medium bg-[#E0F7FA] rounded px-2 py-1">
                                        Next: {academyProgress.nextRank}
                                    </span>
                                )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-[#00BCD4] h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${academyProgress.progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>{academyProgress.completedLessons} of {academyProgress.totalLessons} lessons completed</span>
                                <span>{academyProgress.progressPercentage}%</span>
                            </div>
                        </div>
                        
                        {academyProgress.nextLesson ? (
                            <Link
                                href={route('academy')}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold text-sm shadow-sm"
                                title={`Continue with: ${academyProgress.nextLesson.title}`}
                            >
                                <span>📚 CONTINUE LEARNING</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : academyProgress.progressPercentage === 100 ? (
                            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm shadow-sm">
                                <span>🎉 ALL LESSONS COMPLETED!</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <Link
                                href={route('academy')}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold text-sm shadow-sm"
                            >
                                <span>📚 START LEARNING</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Recent Achievements */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-[#1A237E] flex items-center justify-center text-white text-3xl shadow-sm">
                                    🏆
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
                                VIEW ALL 🏆
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: "🎯", title: "Move Planned", points: 50, time: "2 days ago" },
                                { icon: "📋", title: "Task Master", points: 100, time: "1 week ago" },
                                { icon: "🏡", title: "Property Hunter", points: 75, time: "2 weeks ago" }
                            ].map((achievement, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F5] hover:bg-[#E0F7FA] transition-colors duration-200">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{achievement.icon}</span>
                                        <div>
                                            <div className="font-medium text-[#1A237E] text-sm">{achievement.title}</div>
                                            <div className="text-xs text-gray-500">{achievement.time}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-[#00BCD4]">+{achievement.points}</div>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/achievements"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold text-sm shadow-sm mt-4 w-full justify-center"
                        >
                            <span>Explore All Achievements</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Learning Progress & Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Next Lesson - Learning Journey */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {academyProgress.nextLesson ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                        <span className="text-2xl mr-2">📚</span>
                                        Next Lesson
                                    </h3>
                                    <div className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        {academyProgress.nextLesson.duration || '15 min'}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
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
                                            <div className="w-10 h-10 rounded-full bg-[#00BCD4] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                📖
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
                                    
                                    {/* Dynamic Progress indicator */}
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                        {Array.from({ length: academyProgress.totalLessons }, (_, index) => (
                                            <div 
                                                key={index}
                                                className={`w-3 h-3 rounded-full ${
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
                                    <p className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        {academyProgress.completedLessons} of {academyProgress.totalLessons} lessons • {academyProgress.progressPercentage}% complete
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span>START LESSON</span>
                                    <span className="text-lg">🚀</span>
                                </Link>
                            </>
                        ) : academyProgress.progressPercentage === 100 ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                        <span className="text-2xl mr-2">🎉</span>
                                        Congratulations!
                                    </h3>
                                    <div className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-full">
                                        Complete
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
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
                                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                ✓
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
                                    
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                        {Array.from({ length: Math.min(academyProgress.totalLessons, 5) }, (_, index) => (
                                            <div key={index} className="w-3 h-3 bg-green-600 rounded-full"></div>
                                        ))}
                                        {academyProgress.totalLessons > 5 && (
                                            <span className="text-xs text-green-600">+{academyProgress.totalLessons - 5}</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-full">
                                        {academyProgress.totalLessons} lessons completed • 100% mastery
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span>VIEW ACHIEVEMENTS</span>
                                    <span className="text-lg">🏆</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                        <span className="text-2xl mr-2">📚</span>
                                        Start Learning
                                    </h3>
                                    <div className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        Begin
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
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
                                            <div className="w-10 h-10 rounded-full bg-[#00BCD4] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                🚀
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
                                    
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                        {Array.from({ length: Math.min(academyProgress.totalLessons || 5, 5) }, (_, index) => (
                                            <div key={index} className="w-3 h-3 bg-[#F5F5F5] rounded-full"></div>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-[#1A237E] bg-[#E0F7FA] px-2 py-1 rounded-full">
                                        0 of {academyProgress.totalLessons || 5} lessons • Ready to start!
                                    </p>
                                </div>

                                <Link
                                    href={route('academy')}
                                    className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-bold text-sm shadow-lg w-full"
                                >
                                    <span>START LEARNING</span>
                                    <span className="text-lg">🚀</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Profile Completeness */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                            <span className="text-2xl mr-2">👤</span>
                            Profile Progress
                        </h3>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
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
                                    <span className="text-xl font-bold text-[#1A237E]">70%</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#E0F7FA] rounded-lg p-3">
                            <p className="text-sm font-bold text-[#1A237E] text-center">Complete your profile to unlock all features!</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}