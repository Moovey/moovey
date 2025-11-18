import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import OptimizedHeroSearchSection from '@/components/trade-directory/OptimizedHeroSearchSection';
// Lazy load heavy results component to cut initial mobile bundle
const OptimizedSearchResults = lazy(() => import('@/components/trade-directory/OptimizedSearchResults'));
import { 
    LazyRecommendedServices, 
    LazyArticlesSection, 
    LazyFinalCTA 
} from '@/components/trade-directory/lazy';
import { useTradeDirectoryCache, tradeDirectoryCache } from '@/hooks/useTradeDirectoryCache';
import { PREDEFINED_SERVICES } from '@/constants/services';

// Hoisted static data to avoid reallocation each render
const LOCATIONS = [
    'London','South East','South West','Midlands','North','Scotland','Wales','Northern Ireland','Manchester','Birmingham','Liverpool','Leeds','Near me'
];

const DEFAULT_SERVICE_PROVIDERS = [
    { id: 1, name: "Ethan's Moving Crew", description: "Ethan and his team offer comprehensive moving services, including packing, loading, transportation, and unpacking. Highly rated by customers.", services: ["House Removals","Packing Service","Long-distance Moves"], logo_url: null, plan: "basic", user_name: "Ethan Smith", rating: 5, verified: true, response_time: "Usually responds within 2 hours", availability: "Available: Weekdays and Saturdays" },
    { id: 2, name: "Sophia's Packing Pros", description: "Sophia specialises in packing and unpacking services, ensuring the safe handling of belongings. Highly rated by customers.", services: ["Packing Service","Fragile-only Packing"], logo_url: null, plan: "premium", user_name: "Sophia Johnson", rating: 4, verified: true, response_time: "Usually responds within 1 hour", availability: "Available: Weekdays" },
    { id: 3, name: "Olivia's Cleaning Crew", description: "Olivia provides professional cleaning services for move-in and move-out situations. Highly rated by customers.", services: ["Cleaning","Deep Cleaning"], logo_url: null, plan: "basic", user_name: "Olivia Brown", rating: 5, verified: true, response_time: "Usually responds within 3 hours", availability: "Available: Weekdays and Sundays" }
];

const RECOMMENDED_SERVICES = [
    { name: "Moving Company", status: "completed", icon: "✅", priority: "Booked" },
    { name: "Packing Service", status: "recommended", icon: "⚠️", priority: "High Priority" },
    { name: "Cleaning Service", status: "missing", icon: "❌", priority: "Recommended" },
    { name: "Storage", status: "optional", icon: "⚠️", priority: "May be needed" },
    { name: "Utility Setup", status: "missing", icon: "❌", priority: "Not Arranged" }
];

const ARTICLES = [
    { title: "Top 5 Packing Tips for a Stress-Free Move", description: "Discover essential packing strategies to ensure your belongings arrive safely and your move flows organized.", image: "boxes" },
    { title: "How to Choose the Right Moving Company", description: "Essential tips for selecting a reliable moving company that fits your budget and timeline.", image: "boxes" },
    { title: "Moving Day Checklist: Don't Forget These Essentials", description: "A comprehensive checklist to ensure nothing gets overlooked on your big moving day.", image: "boxes" }
];

