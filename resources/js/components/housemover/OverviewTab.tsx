import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import CompleteMovingJourney from './CompleteMovingJourney';

interface Task {
    id: string;
    title: string;  
    icon: string;
    dueDate: string;
    urgency: 'overdue' | 'urgent' | 'moderate' | 'normal';
    category: string;
    completed: boolean;
    estimatedTime: string;
    description: string;
    subtasks?: {
        completed: number;
        total: number;
    };
}

interface MoveStage {
    id: number;
    label: string;
    shortLabel: string;
    icon: string;
    completed: boolean;
    current: boolean;
    upcoming: boolean;
    progress: number;
    description: string;
}

interface PersonalDetails {
    currentAddress: string;
    newAddress: string;
    movingDate: string;
    contactInfo: string;
    emergencyContact: string;
}

// CompleteMovingJourney types not needed here anymore

interface OverviewTabProps {
    overallMoveProgress: number;
    moveStages: MoveStage[];
    activeStage: number;
    handleStageClick: (stageId: number) => void;
    // Ensure consistency with Move Details by letting parent provide section progress and color logic
    getSectionProgress?: (stageId: number) => number;
    getProgressColor?: (progress: number) => string;
    academyProgress: {
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
    };
    allUserTasks: Array<{
        id: number;
        title: string;
        description: string;
        priority: string;
        created_at: string;
        source: string;
        source_id?: number;
        category: string;
        completed: boolean;
        urgency: string;
    }>;
    selectedCtaTasks: Set<string>;
    setSelectedCtaTasks: React.Dispatch<React.SetStateAction<Set<string>>>;
    userPriorityTasks: Task[];
    setUserPriorityTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    getCtaTasksByCategory: () => {
        'Pre-Move': any[];
        'In-Move': any[];
        'Post-Move': any[];
    };
    handleCtaTaskToggle: (taskId: string) => void;
    addSelectedTasksToPriority: () => Promise<void>;
    handleDragStart: (e: React.DragEvent, taskId: string) => void;
    handleDropOnPriority: (e: React.DragEvent) => Promise<void>;
    handleDragOver: (e: React.DragEvent) => void;
    getCombinedPriorityTasks: () => Task[];
    handleTaskClick: (taskId: string) => void;
    handleTaskComplete: (taskId: string, event: React.MouseEvent) => Promise<void>;
    removeFromPriorityList: (taskId: string) => Promise<boolean>;
    taskStats: {
        total: number;
        pending: number;
        completed: number;
    };
    personalDetails: PersonalDetails;
}

