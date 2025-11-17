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
                {/* Essential Meta Tags */}
                <meta name="description" content="Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey. Get expert moving advice, calculate costs, and connect with trusted professionals." />
                <meta name="keywords" content="moving, relocation, house moving, moving tools, moving calculator, mortgage calculator, affordability calculator, school catchment, moving community, moving professionals, UK moving, moving tips" />
                <meta name="author" content="Moovey" />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                
                {/* Open Graph Meta Tags */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Welcome to Moovey - Your Moving Journey Starts Here" />
                <meta property="og:description" content="Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey. Get expert moving advice, calculate costs, and connect with trusted professionals." />
                <meta property="og:image" content="/images/moovey-logo.webp" />
                <meta property="og:url" content="https://moovey.com" />
                <meta property="og:site_name" content="Moovey" />
                <meta property="og:locale" content="en_GB" />
                
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Welcome to Moovey - Your Moving Journey Starts Here" />
                <meta name="twitter:description" content="Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey." />
                <meta name="twitter:image" content="/images/moovey-logo.webp" />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://moovey.com" />
                
                {/* Language and Geographic Targeting */}
                <meta name="language" content="en-GB" />
                <meta name="geo.region" content="GB" />
                <meta name="geo.placename" content="United Kingdom" />
                
                {/* Structured Data - Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Moovey",
                        "url": "https://moovey.com",
                        "logo": "https://moovey.com/images/moovey-logo.webp",
                        "description": "Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey.",
                        "sameAs": [
                            "https://twitter.com/moovey",
                            "https://facebook.com/moovey",
                            "https://linkedin.com/company/moovey"
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "customer service",
                            "areaServed": "GB",
                            "availableLanguage": "English"
                        }
                    })}
                </script>
                
                {/* Structured Data - Website */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Moovey",
                        "url": "https://moovey.com",
                        "description": "Your complete moving journey platform with tools, education, and community support.",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://moovey.com/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })}
                </script>
                
                {/* Structured Data - FAQ */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is Moovey?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Moovey is a comprehensive moving platform that provides free e-learning, professional tools, trade connections, and community support to make your moving journey seamless and stress-free."
                                }
                            },
                            {
                                "@type": "Question", 
                                "name": "Are Moovey's tools free to use?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, all Moovey tools including the mortgage calculator, affordability calculator, school catchment map, volume calculator, and declutter list are completely free to use."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How can Moovey help with my house move?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Moovey helps through our comprehensive academy with moving courses, professional-grade calculators for planning your budget and logistics, a community for support and advice, and connections to trusted moving professionals."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Do I need to register to use Moovey tools?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "While registration unlocks additional features and personalized experiences, many of our tools can be used without creating an account."
                                }
                            }
                        ]
                    })}
                </script>
                
                {/* Font and Resource Loading */}
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
                
                {/* Preload critical resources */}
                <link rel="preload" href="/images/hero-banner2.webp" as="image" />
                <link rel="preload" href="/images/hero-banner3.webp" as="image" />
                <link rel="preload" href="/images/hero-banner4.webp" as="image" />
                <link rel="dns-prefetch" href="https://fonts.bunny.net" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>
            
            <div className="bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] min-h-screen font-sans">
                <GlobalHeader currentPage="home" />
                
                <main role="main" itemScope itemType="https://schema.org/WebPage">
                
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

                </main>
                
                <WelcomeFooter />
            </div>
        </>
    );
}