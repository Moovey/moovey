import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import GlobalHeader from '@/components/global-header';
import HeroBanner from '@/components/welcome/hero-banner';
import DashboardPreview from '@/components/welcome/dashboard-preview';
import CommunitySection from '@/components/welcome/community-section';
import FinalCTA from '@/components/welcome/final-cta';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import LazyComponent from '@/components/lazy-component';

// Lazy load heavy components
const FeaturedLessonsAsync = lazy(() => import('@/components/welcome/featured-lessons-async'));
const BusinessNetworkAsync = lazy(() => import('@/components/welcome/business-network-async'));

interface WelcomeProps {
    stats?: {
        total_lessons: number;
        featured_count: number;
        community_members: number;
        verified_businesses: number;
    };
}

export default function Welcome({ stats }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome to Moovey">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
            </Head>
            <div className="bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] min-h-screen font-sans">
                <GlobalHeader currentPage="home" />
                <HeroBanner />
                <DashboardPreview />
                
                <LazyComponent 
                    fallback={
                        <div className="py-20 bg-white">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
                                    <div className="grid lg:grid-cols-2 gap-12">
                                        <div className="bg-gray-200 h-96 rounded-2xl"></div>
                                        <div className="space-y-4">
                                            <div className="h-6 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <CommunitySection />
                </LazyComponent>
         
                <LazyComponent 
                    fallback={
                        <div className="py-20 bg-gray-100">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                                                <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
                                                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <Suspense fallback={<div className="py-20 bg-gray-100"><div className="text-center">Loading lessons...</div></div>}>
                        <FeaturedLessonsAsync />
                    </Suspense>
                </LazyComponent>

                <LazyComponent 
                    fallback={
                        <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="bg-white rounded-xl p-4 shadow-lg">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <Suspense fallback={<div className="py-20"><div className="text-center">Loading business network...</div></div>}>
                        <BusinessNetworkAsync />
                    </Suspense>
                </LazyComponent>
                
                <FinalCTA />
                <WelcomeFooter />
            </div>
        </>
    );
}