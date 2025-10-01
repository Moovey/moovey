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
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link rel="dns-prefetch" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap" rel="stylesheet" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-500-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-600-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="academy" />

                {/* Hero Section with Moovey Crest */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Moovey Crest Logo */}
                        <div className="mb-8">
                            <div className="mx-auto">
                                <img 
                                    src="/images/moovey-crest.png" 
                                    alt="Moovey Crest" 
                                    className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 mx-auto object-contain"
                                />
                            </div>
                           
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                            Welcome to Moovey School – Your<br />
                            <span className="text-[#00BCD4]">Learning Journey</span> Starts Here!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Get started with our elite structured e-learning modules.
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

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
