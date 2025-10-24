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
                <section className="h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] relative overflow-hidden bg-cover bg-center bg-no-repeat flex items-center" style={{backgroundImage: "url('/images/hero-banner2.webp')"}}>
                    {/* Background Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
                    
                    {/* Decorative elements - responsive positioning and sizing */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 lg:top-10 lg:right-10 xl:top-12 xl:right-12 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-6 md:bottom-16 md:left-8 lg:bottom-20 lg:left-10 xl:bottom-24 xl:left-12 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-white/5 rounded-full blur-lg"></div>
                    
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16">
                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16 items-center">
                            {/* Left Column - Content */}
                            <div className="text-center lg:text-left space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8 relative z-10">
                                <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                                        {heroData.title}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-white/95 leading-relaxed max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0 drop-shadow-lg font-medium px-2 sm:px-0">
                                        {heroData.description}
                                    </p>
                                </div>
                                
                                <div className="flex justify-center lg:justify-start pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6">
                                    <a 
                                        href={heroData.ctaLink}
                                        className="bg-[#17B7C7] text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5 2xl:px-14 2xl:py-6 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl hover:bg-[#139AAA] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                                    >
                                        {heroData.ctaText}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Quick Value Section (Three-Column Grid) - Critical content */}
                <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8 leading-tight">
                                Everything You Need for a <span className="text-[#17B7C7]">Successful Move</span>
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-600 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto leading-relaxed px-4 sm:px-0">
                                Access our comprehensive suite of moving resources, connect with trusted professionals, and join a supportive community.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16">
                            {valueProps.map((prop) => (
                                <div key={prop.id} className={`bg-gradient-to-br from-${prop.color}-50 to-white rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-3xl xl:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center`}>
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 bg-${prop.color === 'blue' ? '[#17B7C7]' : prop.color + '-500'} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12`}>
                                        {prop.icon === 'book' && (
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}
                                        {prop.icon === 'users' && (
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                        {prop.icon === 'chat' && (
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-8 leading-tight">{prop.title}</h3>
                                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12 leading-relaxed">
                                        {prop.description}
                                    </p>
                                    <a 
                                        href={prop.link}
                                        className={`bg-${prop.color === 'blue' ? '[#17B7C7] hover:bg-[#139AAA]' : prop.color + '-500 hover:bg-' + prop.color + '-600'} text-white px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full font-semibold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl transition-all duration-300 inline-block`}
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
                    <div className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-gray-100">
                        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                            <div className="h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] bg-gray-200 animate-pulse rounded-xl sm:rounded-2xl md:rounded-3xl">
                                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
                                    <div className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 2xl:h-16 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 2xl:h-8 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6">
                                        <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 2xl:h-8 bg-gray-300 rounded w-full"></div>
                                        <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 2xl:h-8 bg-gray-300 rounded w-5/6"></div>
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
                    <div className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-white">
                        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                            <div className="h-56 sm:h-64 md:h-72 lg:h-80 xl:h-88 2xl:h-96 bg-gray-100 animate-pulse rounded-xl sm:rounded-2xl md:rounded-3xl">
                                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
                                    <div className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 2xl:h-16 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 2xl:h-8 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 2xl:h-44 bg-gray-300 rounded"></div>
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
                    <div className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
                        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                            <div className="h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] bg-white/50 animate-pulse rounded-xl sm:rounded-2xl md:rounded-3xl">
                                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
                                    <div className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 2xl:h-16 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 2xl:h-8 bg-gray-300 rounded w-1/2 mx-auto"></div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                            <div className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 2xl:h-40 bg-gray-300 rounded"></div>
                                            <div className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 2xl:h-40 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="h-44 sm:h-52 md:h-60 lg:h-68 xl:h-76 2xl:h-84 bg-gray-300 rounded"></div>
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