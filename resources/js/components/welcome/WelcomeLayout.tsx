import React, { Suspense } from 'react';
import { Head } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import HeroBanner from '@/components/welcome/sections/HeroBanner';
import ValuePropsSection from '@/components/welcome/sections/ValuePropsSection';
import SectionSkeleton from '@/components/welcome/sections/SectionSkeleton';

// Lazy load components for better performance with optimized loading
const CommunityFeedSection = React.lazy(() => 
    import('@/components/welcome/community-feed-section').then(module => ({ 
        default: module.default 
    }))
);
const ToolsShowcase = React.lazy(() => 
    import('@/components/welcome/tools-showcase').then(module => ({ 
        default: module.default 
    }))
);
const TestimonialsSection = React.lazy(() => 
    import('@/components/welcome/testimonials-section').then(module => ({ 
        default: module.default 
    }))
);

// Hooks and constants
import { useWelcomeStats } from '@/hooks/welcome/useWelcomeStats';
import { useHeroBanner } from '@/hooks/welcome/useHeroBanner';
import { HERO_DATA_ARRAY, VALUE_PROPS } from '@/constants/welcome';

// Skeleton components for lazy loaded sections
const CommunityFeedSkeleton = () => (
    <div className="py-12 md:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-64 md:h-80 bg-gray-200 rounded-2xl" />
        </div>
    </div>
);

const ToolsShowcaseSkeleton = () => (
    <div className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-64 md:h-80 bg-gray-100 rounded-2xl">
                <div className="p-8 space-y-4">
                    <div className="h-8 md:h-12 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 md:h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                    <div className="h-32 bg-gray-300 rounded mx-auto w-80"></div>
                </div>
            </div>
        </div>
    </div>
);

const TestimonialsSkeleton = () => (
    <div className="py-12 md:py-20 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-64 md:h-80 bg-white/50 rounded-2xl" />
        </div>
    </div>
);

export default function WelcomeLayout() {
    const { cachedStats } = useWelcomeStats();
    const { heroBanners, currentImageIndex, setCurrentImageIndex } = useHeroBanner();



    return (
        <>
            <Head title="Welcome to Moovey - Your Moving Journey Starts Here">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
                {/* Preload critical resources */}
                <link rel="preload" href="/images/hero-banner2.webp" as="image" />
                <link rel="preload" href="/images/hero-banner3.webp" as="image" />
                <link rel="preload" href="/images/hero-banner4.webp" as="image" />
                <link rel="dns-prefetch" href="https://fonts.bunny.net" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="description" content="Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey." />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            </Head>
            
            <div className="bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] min-h-screen font-sans">
                <GlobalHeader currentPage="home" />
                
                {/* 1. Hero Banner Section */}
                <HeroBanner
                    heroDataArray={HERO_DATA_ARRAY}
                    heroBanners={heroBanners}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                />

                {/* 2. Value Props Section */}
                <ValuePropsSection valueProps={VALUE_PROPS} />

                {/* 3. Community Feed Section - Lazy loaded */}
                <Suspense fallback={<CommunityFeedSkeleton />}>
                    <CommunityFeedSection 
                        stats={cachedStats ? {
                            activeMembers: cachedStats.activeMembers,
                            dailyPosts: cachedStats.dailyPosts,
                            helpRate: cachedStats.helpRate
                        } : undefined}
                    />
                </Suspense>

                {/* 4. Tools Showcase Section - Lazy loaded */}
                <Suspense fallback={<ToolsShowcaseSkeleton />}>
                    <ToolsShowcase />
                </Suspense>

                {/* 5. Testimonials Section - Lazy loaded */}
                <Suspense fallback={<TestimonialsSkeleton />}>
                    <TestimonialsSection 
                        stats={cachedStats ? {
                            successfulMoves: cachedStats.successfulMoves,
                            moneySaved: cachedStats.moneySaved,
                            satisfactionRate: cachedStats.satisfactionRate,
                            averageRating: cachedStats.averageRating
                        } : undefined}
                    />
                </Suspense>

                <WelcomeFooter />
            </div>
        </>
    );
}