export default function OverviewTab({
    overallMoveProgress,
    moveStages,
    activeStage,
    handleStageClick,
    getSectionProgress,
    getProgressColor,
    academyProgress,
    allUserTasks,
    selectedCtaTasks,
    setSelectedCtaTasks,
    userPriorityTasks,
    setUserPriorityTasks,
    getCtaTasksByCategory,
    handleCtaTaskToggle,
    addSelectedTasksToPriority,
    handleDragStart,
    handleDropOnPriority,
    handleDragOver,
    getCombinedPriorityTasks,
    handleTaskClick,
    handleTaskComplete,
    removeFromPriorityList,
    taskStats,
    personalDetails
}: OverviewTabProps) {
    // Removed CompleteMovingJourney timeline from OverviewTab per request

    // Local state for collapsible CTA task categories (Pre-Move, In-Move, Post-Move)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [countdownStatus, setCountdownStatus] = useState<'future' | 'today' | 'overdue' | 'no-date'>('no-date');

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    // Icon mapping function to convert emoji icons to professional SVG icons
    const getSectionIcon = (iconName: string, iconSize: string = "w-6 h-6") => {
        // Map emoji icons to icon names
        const emojiToIconMap: Record<string, string> = {
            '📋': 'planning',
            '🏠': 'home', 
            '🔍': 'search',
            '💰': 'money',
            '📄': 'legal',
            '📦': 'box',
            '🚚': 'truck',
            '🏡': 'settling',
            '✨': 'sparkle'
        };
        
        const mappedIconName = emojiToIconMap[iconName] || iconName;
        
        const iconMap: Record<string, React.ReactElement> = {
            'planning': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            'home': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0m-11.25-9.375h11.25C18.621 11.625 19.125 11.121 19.125 10.5V9.15c0-.201-.075-.402-.225-.563L12.375 2.062a.75.75 0 00-1.061 0L4.8 8.587c-.15.161-.225.362-.225.563v.939c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
            'search': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            ),
            'money': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'legal': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            'box': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
            'truck': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V8.5a1.5 1.5 0 011.5-1.5h3.25V15a1.5 1.5 0 01-1.5 1.5H8.25zM10.5 18.75a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75zm4.5-13.5V15a1.5 1.5 0 001.5 1.5h3.25a1.5 1.5 0 003 0V8.5a1.5 1.5 0 00-1.5-1.5H15zm4.5 13.5a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75z" />
                </svg>
            ),
            'settling': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            ),
            'sparkle': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            )
        };
        return iconMap[mappedIconName] || null;
    };

    // Real-time countdown calculation
    useEffect(() => {
        if (!personalDetails.movingDate) {
            setCountdownStatus('no-date');
            return;
        }

        const calculateCountdown = () => {
            const now = new Date().getTime();
            const moveDate = new Date(personalDetails.movingDate).getTime();
            const difference = moveDate - now;

            if (difference > 86400000) { // More than 1 day away
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                setCountdown({ days, hours, minutes, seconds });
                setCountdownStatus('future');
            } else if (difference > 0 && difference <= 86400000) { // Today (within 24 hours)
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                setCountdown({ days: 0, hours, minutes, seconds });
                setCountdownStatus('today');
            } else { // Move date has passed
                const daysPassed = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
                setCountdown({ days: daysPassed, hours: 0, minutes: 0, seconds: 0 });
                setCountdownStatus('overdue');
            }
        };

        // Calculate immediately
        calculateCountdown();

        // Update every second for real-time countdown
        const interval = setInterval(calculateCountdown, 1000);

        return () => clearInterval(interval);
    }, [personalDetails.movingDate]);

    // Format move date for display
    const formatMoveDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Timeline component removed from Overview; keep helpers if needed elsewhere later

    // Compute overall progress the same way as Move Details: average of per-section progress
    const computedOverallProgress = (() => {
        // Prefer parent's getSectionProgress if provided for exact parity
        if (typeof getSectionProgress === 'function') {
            const total = moveStages.reduce((acc, s) => acc + getSectionProgress(s.id), 0);
            return Math.round(total / (moveStages.length || 1));
        }
        // Fallback to averaging provided stage.progress (same as dashboard)
        const total = moveStages.reduce((acc, s) => acc + (s.progress || 0), 0);
        return Math.round(total / (moveStages.length || 1));
    })();

    // Fallback color function consistent with Move Details if parent didn't provide
    const colorForProgress = (p: number) =>
        typeof getProgressColor === 'function' ? getProgressColor(p) : (p > 0 ? 'bg-[#00BCD4]' : 'bg-gray-300');

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* My House Move Progress Timeline */}
            <CompleteMovingJourney
                overallProgress={computedOverallProgress}
                moveSections={moveStages.map(stage => ({
                    id: stage.id,
                    name: stage.label,
                    shortName: stage.shortLabel,
                    description: stage.description,
                    icon: stage.icon
                }))}
                activeSection={activeStage}
                onSectionClick={handleStageClick}
                getSectionProgress={(id: number) => {
                    if (typeof getSectionProgress === 'function') return getSectionProgress(id);
                    const stage = moveStages.find(s => s.id === id);
                    return stage ? (stage.progress || 0) : 0;
                }}
                getProgressColor={colorForProgress}
                getSectionIcon={getSectionIcon}
            />

            {/* Section 1 continued - Academy & Learning parts remain */}
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

            {/* House Move Journey Section with Tasks - Blue Container */}
            <div className="bg-[#E0F7FA] rounded-xl p-8 mb-10 shadow-sm">
                {/* CTA Tasks Management Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                                <span className="text-3xl mr-3">🎓</span>
                                My Moving Tasks
                            </h2>
                            <p className="text-gray-700">Drag & drop or select tasks to add to your Priority Tasks</p>
                        </div>
                        {selectedCtaTasks.size > 0 && (
                            <button
                                onClick={addSelectedTasksToPriority}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                            >
                                <span>📌 Add {selectedCtaTasks.size} to Priority</span>
                            </button>
                        )}
                    </div>

                    {/* Category Tabs */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {Object.entries(getCtaTasksByCategory()).map(([category, tasks]) => (
                            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                {/* Clickable Header */}
                                <div 
                                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors duration-200"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                        <span className="text-2xl mr-2">
                                            {category === 'Pre-Move' ? '📋' : category === 'In-Move' ? '🚚' : '🏡'}
                                        </span>
                                        {category}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {tasks.length} tasks
                                        </span>
                                        {/* Expand/Collapse Icon */}
                                        <div className="transition-transform duration-200">
                                            {expandedCategories.has(category) ? (
                                                <svg className="w-5 h-5 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Content */}
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    expandedCategories.has(category) ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className="space-y-3">
                                        {tasks.length > 0 ? tasks.map((task, index) => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id.toString())}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                                selectedCtaTasks.has(task.id.toString())
                                                    ? 'border-[#00BCD4] bg-[#E0F7FA] shadow-md'
                                                    : 'border-gray-200 bg-gray-50 hover:border-[#00BCD4] hover:shadow-md'
                                            }`}
                                            onClick={() => handleCtaTaskToggle(task.id.toString())}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCtaTasks.has(task.id.toString())}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleCtaTaskToggle(task.id.toString());
                                                            }}
                                                            className="w-4 h-4 text-[#00BCD4] bg-gray-100 border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2"
                                                        />
                                                        <h4 className="font-semibold text-[#1A237E] text-sm">
                                                            {task.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {task.description || 'Academy learning task'}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="bg-[#E0F7FA] text-[#1A237E] text-xs font-medium px-2 py-1 rounded-full">
                                                            {task.priority} priority
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            From Lesson
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center space-y-2">
                                                    <span className="text-lg">🎓</span>
                                                    <div className="text-xs text-gray-500 text-center mb-2">
                                                        Drag to Priority
                                                    </div>
                                                    
                                                    {/* Complete Button for Academy Learning Tasks */}
                                                    <button 
                                                        className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            
                                                            // Show confirmation dialog
                                                            const isConfirmed = window.confirm(
                                                                `Are you sure you want to mark "${task.title}" as completed?\n\nThis action cannot be undone.`
                                                            );
                                                            
                                                            if (!isConfirmed) {
                                                                return;
                                                            }

                                                            try {
                                                                // Call API to mark task as complete
                                                                const response = await fetch(`/api/tasks/${task.id}/complete`, {
                                                                    method: 'PATCH',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                    },
                                                                });

                                                                if (response.ok) {
                                                                    const data = await response.json();
                                                                    if (data.success) {
                                                                        // Show success message
                                                                        alert(`"${task.title}" has been marked as completed! 🎉`);
                                                                        
                                                                        // Optionally reload the page or update state to reflect completion
                                                                        // You might want to add state management here to remove completed tasks from the UI
                                                                    } else {
                                                                        throw new Error(data.message || 'Failed to complete task');
                                                                    }
                                                                } else {
                                                                    throw new Error('Failed to complete task');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error completing task:', error);
                                                                alert('Failed to complete the task. Please try again.');
                                                            }
                                                        }}
                                                        title="Mark as Completed"
                                                    >
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-2">
                                                    {category === 'Pre-Move' ? '📋' : category === 'In-Move' ? '🚚' : '🏡'}
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    No {category.toLowerCase()} tasks available
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Complete academy lessons to unlock tasks
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>                    {/* Instructions */}
                    <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-semibold text-[#1A237E] mb-2">How to add tasks to Priority:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• <strong>Drag & Drop:</strong> Drag any task card to your Priority Tasks section below</li>
                                    <li>• <strong>Select & Add:</strong> Check multiple tasks and click "Add to Priority" button</li>
                                    <li>• <strong>Quick Add:</strong> Click on any task card to select/deselect it</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Tasks & Move Countdown Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Priority Tasks Widget - Moovey Style */}
                    <div 
                        className="bg-white rounded-xl shadow-lg p-6"
                        onDrop={handleDropOnPriority}
                        onDragOver={handleDragOver}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎯</span>
                                <h2 className="text-xl font-bold text-[#1A237E]">Priority Tasks</h2>
                                {userPriorityTasks.length > 0 && (
                                    <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                                        +{userPriorityTasks.length} from Academy
                                    </span>
                                )}
                            </div>
                            <Link 
                                href="/housemover/tasks" 
                                className="text-sm text-white hover:text-white font-semibold transition-colors duration-200 bg-[#00BCD4] px-3 py-1 rounded-lg hover:bg-[#00ACC1]"
                            >
                                See All
                            </Link>
                        </div>

                        {/* Drop Zone Indicator */}
                        <div className="border-2 border-dashed border-[#00BCD4] rounded-lg p-3 mb-4 bg-[#E0F7FA] bg-opacity-50">
                            <div className="flex items-center justify-center space-x-2 text-[#1A237E]">
                                <span className="text-lg">📌</span>
                                <span className="text-sm font-medium">Drop CTA tasks here or scroll down to add them manually</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {getCombinedPriorityTasks().slice(0, 5).map((task, index) => (
                                <div 
                                    key={task.id}
                                    onClick={() => handleTaskClick(task.id)}
                                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                                        userPriorityTasks.some(ut => ut.id === task.id)
                                            ? 'bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400'
                                            : 'bg-[#F5F5F5] hover:bg-[#E0F7FA] hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xl">{task.icon}</span>
                                        <div>
                                            <p className="font-semibold text-[#1A237E] text-sm">{task.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {task.dueDate}
                                                {userPriorityTasks.some(ut => ut.id === task.id) && (
                                                    <span className="ml-2 text-purple-600 font-medium">• From Academy</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            task.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                                            task.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {task.urgency === 'urgent' ? 'HIGH' : task.urgency === 'moderate' ? 'MED' : 'LOW'}
                                        </span>
                                        {userPriorityTasks.some(ut => ut.id === task.id) ? (
                                            <>
                                                {/* Complete Button for Academy Tasks */}
                                                <button 
                                                    className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white"
                                                    onClick={(e) => handleTaskComplete(task.id, e)}
                                                    title="Mark as Completed"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Remove Button for Academy Tasks */}
                                                <button 
                                                    className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200 text-white"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const success = await removeFromPriorityList(task.id);
                                                        if (success) {
                                                            setUserPriorityTasks(prev => prev.filter(ut => ut.id !== task.id));
                                                        }
                                                    }}
                                                    title="Remove from Priority Tasks"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                className="p-2 rounded-full bg-[#00BCD4] hover:bg-[#00ACC1] transition-colors duration-200 text-white"
                                                onClick={(e) => handleTaskComplete(task.id, e)}
                                                title="Mark as Completed"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Stats Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center text-sm font-medium text-[#1A237E]">
                                <span>🎯 {taskStats.pending} tasks remaining</span>
                                <span className="bg-[#E0F7FA] px-2 py-1 rounded-full text-[#00BCD4] font-semibold">🏆 Earn coins!</span>
                            </div>
                        </div>
                    </div>

                    {/* Move Countdown */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                            <span className="text-2xl mr-2">⏰</span>
                            Move Countdown
                        </h3>
                        
                        <div className="text-center">
                            {countdownStatus === 'no-date' ? (
                                <div className="bg-gray-100 rounded-lg p-6 mb-4">
                                    <div className="text-6xl mb-2">📅</div>
                                    <p className="text-lg font-semibold text-gray-800 mb-2">No Move Date Set</p>
                                    <Link 
                                        href="/housemover/move-details?section=1#personal-details"
                                        className="inline-block bg-[#00BCD4] text-white px-4 py-2 rounded-lg hover:bg-[#00ACC1] transition-colors font-semibold"
                                    >
                                        Set Your Move Date
                                    </Link>
                                </div>
                            ) : countdownStatus === 'overdue' ? (
                                <div className="bg-red-100 rounded-lg p-6 mb-4">
                                    <div className="text-4xl font-bold text-red-800 mb-2">
                                        {countdown.days}
                                    </div>
                                    <p className="text-sm font-semibold text-red-800 mb-2">DAYS SINCE MOVE DATE!</p>
                                    <p className="text-xs text-red-700">Your move date was {formatMoveDate(personalDetails.movingDate)}</p>
                                </div>
                            ) : countdownStatus === 'today' ? (
                                <div className="bg-orange-100 rounded-lg p-6 mb-4">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="bg-orange-500 rounded-lg p-3 text-white">
                                            <div className="text-2xl font-bold">{countdown.hours}</div>
                                            <div className="text-xs font-semibold">HOURS</div>
                                        </div>
                                        <div className="bg-orange-500 rounded-lg p-3 text-white">
                                            <div className="text-2xl font-bold">{countdown.minutes}</div>
                                            <div className="text-xs font-semibold">MINS</div>
                                        </div>
                                        <div className="bg-orange-500 rounded-lg p-3 text-white">
                                            <div className="text-2xl font-bold">{countdown.seconds}</div>
                                            <div className="text-xs font-semibold">SECS</div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-orange-800">MOVING DAY IS TODAY! 🎉</p>
                                </div>
                            ) : (
                                <div className="bg-[#00BCD4] rounded-lg p-6 mb-4">
                                    {countdown.days > 30 ? (
                                        <>
                                            <div className="text-4xl font-bold text-white mb-2">
                                                {countdown.days}
                                            </div>
                                            <p className="text-sm font-semibold text-white">DAYS TO MOVE!</p>
                                        </>
                                    ) : countdown.days > 7 ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white bg-opacity-30 rounded-lg p-3 border border-white border-opacity-20">
                                                    <div className="text-3xl font-bold text-black">{countdown.days}</div>
                                                    <div className="text-sm font-bold text-black">DAYS</div>
                                                </div>
                                                <div className="bg-white bg-opacity-30 rounded-lg p-3 border border-white border-opacity-20">
                                                    <div className="text-3xl font-bold text-black">{countdown.hours}</div>
                                                    <div className="text-sm font-bold text-black">HOURS</div>
                                                </div>
                                            </div>
                                            <p className="text-lg font-bold text-white drop-shadow-lg">GETTING CLOSE! 🏃‍♂️</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                                    <div className="text-xl font-bold text-white">{countdown.days}</div>
                                                    <div className="text-xs font-semibold text-white">DAYS</div>
                                                </div>
                                                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                                    <div className="text-xl font-bold text-white">{countdown.hours}</div>
                                                    <div className="text-xs font-semibold text-white">HRS</div>
                                                </div>
                                                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                                    <div className="text-xl font-bold text-white">{countdown.minutes}</div>
                                                    <div className="text-xs font-semibold text-white">MIN</div>
                                                </div>
                                                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                                    <div className="text-xl font-bold text-white">{countdown.seconds}</div>
                                                    <div className="text-xs font-semibold text-white">SEC</div>
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold text-white">ALMOST TIME! 🏃‍♂️</p>
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="bg-[#E0F7FA] rounded-lg p-3">
                                <p className="text-xs font-medium text-[#1A237E]">
                                    {personalDetails.movingDate ? 
                                        `Target Move Date: ${formatMoveDate(personalDetails.movingDate)}` : 
                                        'Set your move date in Personal Details to see countdown'
                                    }
                                </p>
                                {personalDetails.movingDate && (
                                    <Link 
                                        href="/housemover/move-details?section=1#personal-details"
                                        className="inline-block mt-2 text-xs text-[#00BCD4] hover:text-[#00ACC1] font-semibold"
                                    >
                                        Update Move Date →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2 - Vouchers & Rewards */}
            <section className="bg-white rounded-xl shadow-lg p-8">
                {/* Coins & Voucher Rewards Section */}
                <div className="mb-10">
                    <div className="bg-[#00BCD4] rounded-xl p-6 text-white shadow-lg">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            {/* Left Side - Current Coins */}
                            <div className="mb-6 lg:mb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white bg-opacity-20 rounded-full p-3">
                                        <span className="text-3xl">🪙</span>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-80 mb-1">Coins Earned</div>
                                        <div className="text-4xl font-bold">2,459</div>
                                        <div className="text-sm opacity-90">Keep earning to unlock vouchers!</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side - Next Voucher Progress */}
                            <div className="w-full lg:w-auto lg:min-w-80">
                                <div className="bg-white rounded-xl p-4">
                                    <div className="text-sm font-medium mb-2 text-gray-800">Next Voucher Progress</div>
                                    <div className="text-lg font-bold mb-3 text-[#1A237E]">
                                        41 more coins for £25 Moving Services Discount
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="bg-[#F5F5F5] rounded-full h-3 mb-3 overflow-hidden">
                                        <div 
                                            className="bg-[#00BCD4] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                                            style={{ width: '98.4%' }}
                                        ></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700">98.4% complete</span>
                                        <span className="font-medium text-[#00BCD4]">Gold Tier</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Available Vouchers */}
                        <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Available Vouchers</h3>
                                <button className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg transition-colors">
                                    View All
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Bronze Voucher */}
                                <div className="bg-white rounded-lg p-4 text-gray-900">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                            <span className="font-medium">Bronze</span>
                                        </div>
                                        <span className="text-xs text-gray-500">500 coins</span>
                                    </div>
                                    <div className="text-lg font-bold text-amber-600 mb-2">£5 Discount</div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                        Redeem Now
                                    </button>
                                </div>
                                
                                {/* Silver Voucher */}
                                <div className="bg-white rounded-lg p-4 text-gray-900">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                            <span className="font-medium">Silver</span>
                                        </div>
                                        <span className="text-xs text-gray-500">1000 coins</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-600 mb-2">£10 Discount</div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                        Redeem Now
                                    </button>
                                </div>
                                
                                {/* Next Tier Preview */}
                                <div className="bg-[#F5F5F5] rounded-lg p-4 text-gray-900 border-2 border-dashed border-gray-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
                                            <span className="font-medium text-gray-600">Gold</span>
                                        </div>
                                        <span className="text-xs text-gray-500">2500 coins</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-500 mb-2">£25 Discount</div>
                                    <div className="w-full bg-[#F5F5F5] text-gray-600 py-2 px-4 rounded-lg text-sm font-medium text-center">
                                        41 more coins
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Earn Actions */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    +10 Daily Login
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    +25 Achievement
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                    +50 Profile Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6 - Statistics Dashboard */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: "🏆", label: "Total Points", value: "2150", color: "#00BCD4", bgColor: "bg-[#E0F7FA]" },
                    { icon: "👥", label: "Connections", value: "12", color: "#1A237E", bgColor: "bg-white" },
                    { icon: "⭐", label: "Achievements", value: "3", color: "#00BCD4", bgColor: "bg-[#F5F5F5]" }
                ].map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-bold text-[#1A237E] mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-gray-600">{stat.label.toUpperCase()}</div>
                        </div>
                        <div className="h-2 bg-[#00BCD4] rounded-full"></div>
                    </div>
                ))}
            </section>

            {/* Section 7 - Call-to-Action Area */}
            <section className="text-center">
                <Link 
                    href="/move-details" 
                    className="inline-flex items-center px-10 py-4 bg-[#00BCD4] text-white font-semibold text-lg rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Continue Your Moving Journey
                    <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </section>
        </div>
    );
}