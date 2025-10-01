import { useState } from 'react';
import { POPULAR_SERVICES } from '@/constants/services';

interface HeroSearchSectionProps {
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

export default function HeroSearchSection({
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
}: HeroSearchSectionProps) {
    
    const [keywordsInput, setKeywordsInput] = useState('');
    
    const handleSearch = () => {
        onSearch({
            query: searchQuery,
            location: selectedLocation !== 'Your Location' ? selectedLocation : '',
            service: selectedService !== "I'm looking for a..." ? selectedService : '',
            rating: ratingFilter,
            keywords: keywordsInput.trim(),
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    return (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Mascot Image */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <div className="relative inline-block">
                            {/* Mascot Image Container */}
                            <div 
                                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[30rem] lg:h-[30rem] mx-auto mb-4 sm:mb-6 relative bg-cover bg-center bg-no-repeat rounded-full"
                                style={{
                                    backgroundImage: 'url(/images/trade-directory-mascot.webp)',
                                }}
                            >
                                {/* SEARCH Signs - keeping these as decorative overlays */}
                                <div className="absolute top-12 sm:top-16 md:top-20 left-4 sm:left-6 md:left-8 bg-[#17B7C7] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold transform -rotate-12 shadow-lg">
                                    SEARCH
                                </div>
                                <div className="absolute top-20 sm:top-24 md:top-32 right-4 sm:right-6 md:right-8 bg-[#17B7C7] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold transform rotate-12 shadow-lg">
                                    FIND
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-[#17B7C7] text-lg sm:text-xl md:text-2xl drop-shadow-lg">⭐</div>
                                <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-2 sm:left-3 md:left-4 text-yellow-400 text-lg sm:text-xl drop-shadow-lg">◆</div>
                                <div className="absolute top-20 sm:top-24 md:top-28 left-1 sm:left-1 md:left-2 text-[#17B7C7] text-base sm:text-lg drop-shadow-lg">●</div>
                            </div>
                            
                            {/* Fallback content if image fails to load */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl sm:text-5xl md:text-6xl opacity-20 pointer-events-none">
                                🐄
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Search Interface */}
                    <div className="order-1 lg:order-2">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#17B7C7] mb-4 sm:mb-6 leading-tight text-center lg:text-left">
                            Find Movers & Services
                        </h1>
                        
                        {/* Primary Search Bar */}
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <input
                                    type="text"
                                    placeholder="Search for movers, services, or business names..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg sm:rounded-l-xl sm:rounded-r-none focus:border-[#17B7C7] focus:outline-none bg-white"
                                />
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-gray-900 border-2 border-gray-300 sm:border-l-0 rounded-lg sm:rounded-none focus:border-[#17B7C7] focus:outline-none bg-white"
                                >
                                    <option className="text-gray-900">Your Location</option>
                                    {locations.map((location) => (
                                        <option key={location} value={location} className="text-gray-900">{location}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-[#17B7C7] text-white font-semibold rounded-lg sm:rounded-r-xl sm:rounded-l-none hover:bg-[#139AAA] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                            
                            {/* Quick Service Tags */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-600">Popular services:</span>
                                {POPULAR_SERVICES.map((service) => (
                                    <button
                                        key={service}
                                        onClick={() => {
                                            setSelectedService(service);
                                            handleSearch();
                                        }}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-[#E0F7FA] text-[#1A237E] rounded-full hover:bg-[#B2EBF2] transition-colors cursor-pointer"
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border-2 border-[#17B7C7] rounded-lg focus:border-[#139AAA] focus:outline-none bg-white font-medium"
                            >
                                <option className="text-gray-900">I'm looking for a...</option>
                                {serviceTypes.map((service) => (
                                    <option key={service} value={service} className="text-gray-900">{service}</option>
                                ))}
                            </select>
                            
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white"
                            >
                                <option className="text-gray-900">Location...</option>
                                {locations.map((location) => (
                                    <option key={location} value={location} className="text-gray-900">{location}</option>
                                ))}
                            </select>
                            
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white"
                            >
                                <option value="" className="text-gray-900">Ratings</option>
                                <option value="5" className="text-gray-900">5 Stars</option>
                                <option value="4" className="text-gray-900">4+ Stars</option>
                                <option value="3" className="text-gray-900">3+ Stars</option>
                            </select>
                            
                            <input
                                type="text"
                                placeholder="Service keywords..."
                                value={keywordsInput}
                                onChange={(e) => setKeywordsInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg focus:border-[#17B7C7] focus:outline-none bg-white"
                            />
                        </div>
                        
                        {/* Service Filters Explanation */}
                        <div className="mt-4 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">💡</span>
                                <div>
                                    <strong className="text-blue-800">Search Tips:</strong> Use the main search bar for business names or general terms. 
                                    Select specific services from the dropdown, or use service keywords like "packing", "cleaning", "storage" to find businesses offering those services.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}