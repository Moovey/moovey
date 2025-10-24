import { Head } from '@inertiajs/react';
import { lazy, Suspense, useMemo, useEffect, useState } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

// Lazy load components for better performance
const CommunityFeedSection = lazy(() => import('@/components/welcome/community-feed-section'));
const ToolsShowcase = lazy(() => import('@/components/welcome/tools-showcase'));
const TestimonialsSection = lazy(() => import('@/components/welcome/testimonials-section'));

// Loading skeleton component
const SectionSkeleton = ({ height = 'h-64' }: { height?: string }) => (
    <div className={`${height} bg-gray-100 animate-pulse rounded-xl`}>
        <div className="p-8 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);

// Cached data interface
interface CachedStats {
    activeMembers: string;
    dailyPosts: string;
    helpRate: string;
    successfulMoves: string;
    moneySaved: string;
    satisfactionRate: string;
    averageRating: string;
    lastUpdated: number;
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function WelcomeLayoutTest() {
    // State for cached data and loading states
    const [cachedStats, setCachedStats] = useState<CachedStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Memoized static data to prevent re-renders
    const heroData = useMemo(() => ({
        title: "Stressed About Screwing Up Your Move?",
        description: "Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless journey from planning to settling.",
        ctaText: "Start Your Free Move Plan",
        ctaLink: "/register"
    }), []);

    const valueProps = useMemo(() => [
        {
            id: 'learn',
            title: 'Learn & Plan',
            description: 'Master the art of moving with our comprehensive guides, checklists, and expert-led courses designed to make you confident and prepared.',
            color: 'blue',
            icon: 'book',
            link: '/academy',
            linkText: 'Explore Academy'
        },
        {
            id: 'connect',
            title: 'Connect & Save',
            description: 'Find verified moving professionals, compare quotes, and connect with trusted service providers to save time and money.',
            color: 'green',
            icon: 'users',
            link: '/trade-directory',
            linkText: 'Browse Directory'
        },
        {
            id: 'track',
            title: 'Track & Engage',
            description: 'Stay on top of your move with our progress tracking tools and engage with a supportive community of fellow movers.',
            color: 'purple',
            icon: 'chat',
            link: '/community',
            linkText: 'See Community Feed'
        }
    ], []);

    // Load cached stats on component mount
    useEffect(() => {
        const loadCachedStats = () => {
            try {
                const cached = localStorage.getItem('moovey_stats');
                if (cached) {
                    const parsedCache: CachedStats = JSON.parse(cached);
                    const now = Date.now();
                    
                    // Check if cache is still valid
                    if (now - parsedCache.lastUpdated < CACHE_DURATION) {
                        setCachedStats(parsedCache);
                        return;
                    }
                }
                
                // Fetch fresh data if no cache or cache expired
                fetchFreshStats();
            } catch (error) {
                console.warn('Error loading cached stats:', error);
                fetchFreshStats();
            }
        };

        const fetchFreshStats = async () => {
            setIsLoading(true);
            try {
                // Simulate API call - replace with actual API endpoint
                const response = await fetch('/api/stats', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const freshStats: CachedStats = {
                        activeMembers: data.activeMembers || '10,000+',
                        dailyPosts: data.dailyPosts || '2,500+',
                        helpRate: data.helpRate || '98%',
                        successfulMoves: data.successfulMoves || '10,000+',
                        moneySaved: data.moneySaved || '£2M+',
                        satisfactionRate: data.satisfactionRate || '98%',
                        averageRating: data.averageRating || '4.9★',
                        lastUpdated: Date.now()
                    };
                    
                    setCachedStats(freshStats);
                    localStorage.setItem('moovey_stats', JSON.stringify(freshStats));
                } else {
                    // Fallback to default values
                    setDefaultStats();
                }
            } catch (error) {
                console.warn('Error fetching fresh stats:', error);
                setDefaultStats();
            } finally {
                setIsLoading(false);
            }
        };

        const setDefaultStats = () => {
            const defaultStats: CachedStats = {
                activeMembers: '10,000+',
                dailyPosts: '2,500+',
                helpRate: '98%',
                successfulMoves: '10,000+',
                moneySaved: '£2M+',
                satisfactionRate: '98%',
                averageRating: '4.9★',
                lastUpdated: Date.now()
            };
            setCachedStats(defaultStats);
        };

        loadCachedStats();
    }, []);

    // Eager load critical resources
    useEffect(() => {
        const preloadImages = () => {
            const images = ['/images/hero-banner2.webp'];
            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };

        preloadImages();
    }, []);

    return (
        <>
            <Head title="Welcome to Moovey - Your Moving Journey Starts Here">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
                {/* Preload critical resources */}
                <link rel="preload" href="/images/hero-banner2.webp" as="image" />
                <meta name="description" content="Moovey empowers you with free e-learning, tools, trade connections, and a community for a seamless moving journey." />
            </Head>
            <div className="bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] min-h-screen font-sans">
                <GlobalHeader currentPage="home" />
                
                {/* 1. Hero Banner (Above the Fold) - Critical content loaded immediately */}
                <section className="h-[50vh] md:h-[60vh] relative overflow-hidden bg-cover bg-center bg-no-repeat flex items-center" style={{backgroundImage: "url('/images/hero-banner2.webp')"}}>
                    {/* Background Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
                    
                    {/* Decorative elements - responsive positioning and sizing */}
                    <div className="absolute top-8 right-8 md:top-12 md:right-12 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-12 left-8 md:bottom-20 md:left-12 w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full blur-lg"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full py-8 md:py-16">
                        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                            {/* Left Column - Content */}
                            <div className="text-center lg:text-left space-y-4 sm:space-y-6 relative z-10">
                                <div className="space-y-3 sm:space-y-4">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                                        {heroData.title}
                                    </h1>
                                    <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-lg font-medium px-2 sm:px-0">
                                        {heroData.description}
                                    </p>
                                </div>
                                
                                <div className="flex justify-center lg:justify-start pt-4">
                                    <a 
                                        href={heroData.ctaLink}
                                        className="bg-[#17B7C7] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-[#139AAA] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                                    >
                                        {heroData.ctaText}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Quick Value Section (Three-Column Grid) - Critical content */}
                <section className="py-12 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                Everything You Need for a <span className="text-[#17B7C7]">Successful Move</span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Access our comprehensive suite of moving resources, connect with trusted professionals, and join a supportive community.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {valueProps.map((prop) => (
                                <div key={prop.id} className={`bg-gradient-to-br from-${prop.color}-50 to-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center`}>
                                    <div className={`w-16 h-16 md:w-20 md:h-20 bg-${prop.color === 'blue' ? '[#17B7C7]' : prop.color + '-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                        {prop.icon === 'book' && (
                                            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}
                                        {prop.icon === 'users' && (
                                            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                        {prop.icon === 'chat' && (
                                            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">{prop.title}</h3>
                                    <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
                                        {prop.description}
                                    </p>
                                    <a 
                                        href={prop.link}
                                        className={`bg-${prop.color === 'blue' ? '[#17B7C7] hover:bg-[#139AAA]' : prop.color + '-500 hover:bg-' + prop.color + '-600'} text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all duration-300 inline-block`}
                                    >
                                        {prop.linkText}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Community Feed Snippet (Dynamic Preview) - Lazy loaded */}
                <Suspense fallback={
                    <div className="py-12 md:py-20 bg-gray-100">
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <div className="h-64 md:h-80 bg-gray-200 animate-pulse rounded-2xl">
                                <div className="p-8 space-y-4">
                                    <div className="h-8 md:h-12 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 md:h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 md:h-6 bg-gray-300 rounded w-full"></div>
                                        <div className="h-4 md:h-6 bg-gray-300 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }>
                    <CommunityFeedSection 
                        stats={cachedStats ? {
                            activeMembers: cachedStats.activeMembers,
                            dailyPosts: cachedStats.dailyPosts,
                            helpRate: cachedStats.helpRate
                        } : undefined}
                    />
                </Suspense>

                {/* 4. Tools Showcase (Grid) - Lazy loaded */}
                <Suspense fallback={
                    <div className="py-12 md:py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <div className="h-64 md:h-80 bg-gray-100 animate-pulse rounded-2xl">
                                <div className="p-8 space-y-4">
                                    <div className="h-8 md:h-12 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 md:h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-24 md:h-32 bg-gray-300 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }>
                    <ToolsShowcase />
                </Suspense>

                {/* 5. Testimonials / Social Proof Section - Lazy loaded */}
                <Suspense fallback={
                    <div className="py-12 md:py-20 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <div className="h-64 md:h-80 bg-white/50 animate-pulse rounded-2xl">
                                <div className="p-8 space-y-4">
                                    <div className="h-8 md:h-12 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 md:h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="h-20 md:h-24 bg-gray-300 rounded"></div>
                                            <div className="h-20 md:h-24 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="h-44 md:h-52 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }>
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