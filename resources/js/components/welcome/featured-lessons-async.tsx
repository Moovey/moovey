import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: string;
}

interface FeaturedLessonsData {
    lessons: Lesson[];
}

// Skeleton loader component
const LessonCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
);

const ProgressSkeleton = () => (
    <div className="bg-white rounded-2xl p-8 max-w-md mx-auto mb-12 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-48 mx-auto"></div>
        <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="h-12 bg-gray-200 rounded-full"></div>
    </div>
);

export default function FeaturedLessonsAsync() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedLessons = async () => {
            try {
                const response = await fetch('/api/welcome/featured-lessons');
                const data: FeaturedLessonsData = await response.json();
                setLessons(data.lessons);
            } catch (error) {
                console.error('Failed to load featured lessons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedLessons();
    }, []);

    const getLessonIcon = (index: number) => {
        const icons = [
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3c0-.265.105-.52.293-.707L10.586 9.293a6 6 0 115.657 5.657z" />,
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />,
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />,
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        ];
        return icons[index % icons.length];
    };

    const getIconColor = (index: number) => {
        const colors = ['blue', 'yellow', 'red', 'green', 'purple', 'indigo'];
        return colors[index % colors.length];
    };

    return (
        <section className="py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                        Featured Lessons
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Explore our most popular moving guides and tutorials.
                    </p>
                    
                    {/* Your Learning Progress */}
                    {loading ? (
                        <ProgressSkeleton />
                    ) : (
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto mb-12 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Progress</h3>
                            
                            {/* Progress Circle */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                                    {/* Background circle */}
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#17B7C7"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="351.86"
                                        strokeDashoffset="348.46"
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">3</div>
                                        <div className="text-sm text-gray-600">of {lessons.length}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <Link 
                                href="/academy"
                                className="block w-full bg-[#17B7C7] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                            >
                                Continue Learning
                            </Link>
                        </div>
                    )}
                </div>

                {/* Lessons Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {loading 
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <LessonCardSkeleton key={index} />
                          ))
                        : lessons.map((lesson, index) => (
                            <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                                <div className={`w-16 h-16 bg-${getIconColor(index)}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <svg className={`w-8 h-8 text-${getIconColor(index)}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getLessonIcon(index)}
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{lesson.title}</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">{lesson.description}</p>
                                <a href={`/lessons/${lesson.id}`} className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                            </div>
                          ))
                    }
                </div>
            </div>
        </section>
    );
}