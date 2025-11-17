import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import LessonViewer from '@/components/lesson-viewer';
import ProgressGauge from '@/components/academy/progress-gauge';
import LearningJourneyProgress from '@/components/academy/learning-journey-progress';
import ModuleCards from '@/components/academy/module-cards';
import ArticlesSection from '@/components/academy/articles-section';
import CtaSection from '@/components/academy/cta-section';

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

interface Props {
    lessons: Lesson[];
    lessonsByStage: Record<string, Lesson[]>;
    stageProgress: Record<string, StageProgress>;
    isAuthenticated: boolean;
    totalLessons: number;
    completedLessons: number;
}

export default function MooveyAcademy({ 
    lessons, 
    lessonsByStage, 
    stageProgress, 
    isAuthenticated, 
    totalLessons, 
    completedLessons 
}: Props) {
    // State for lesson viewing
    const [showLessons, setShowLessons] = useState(false);
    const [selectedStage, setSelectedStage] = useState<string>('');
    const [selectedStageBadge, setSelectedStageBadge] = useState<string>('');
    
    // State for lesson pagination in sidebar
    const [stagePagination, setStagePagination] = useState<{[key: string]: number}>({});
    
    // Get published lessons from props (already filtered by backend)
    const publishedLessons = lessons; // No need to filter again since backend already filters

    const handleBeginProgress = (stageName: string, stageBadge: string) => {
        setSelectedStage(stageName);
        setSelectedStageBadge(stageBadge);
        setShowLessons(true);
    };

    const handleBackToAcademy = () => {
        setShowLessons(false);
        setSelectedStage('');
        setSelectedStageBadge('');
    };

    // Helper function to sort lessons (incomplete first, then completed)
    const sortLessons = (lessons: any[]) => {
        return [...lessons].sort((a, b) => {
            // Prioritize incomplete lessons first
            if (!a.is_completed && b.is_completed) return -1;
            if (a.is_completed && !b.is_completed) return 1;
            
            // Then sort by lesson order
            return a.lesson_order - b.lesson_order;
        });
    };

    // Helper function to get paginated lessons for a stage
    const getPaginatedLessons = (stageName: string, lessons: any[]) => {
        const currentPage = stagePagination[stageName] || 1;
        const itemsPerPage = 3;
        const sortedLessons = sortLessons(lessons);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return {
            lessons: sortedLessons.slice(startIndex, endIndex),
            totalPages: Math.ceil(sortedLessons.length / itemsPerPage),
            currentPage,
            totalLessons: sortedLessons.length
        };
    };

    // Helper function to change page for a stage
    const changePage = (stageName: string, newPage: number) => {
        setStagePagination(prev => ({
            ...prev,
            [stageName]: newPage
        }));
    };

    // If showing lessons, render the lesson viewer
    if (showLessons) {
        return (
            <LessonViewer 
                stage={selectedStage}
                lessons={publishedLessons}
                onBack={handleBackToAcademy}
                stageBadge={selectedStageBadge}
                isAuthenticated={isAuthenticated}
            />
        );
    }
    return (
        <>
            <Head title="Moovey Academy - Your Learning Journey">
                {/* SEO Meta Tags */}
                <meta name="description" content="Master moving with our structured learning modules at Moovey Academy. Free e-learning courses, expert guidance, and comprehensive moving education to make your relocation journey smooth and stress-free." />
                <meta name="keywords" content="moving academy, moving courses, relocation education, moving tips, house moving guide, moving school, free moving courses, UK moving education" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph Meta Tags */}
                <meta property="og:title" content="Moovey Academy - Your Learning Journey" />
                <meta property="og:description" content="Master moving with our structured learning modules at Moovey Academy. Free e-learning courses and expert guidance for your relocation journey." />
                <meta property="og:image" content="/images/moovey-crest.webp" />
                <meta property="og:url" content="https://moovey.com/academy" />
                <meta property="og:type" content="website" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Moovey Academy - Your Learning Journey" />
                <meta name="twitter:description" content="Master moving with our structured learning modules at Moovey Academy." />
                <meta name="twitter:image" content="/images/moovey-crest.webp" />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://moovey.com/academy" />
                
                {/* Structured Data - Course */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        "name": "Moovey Academy - Moving Mastery Course",
                        "description": "Comprehensive moving education covering all aspects of house relocation, from planning to settling in.",
                        "provider": {
                            "@type": "Organization",
                            "name": "Moovey",
                            "url": "https://moovey.com"
                        },
                        "educationalLevel": "Beginner to Advanced",
                        "teaches": ["Moving Planning", "Logistics Management", "Property Research", "Moving Budgeting"],
                        "courseMode": "online",
                        "isAccessibleForFree": true,
                        "inLanguage": "en-GB",
                        "availableLanguage": "English"
                    })}
                </script>
                
                {/* Font Loading */}
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link rel="dns-prefetch" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap" rel="stylesheet" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-500-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-600-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <style>{`
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    @media (max-width: 640px) {
                        .xs\\:w-32 { width: 8rem; }
                        .xs\\:h-32 { height: 8rem; }
                        .xs\\:w-44 { width: 11rem; }
                        .xs\\:h-22 { height: 5.5rem; }
                        .xs\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                        .xs\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                        .xs\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                        .xs\\:px-4 { padding-left: 1rem; padding-right: 1rem; }
                        .xs\\:py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                    }
                `}</style>
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="academy" />

                <main role="main" itemScope itemType="https://schema.org/EducationalOrganization">
                    {/* Hero Section with Moovey Crest */}
                    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Moovey Crest Logo */}
                        <div className="mb-4 sm:mb-5 md:mb-6">
                            <div className="mx-auto">
                                <img 
                                    src="/images/moovey-crest.webp" 
                                    alt="Moovey Academy Crest - Official logo of Moovey School of Moovology" 
                                    width="208"
                                    height="208"
                                    className="w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 mx-auto object-contain"
                                    loading="eager"
                                    fetchPriority="high"
                                />
                            </div>
                        </div>

                        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
                            Welcome to Moovey School –<br className="hidden sm:block" />
                            <span className="block sm:inline"> Your</span><br className="sm:hidden" />
                            <span className="text-[#00BCD4]">Learning Journey</span> Starts Here!
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto px-4">
                            Master moving with our structured learning modules.
                        </p>

                        {/* Current Progress Indicator - Gauge Style */}
                        <ProgressGauge 
                            totalLessons={totalLessons}
                            completedLessons={completedLessons}
                            isAuthenticated={isAuthenticated}
                        />

                    </div>
                </section>

                {/* Learning Journey Progress */}
                <LearningJourneyProgress
                    lessonsByStage={lessonsByStage}
                    stageProgress={stageProgress}
                    isAuthenticated={isAuthenticated}
                    totalLessons={totalLessons}
                    completedLessons={completedLessons}
                    handleBeginProgress={handleBeginProgress}
                />

                {/* Module Cards (Course Lessons) */}
                <ModuleCards
                    lessonsByStage={lessonsByStage}
                    stageProgress={stageProgress}
                    isAuthenticated={isAuthenticated}
                    handleBeginProgress={handleBeginProgress}
                    stagePagination={stagePagination}
                    getPaginatedLessons={getPaginatedLessons}
                    changePage={changePage}
                />

                {/* What to Read Next */}
                <ArticlesSection />

                    {/* Final CTA Section */}
                    <CtaSection />
                </main>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
