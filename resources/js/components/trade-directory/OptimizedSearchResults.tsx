import { Link } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import { tradeDirectoryCache } from '@/hooks/useTradeDirectoryCache';

interface ServiceProvider {
    id: number;
    name: string;
    description: string;
    services: string[];
    logo_url: string | null;
    plan: string;
    user_name: string;
    rating: number;
    verified: boolean;
    response_time: string;
    availability: string;
}

interface OptimizedSearchResultsProps {
    serviceProviders: ServiceProvider[];
    total?: number;
    currentPage?: number;
    totalPages?: number;
    hasMore?: boolean;
    onPageChange?: (page: number) => void;
    loading?: boolean;
}

// Memoized service provider card component
const ServiceProviderCard = ({ provider }: { provider: ServiceProvider }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(true);
    }, []);

    // Memoize service icon based on services
    const serviceIcon = useMemo(() => {
        if (!provider.services?.length) return '🏢';
        
        const services = provider.services.map(s => s.toLowerCase());
        if (services.some(s => s.includes('moving') || s.includes('removal'))) return '🚚';
        if (services.some(s => s.includes('packing'))) return '📦';
        if (services.some(s => s.includes('cleaning'))) return '🧽';
        if (services.some(s => s.includes('storage'))) return '📁';
        return '🏢';
    }, [provider.services]);

    // Memoize rating stars
    const ratingStars = useMemo(() => 
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-base sm:text-lg ${i < provider.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
            </span>
        )), [provider.rating]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 lg:items-center">
                {/* Provider Info */}
                <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs sm:text-sm text-gray-600">{provider.availability}</span>
                        <div className="flex items-center">
                            {ratingStars}
                        </div>
                        {provider.verified && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                Verified
                            </span>
                        )}
                        {provider.plan === 'premium' && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                Premium
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{provider.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{provider.description}</p>
                    {provider.services && provider.services.length > 0 && (
                        <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                                {provider.services.slice(0, 3).map((service, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {service}
                                    </span>
                                ))}
                                {provider.services.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                        +{provider.services.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500">{provider.response_time}</p>
                </div>

                {/* Visual Illustration - Show logo or service-based icon */}
                <div className="flex justify-center lg:order-3">
                    <div className="w-20 h-12 sm:w-24 sm:h-16 bg-[#17B7C7] rounded-lg flex items-center justify-center overflow-hidden relative">
                        {provider.logo_url && !imageError ? (
                            <>
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                                )}
                                <img 
                                    src={provider.logo_url} 
                                    alt={`${provider.name} logo`} 
                                    className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                            </>
                        ) : (
                            <span className="text-white text-xl sm:text-2xl">
                                {serviceIcon}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3 lg:order-2">
                    <button className="w-full bg-[#17B7C7] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors text-sm sm:text-base">
                        Connect
                    </button>
                    <Link 
                        href={`/business-profile/${provider.id}`}
                        className="w-full border-2 border-[#17B7C7] text-[#17B7C7] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#17B7C7] hover:text-white transition-colors text-sm sm:text-base block text-center"
                    >
                        View Profile
                    </Link>
                    <div className="flex space-x-2">
                        <button className="flex-1 text-xs sm:text-sm text-gray-600 hover:text-[#17B7C7] transition-colors py-1">
                            Get Quote
                        </button>
                        <button 
                            className="flex-1 text-xs sm:text-sm text-gray-600 hover:text-[#17B7C7] transition-colors py-1"
                            onClick={() => {
                                // Cache this provider for quick access later
                                tradeDirectoryCache.set(`provider-${provider.id}`, provider);
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Memoized pagination component
const PaginationControls = ({ 
    currentPage = 1, 
    totalPages = 1, 
    onPageChange,
    loading = false 
}: {
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    loading?: boolean;
}) => {
    const visiblePages = useMemo(() => {
        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center flex-wrap gap-2 mt-8 sm:mt-12">
            <button 
                className="p-2 text-gray-600 hover:text-[#17B7C7] transition-colors disabled:opacity-50"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            {visiblePages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    disabled={loading}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-medium transition-colors text-sm sm:text-base disabled:opacity-50 ${
                        page === currentPage 
                            ? 'bg-[#17B7C7] text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {loading && page === currentPage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                        page
                    )}
                </button>
            ))}
            
            <button 
                className="p-2 text-gray-600 hover:text-[#17B7C7] transition-colors disabled:opacity-50"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default function OptimizedSearchResults({ 
    serviceProviders, 
    total,
    currentPage = 1,
    totalPages = 1,
    hasMore = false,
    onPageChange,
    loading = false
}: OptimizedSearchResultsProps) {
    // Memoize the results count text
    const resultsText = useMemo(() => {
        if (total !== undefined) {
            return `${total} providers found`;
        }
        return `${serviceProviders.length} providers found`;
    }, [total, serviceProviders.length]);

    // Memoize the service provider cards
    const providerCards = useMemo(() => 
        serviceProviders.map((provider) => (
            <ServiceProviderCard key={provider.id} provider={provider} />
        )), [serviceProviders]);

    if (loading && serviceProviders.length === 0) {
        return (
            <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        {Array.from({ length: 3 }, (_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-pulse">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center lg:order-3">
                                        <div className="w-20 h-12 sm:w-24 sm:h-16 bg-gray-200 rounded-lg"></div>
                                    </div>
                                    <div className="space-y-2 lg:order-2">
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
                        Search Results
                    </h2>
                    <p className="text-gray-600 text-center sm:text-right text-sm sm:text-base">
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" aria-label="Loading"></span>
                                Searching...
                            </span>
                        ) : (
                            resultsText
                        )}
                    </p>
                </div>

                <div className={`space-y-4 sm:space-y-6 ${loading ? 'opacity-50' : ''}`}>
                    {providerCards}
                </div>

                {/* Show pagination only if we have multiple pages */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    loading={loading}
                />

                {/* Load more button for progressive loading */}
                {hasMore && !loading && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => onPageChange?.(currentPage + 1)}
                            className="px-6 py-3 bg-[#17B7C7] text-white font-semibold rounded-lg hover:bg-[#139AAA] transition-colors"
                        >
                            Load More Results
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}