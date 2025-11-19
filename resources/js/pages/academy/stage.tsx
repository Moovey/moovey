import { Head } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { ArrowLeft, Clock, Star, CheckCircle, Lock, Play } from 'lucide-react';
import { router } from '@inertiajs/react';

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

interface StagePageProps {
    stage: string;
    stageBadge: string;
    stageLessons: Lesson[];
    stageProgress: StageProgress;
    isAuthenticated: boolean;
}

export default function StagePage({
    stage,
    stageBadge,
    stageLessons = [],
    stageProgress = { total: 0, completed: 0, percentage: 0 },
    isAuthenticated
}: StagePageProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'text-green-600 bg-green-100';
            case 'intermediate': return 'text-yellow-600 bg-yellow-100';
            case 'advanced': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleStartLesson = (lesson: Lesson) => {
        if (!lesson.is_accessible && isAuthenticated) {
            alert('🔒 You must complete the previous lessons to access this one.');
            return;
        }
        router.visit(`/academy/lesson/${lesson.id}`);
    };

    const handleBackToAcademy = () => {
        router.visit('/academy');
    };

    return (
        <>
            <Head title={`${stage} - Lessons | Moovey Academy`}>
                <meta name="description" content={`Learn with ${stage} lessons in Moovey Academy`} />
            </Head>

            <div className="min-h-screen bg-gray-50">
                <GlobalHeader currentPage="academy" />

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* Navigation */}
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 overflow-x-auto">
                        <button
                            onClick={handleBackToAcademy}
                            className="flex items-center gap-1 hover:text-[#17B7C7] transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Back to Academy</span>
                            <span className="xs:hidden">Academy</span>
                        </button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium truncate">{stage}</span>
                    </div>

                    {/* Stage Header */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <img 
                                src={`/images/Badges/${stageBadge}`} 
                                alt={`${stage} badge`}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stage}</h1>
                                <p className="text-sm sm:text-base text-gray-600">
                                    <span className="inline sm:hidden">{stageProgress.completed}/{stageProgress.total} lessons</span>
                                    <span className="hidden sm:inline">{stageProgress.completed} of {stageProgress.total} lessons completed</span>
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-lg sm:text-xl font-bold text-[#17B7C7]">
                                    {Math.round(stageProgress.percentage)}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2">
                            <div 
                                className="bg-[#17B7C7] h-2 sm:h-3 rounded-full transition-all duration-300"
                                style={{ width: `${stageProgress.percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            <span className="hidden sm:inline">{Math.round(stageProgress.percentage)}% Complete</span>
                            <span className="sm:hidden">Progress: {Math.round(stageProgress.percentage)}%</span>
                        </p>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {stageLessons && stageLessons.length > 0 && stageLessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                                    lesson.is_accessible 
                                        ? 'hover:shadow-md hover:border-[#17B7C7] cursor-pointer active:scale-[0.98]' 
                                        : 'opacity-60 cursor-not-allowed'
                                }`}
                                onClick={() => handleStartLesson(lesson)}
                            >
                                {/* Lesson Header */}
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                            <span className="text-xs sm:text-sm font-medium text-gray-500 flex-shrink-0">
                                                Lesson {lesson.lesson_order}
                                            </span>
                                            {lesson.is_completed && (
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                                            )}
                                            {!lesson.is_accessible && (
                                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-[#17B7C7]" />
                                        </div>
                                    </div>

                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {lesson.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                                        {lesson.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="truncate">{lesson.duration}</span>
                                            </div>
                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    <span className="hidden xs:inline">{lesson.difficulty}</span>
                                                    <span className="xs:hidden">{lesson.difficulty.charAt(0)}</span>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {lesson.progress_percentage > 0 && (
                                    <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div 
                                                className="bg-[#17B7C7] h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${lesson.progress_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Footer */}
                                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartLesson(lesson);
                                        }}
                                        disabled={!lesson.is_accessible}
                                        className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                            lesson.is_accessible
                                                ? lesson.is_completed
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                                                    : 'bg-[#17B7C7] text-white hover:bg-[#139AAA] active:bg-[#0F8A9A]'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span className="hidden xs:inline">
                                            {!lesson.is_accessible 
                                                ? '🔒 Locked' 
                                                : lesson.is_completed 
                                                    ? '✅ Review Lesson'
                                                    : '▶️ Start Lesson'
                                            }
                                        </span>
                                        <span className="xs:hidden">
                                            {!lesson.is_accessible 
                                                ? '🔒' 
                                                : lesson.is_completed 
                                                    ? '✅ Review'
                                                    : '▶️ Start'
                                            }
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {(!stageLessons || stageLessons.length === 0) && (
                        <div className="text-center py-12 sm:py-16 px-4">
                            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📚</div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Lessons Available</h3>
                            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                                Lessons for this stage are being prepared and will be available soon.
                            </p>
                        </div>
                    )}
                </div>

                <WelcomeFooter />
            </div>
        </>
    );
}