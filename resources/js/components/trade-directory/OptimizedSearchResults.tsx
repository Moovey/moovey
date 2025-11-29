import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
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
    is_saved?: boolean;
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
    const [isSaved, setIsSaved] = useState(provider.is_saved || false);

    // Inertia form for saving provider
    const saveForm = useForm({
        business_profile_id: provider.id,
    });

    // Inertia form for unsaving provider
    const unsaveForm = useForm({});

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(true);
    }, []);

    // Handle save provider with Inertia
    const handleSaveProvider = useCallback(() => {
        saveForm.post('/api/saved-providers', {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaved(true);
                toast.success('Provider saved successfully!');
                // Cache this provider for quick access later
                tradeDirectoryCache.set(`provider-${provider.id}`, provider);
            },
            onError: (errors) => {
                console.error('Error saving provider:', errors);
                toast.error('Failed to save provider. Please try again.');
            },
        });
    }, [saveForm, provider]);

    // Handle unsave provider with Inertia
    const handleUnsaveProvider = useCallback(() => {
        unsaveForm.delete(`/api/saved-providers/${provider.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaved(false);
                toast.success('Provider removed from saved list');
            },
            onError: (errors) => {
                console.error('Error removing provider:', errors);
                toast.error('Failed to remove provider. Please try again.');
            },
        });
    }, [unsaveForm, provider.id]);

    const handleToggleSave = useCallback(() => {
        if (isSaved) {
            handleUnsaveProvider();
        } else {
            handleSaveProvider();
        }
    }, [isSaved, handleSaveProvider, handleUnsaveProvider]);

    const isSaving = saveForm.processing || unsaveForm.processing;

    // Memoize service icon based on services - Professional SVG icons
    const serviceIcon = useMemo(() => {
        const iconColor = "#FFFFFF";
        
        if (!provider.services?.length) {
            // Default - Building icon
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" />
                </svg>
            );
        }
        
        const services = provider.services.map(s => s.toLowerCase());
        
        // Moving/Removal services - Truck icon
        if (services.some(s => s.includes('moving') || s.includes('removal') || s.includes('transport'))) {
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m0 0v6m0-6a2 2 0 012 2v4m-2-6a2 2 0 00-2-2H8a2 2 0 00-2 2m0 0v6m0-6h8m-8 6H4m4 0v4m0-4h8m0 0v4m0-4h4m-12 4h.01M16 17h.01" />
                </svg>
            );
        }
        
        // Packing services - Box icon
        if (services.some(s => s.includes('packing') || s.includes('box'))) {
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            );
        }
        
        // Cleaning services - Sparkles icon
        if (services.some(s => s.includes('cleaning') || s.includes('clean'))) {
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            );
        }
        
        // Storage services - Archive icon
        if (services.some(s => s.includes('storage') || s.includes('warehouse'))) {
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            );
        }
        
        // Handyman/Repair services - Wrench icon
        if (services.some(s => s.includes('handyman') || s.includes('repair') || s.includes('maintenance'))) {
            return (
                <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            );
        }
        
        // Default - Building icon
        return (
            <svg className="w-8 h-8" fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" />
            </svg>
        );
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
                            serviceIcon
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
                            className={`flex-1 text-xs sm:text-sm transition-colors py-1 font-medium ${
                                isSaved 
                                    ? 'text-[#17B7C7]' 
                                    : 'text-gray-600 hover:text-[#17B7C7]'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleToggleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}
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