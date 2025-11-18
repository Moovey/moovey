import { useState, useEffect, useMemo, useCallback } from 'react';
import { POPULAR_SERVICES } from '@/constants/services';
import { tradeDirectoryCache } from '@/hooks/useTradeDirectoryCache';

interface OptimizedHeroSearchSectionProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedLocation: string;
    setSelectedLocation: (location: string) => void;
    selectedService: string;
    setSelectedService: (service: string) => void;
    selectedRegion: string;
    setSelectedRegion: (region: string) => void;
    ratingFilter: string;
    setRatingFilter: (rating: string) => void;
    serviceTypes: string[];
    locations: string[];
    onSearch: (searchParams: {
        query: string;
        location: string;
        service: string;
        rating: string;
        keywords: string;
    }) => void;
    isSearching?: boolean;
}

export default function OptimizedHeroSearchSection({
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    selectedService,
    setSelectedService,
    selectedRegion,
    setSelectedRegion,
    ratingFilter,
    setRatingFilter,
    serviceTypes,
    locations,
    onSearch,
    isSearching = false
}: OptimizedHeroSearchSectionProps) {
    
    const [keywordsInput, setKeywordsInput] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Preload the mascot image
    useEffect(() => {
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => {
            setImageError(true);
            setImageLoaded(true);
        };
        img.src = '/images/trade-directory-banner.webp';
    }, []);

    // Prefetch popular services data
    useEffect(() => {
        const prefetchPopularServices = async () => {
            const prefetchKeys = POPULAR_SERVICES.map(service => `search-${service.toLowerCase()}`);
            
            await tradeDirectoryCache.prefetch(prefetchKeys, async (key) => {
                const service = key.replace('search-', '');
                const params = new URLSearchParams();
                params.append('service', service);
                params.append('limit', '5');
                
                const response = await fetch(`/api/business/search?${params.toString()}`);
                const data = await response.json();
                return data.success ? data.results : [];
            });
        };

        prefetchPopularServices();
    }, []);

    // Memoize search parameters to prevent unnecessary re-renders
    const searchParams = useMemo(() => ({
        query: searchQuery,
        location: selectedRegion !== 'Location...' ? selectedRegion : '',
        service: selectedService !== "I'm looking for a..." ? selectedService : '',
        rating: ratingFilter,
        keywords: keywordsInput.trim(),
    }), [searchQuery, selectedRegion, selectedService, ratingFilter, keywordsInput]);

    const handleSearch = useCallback(() => {
        onSearch(searchParams);
    }, [onSearch, searchParams]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    // Auto-search when location filter changes
    const handleLocationChange = useCallback((location: string) => {
        setSelectedRegion(location);
        if (location !== 'Location...') {
            // Trigger search with new location after a short delay
            setTimeout(() => {
                onSearch({
                    query: searchQuery,
                    location: location,
                    service: selectedService !== "I'm looking for a..." ? selectedService : '',
                    rating: ratingFilter,
                    keywords: keywordsInput.trim(),
                });
            }, 300);
        }
    }, [searchQuery, selectedService, ratingFilter, keywordsInput, onSearch, setSelectedRegion]);

    // Auto-search when rating filter changes
    const handleRatingChange = useCallback((rating: string) => {
        setRatingFilter(rating);
        if (rating !== '') {
            // Trigger search with new rating after a short delay
            setTimeout(() => {
                onSearch({
                    query: searchQuery,
                    location: selectedRegion !== 'Location...' ? selectedRegion : '',
                    service: selectedService !== "I'm looking for a..." ? selectedService : '',
                    rating: rating,
                    keywords: keywordsInput.trim(),
                });
            }, 300);
        }
    }, [searchQuery, selectedRegion, selectedService, keywordsInput, onSearch, setRatingFilter]);

    // Optimized popular service click handler
    const handlePopularServiceClick = useCallback((service: string) => {
        setSelectedService(service);
        
        // Create updated search params with the selected service
        const updatedSearchParams = {
            query: searchQuery,
            location: selectedRegion !== 'Location...' ? selectedRegion : '',
            service: service,
            rating: ratingFilter,
            keywords: keywordsInput.trim(),
        };
        
        // Use cached data if available for instant results
        const cachedData = tradeDirectoryCache.get(`search-${service.toLowerCase()}`);
        if (cachedData) {
            // Trigger search with cached data and current filters
            onSearch(updatedSearchParams);
        } else {
            // Fallback to regular search with current filters
            setTimeout(() => {
                onSearch(updatedSearchParams);
            }, 0);
        }
    }, [searchQuery, selectedRegion, ratingFilter, keywordsInput, onSearch, setSelectedService]);

    // Memoize popular service buttons
    const popularServiceButtons = useMemo(() => 
        POPULAR_SERVICES.map((service) => (
            <button
                key={service}
                onClick={() => handlePopularServiceClick(service)}
                className="inline-flex items-center px-2 py-1 text-xs bg-[#E0F7FA] text-[#1A237E] rounded-full hover:bg-[#B2EBF2] transition-colors cursor-pointer"
                disabled={isSearching}
            >
                {service}
            </button>
        )), [handlePopularServiceClick, isSearching]);

    return (
        <section
            className="h-[360px] px-4 sm:px-6 lg:px-8 relative bg-cover bg-center bg-no-repeat"
            style={{
                background: `linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%), url('/images/community-background.webp')`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center, center',
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundBlendMode: 'overlay'
            }}
        >
            <div className="max-w-7xl mx-auto w-full relative z-10 h-full">
                <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center h-full">
                    {/* Left Side - Mascot Image (desktop only) */}
                    <div className="hidden lg:flex items-center justify-center h-full order-2 lg:order-1">
                        {!imageError ? (
                            <img
                                src="/images/trade-directory-banner.webp"
                                alt="Moovey Mascot"
                                width={240}
                                height={240}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => { setImageError(true); setImageLoaded(true); }}
                                className={`h-60 xl:h-72 object-contain select-none pointer-events-none transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                decoding="async"
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-56 xl:h-64 flex items-center justify-center">
                                <span className="text-7xl">🐄</span>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Search Interface */}
                    <div className="order-1 lg:order-2 flex flex-col justify-start h-full pt-16 sm:pt-20">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#17B7C7] mb-2 sm:mb-3 leading-tight text-center lg:text-left">
                            Find Movers & Services
                        </h1>
                        
                        {/* Primary Search Bar */}
                        <div className="mb-2 sm:mb-3">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full relative z-20">
                                <input
                                    type="text"
                                    placeholder="Search for movers, services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isSearching}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg sm:rounded-l-xl sm:rounded-r-none focus:border-[#17B7C7] focus:outline-none bg-white disabled:opacity-50 shadow-sm"
                                />
                                <button 
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#17B7C7] text-white font-semibold rounded-lg sm:rounded-r-xl sm:rounded-l-none hover:bg-[#139AAA] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Searching...
                                        </>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </div>
                            
                            {/* Quick Service Tags */}
                            <div className="mt-2 flex flex-wrap gap-2 max-h-[56px] overflow-y-auto">
                                <span className="text-xs text-gray-600">Popular services:</span>
                                {popularServiceButtons}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-1">
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                disabled={isSearching}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 border-2 border-[#17B7C7] rounded-lg focus:border-[#139AAA] focus:outline-none bg-white font-medium disabled:opacity-50"
                            >
                                <option className="text-gray-900">I'm looking for a...</option>
                                {serviceTypes.map((service) => (
                                    <option key={service} value={service} className="text-gray-900">{service}</option>
                                ))}
                            </select>
                            
                            <select
                                value={selectedRegion}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                disabled={isSearching}
                                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 border-2 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white disabled:opacity-50 transition-colors ${
                                    selectedRegion !== 'Location...' 
                                        ? 'border-[#17B7C7] bg-blue-50 font-medium' 
                                        : 'border-gray-300'
                                }`}
                            >
                                <option className="text-gray-900">Location...</option>
                                {locations.map((location) => (
                                    <option key={location} value={location} className="text-gray-900">{location}</option>
                                ))}
                            </select>
                            
                            <select
                                value={ratingFilter}
                                onChange={(e) => handleRatingChange(e.target.value)}
                                disabled={isSearching}
                                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 border-2 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white disabled:opacity-50 transition-colors ${
                                    ratingFilter !== '' 
                                        ? 'border-[#17B7C7] bg-blue-50 font-medium' 
                                        : 'border-gray-300'
                                }`}
                            >
                                <option value="" className="text-gray-900">All Ratings</option>
                                <option value="5" className="text-gray-900">⭐⭐⭐⭐⭐ 5 Stars Only</option>
                                <option value="4" className="text-gray-900">⭐⭐⭐⭐ 4 Stars Only</option>
                                <option value="3" className="text-gray-900">⭐⭐⭐ 3 Stars Only</option>
                            </select>
                            
                            <input
                                type="text"
                                placeholder="Keywords..."
                                value={keywordsInput}
                                onChange={(e) => setKeywordsInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isSearching}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white disabled:opacity-50"
                            />
                        </div>
                        
                        
                        {/* Service Filters Explanation */}
                        <div className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2 hidden sm:block">
                            <div className="flex items-start space-x-1">
                                <span className="text-blue-600 text-sm">💡</span>
                                <div>
                                    <strong className="text-blue-800">Tips:</strong> Use main search for business names. Select services or use keywords like "packing", "cleaning".
                                    {isSearching && <span className="block mt-1 text-blue-700">Searching...</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}