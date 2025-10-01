import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import HeroSearchSection from '@/components/trade-directory/HeroSearchSection';
import RecommendedServices from '@/components/trade-directory/RecommendedServices';
import SearchResults from '@/components/trade-directory/SearchResults';
import ArticlesSection from '@/components/trade-directory/ArticlesSection';
import FinalCTA from '@/components/trade-directory/FinalCTA';
import { PREDEFINED_SERVICES } from '@/constants/services';

export default function TradeDirectory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Your Location');
    const [selectedService, setSelectedService] = useState('I\'m looking for a...');
    const [selectedRegion, setSelectedRegion] = useState('Location...');
    const [priceFilter, setPriceFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const serviceTypes = [...PREDEFINED_SERVICES];

    const locations = [
        'London', 'South East', 'South West', 'Midlands', 'North', 
        'Scotland', 'Wales', 'Northern Ireland', 'Manchester', 
        'Birmingham', 'Liverpool', 'Leeds', 'Near me'
    ];

    const serviceProviders = [
        {
            id: 1,
            name: "Ethan's Moving Crew",
            description: "Ethan and his team offer comprehensive moving services, including packing, loading, transportation, and unpacking. Highly rated by customers.",
            services: ["House Removals", "Packing Service", "Long-distance Moves"],
            logo_url: null,
            plan: "basic",
            user_name: "Ethan Smith",
            rating: 5,
            verified: true,
            response_time: "Usually responds within 2 hours",
            availability: "Available: Weekdays and Saturdays"
        },
        {
            id: 2,
            name: "Sophia's Packing Pros",
            description: "Sophia specialises in packing and unpacking services, ensuring the safe handling of belongings. Highly rated by customers.",
            services: ["Packing Service", "Fragile-only Packing"],
            logo_url: null,
            plan: "premium",
            user_name: "Sophia Johnson",
            rating: 4,
            verified: true,
            response_time: "Usually responds within 1 hour",
            availability: "Available: Weekdays"
        },
        {
            id: 3,
            name: "Olivia's Cleaning Crew",
            description: "Olivia provides professional cleaning services for move-in and move-out situations. Highly rated by customers.",
            services: ["Cleaning", "Deep Cleaning"],
            logo_url: null,
            plan: "basic",
            user_name: "Olivia Brown",
            rating: 5,
            verified: true,
            response_time: "Usually responds within 3 hours",
            availability: "Available: Weekdays and Sundays"
        }
    ];

    const recommendedServices = [
        { name: "Moving Company", status: "completed", icon: "✅", priority: "Booked" },
        { name: "Packing Service", status: "recommended", icon: "⚠️", priority: "High Priority" },
        { name: "Cleaning Service", status: "missing", icon: "❌", priority: "Recommended" },
        { name: "Storage", status: "optional", icon: "⚠️", priority: "May be needed" },
        { name: "Utility Setup", status: "missing", icon: "❌", priority: "Not Arranged" }
    ];

    const handleSearch = async (searchParams: {
        query: string;
        location: string;
        service: string;
        rating: string;
        keywords: string;
    }) => {
        setIsSearching(true);
        setSearchError(null);
        
        try {
            const params = new URLSearchParams();
            if (searchParams.query) params.append('query', searchParams.query);
            if (searchParams.location) params.append('location', searchParams.location);
            if (searchParams.service) params.append('service', searchParams.service);
            if (searchParams.rating) params.append('rating', searchParams.rating);
            if (searchParams.keywords) params.append('query', searchParams.keywords); // Add keywords to general query
            params.append('limit', '20');

            const response = await fetch(`/api/business/search?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.results);
                setHasSearched(true);
            } else {
                setSearchError('Search failed. Please try again.');
            }
        } catch (error) {
            setSearchError('Network error. Please check your connection and try again.');
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const articles = [
        {
            title: "Top 5 Packing Tips for a Stress-Free Move",
            description: "Discover essential packing strategies to ensure your belongings arrive safely and your move flows organized.",
            image: "boxes"
        },
        {
            title: "How to Choose the Right Moving Company",
            description: "Essential tips for selecting a reliable moving company that fits your budget and timeline.",
            image: "boxes"
        },
        {
            title: "Moving Day Checklist: Don't Forget These Essentials",
            description: "A comprehensive checklist to ensure nothing gets overlooked on your big moving day.",
            image: "boxes"
        }
    ];

    return (
        <>
            <Head title="Trade Directory - Find Movers & Services">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="trade-directory" />

                {/* Hero Section with Search */}
                <HeroSearchSection
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
                    isSearching={isSearching}
                />

                {/* Recommended Services Section */}
                <RecommendedServices recommendedServices={recommendedServices} />

                {/* Search Results Section - Show only if searched */}
                {hasSearched && (
                    <>
                        {searchError ? (
                            <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                                <div className="max-w-7xl mx-auto text-center">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-red-800 mb-2">Search Error</h3>
                                        <p className="text-red-600">{searchError}</p>
                                        <button 
                                            onClick={() => {
                                                setSearchError(null);
                                                setHasSearched(false);
                                            }}
                                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </section>
                        ) : searchResults.length > 0 ? (
                            <SearchResults serviceProviders={searchResults} />
                        ) : !isSearching ? (
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
                    <SearchResults serviceProviders={serviceProviders} />
                )}

                {/* What to Read Next Section */}
                <ArticlesSection articles={articles} />

                {/* Final CTA Section */}
                <FinalCTA />

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