export default function TradeDirectory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Your Location');
    const [selectedService, setSelectedService] = useState('I\'m looking for a...');
    const [selectedRegion, setSelectedRegion] = useState('Location...');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Use optimized cache hook
    const { search, loading, error, setError } = useTradeDirectoryCache({
        ttl: 10 * 60 * 1000, // 10 minutes
        maxSize: 50,
        debounceMs: 300
    });

    const serviceTypes = [...PREDEFINED_SERVICES];

    const locations = LOCATIONS;

    const serviceProviders = DEFAULT_SERVICE_PROVIDERS;

    const recommendedServices = RECOMMENDED_SERVICES;

    // Optimized search handler with caching
    const handleSearch = useCallback(async (searchParams: {
        query: string;
        location: string;
        service: string;
        rating: string;
        keywords: string;
    }, page = 1) => {
        try {
            setError(null);
            
            const result = await search({
                ...searchParams,
                page
            });

            setSearchResults(result.results);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setTotalResults(result.total);
            setHasMore(result.hasMore);
            setHasSearched(true);
        } catch (err) {
            console.error('Search error:', err);
            setHasSearched(true);
        }
    }, [search, setError]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        const searchParams = {
            query: searchQuery,
            location: selectedLocation,
            service: selectedService,
            rating: ratingFilter,
            keywords: ''
        };
        
        handleSearch(searchParams, page);
    }, [handleSearch, searchQuery, selectedLocation, selectedService, ratingFilter]);

    // Preload default providers on mount
    useEffect(() => {
        const preloadDefault = async () => {
            const cachedDefault = tradeDirectoryCache.get('default-providers');
            if (!cachedDefault) {
                // Cache default providers for faster initial load
                tradeDirectoryCache.set('default-providers', serviceProviders, 30 * 60 * 1000); // 30 minutes
            }
        };
        
        preloadDefault();
    }, []);

    // Idle prefetch: warm up heavy chunks and optional API after initial paint without blocking critical path
    useEffect(() => {
        const idleTask = () => {
            // Prefetch results component chunk
            import('@/components/trade-directory/OptimizedSearchResults');
            // Prefetch lazy grouped components chunk
            import('@/components/trade-directory/lazy');
            // Warm API cache (small limit) if not already cached
            fetch('/api/business/search?limit=5', { credentials: 'same-origin' }).catch(() => {});
        };
        if (typeof (window as any).requestIdleCallback === 'function') {
            (window as any).requestIdleCallback(idleTask, { timeout: 3000 });
        } else {
            setTimeout(idleTask, 1500);
        }
    }, []);

    const articles = ARTICLES;

    return (
        <>
            <Head title="Trade Directory - Find Movers & Services">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
                {/* Preload only critical image (removed unused API preload to avoid console warning) */}
                <link rel="preload" href="/images/trade-directory-banner.webp" as="image" fetchPriority="high" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="trade-directory" />

                {/* Optimized Hero Section with Search */}
                <OptimizedHeroSearchSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedService={selectedService}
                    setSelectedService={setSelectedService}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    ratingFilter={ratingFilter}
                    setRatingFilter={setRatingFilter}
                    serviceTypes={serviceTypes}
                    locations={locations}
                    onSearch={handleSearch}
                    isSearching={loading}
                />

                {/* Lazy-loaded Recommended Services Section */}
                <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
                    <LazyRecommendedServices recommendedServices={recommendedServices} />
                </Suspense>

                {/* Optimized Search Results Section */}
                {hasSearched && (
                    <>
                        {error ? (
                            <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                                <div className="max-w-7xl mx-auto text-center">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-red-800 mb-2">Search Error</h3>
                                        <p className="text-red-600">{error}</p>
                                        <button 
                                            onClick={() => {
                                                setError(null);
                                                setHasSearched(false);
                                            }}
                                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </section>
                        ) : searchResults.length > 0 || loading ? (
                            <OptimizedSearchResults 
                                serviceProviders={searchResults}
                                total={totalResults}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                hasMore={hasMore}
                                onPageChange={handlePageChange}
                                loading={loading}
                            />
                        ) : !loading ? (
                            <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                                <div className="max-w-7xl mx-auto text-center">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Results Found</h3>
                                        <p className="text-yellow-600">
                                            We couldn't find any businesses matching your search criteria. Try adjusting your search terms or browse our recommended services below.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        ) : null}
                    </>
                )}

                {/* Show default content when no search has been performed */}
                {!hasSearched && (
                    <Suspense fallback={<div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"><div className="max-w-7xl mx-auto space-y-4"><div className="h-8 w-40 bg-gray-200 rounded animate-pulse" /><div className="h-40 bg-white rounded-xl shadow animate-pulse" /></div></div>}>
                        <OptimizedSearchResults 
                            serviceProviders={serviceProviders}
                            loading={loading}
                        />
                    </Suspense>
                )}

                {/* Lazy-loaded What to Read Next Section */}
                <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg mx-4 my-8" />}>
                    <LazyArticlesSection articles={articles} />
                </Suspense>

                {/* Lazy-loaded Final CTA Section */}
                <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
                    <LazyFinalCTA />
                </Suspense>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
