import { useState, useEffect } from 'react';

interface Business {
    category: string;
    name: string;
    type: string;
    rating: number;
    reviews: number;
    discount: string;
}

interface BusinessNetworkData {
    businesses: Business[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        has_more: boolean;
    };
}

// Skeleton loader for business cards
const BusinessCardSkeleton = () => (
    <div className="bg-gradient-to-br from-gray-100 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 animate-pulse">
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <div className="bg-gray-200 h-5 w-16 rounded-full"></div>
        </div>
        <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-200 rounded-full mx-auto mb-2 sm:mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-1 w-24 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded mb-2 w-20 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded mb-2 w-16 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div>
        </div>
    </div>
);

export default function BusinessNetworkAsync() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<BusinessNetworkData['pagination'] | null>(null);

    useEffect(() => {
        const fetchBusinessNetwork = async () => {
            try {
                const response = await fetch('/api/welcome/business-network');
                const data: BusinessNetworkData = await response.json();
                setBusinesses(data.businesses);
                setPagination(data.pagination);
            } catch (error) {
                console.error('Failed to load business network:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessNetwork();
    }, []);

    const loadMore = async () => {
        if (!pagination?.has_more) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/welcome/business-network?page=${pagination.current_page + 1}`);
            const data: BusinessNetworkData = await response.json();
            setBusinesses(prev => [...prev, ...data.businesses]);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to load more businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A237E] mb-4 sm:mb-6 leading-tight">
                        Connect with Trusted Professionals
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                        Access our exclusive network of verified moving professionals and get special discounts, 
                        bespoke quotes, and priority booking for your house move.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
                            <span>✓ Verified Professionals</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-[#00BCD4] rounded-full"></span>
                            <span>✓ Exclusive Discounts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></span>
                            <span>✓ Bespoke Quotes</span>
                        </div>
                    </div>
                </div>

                {/* Featured Business Providers */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl mb-12 sm:mb-16">
                    <div className="text-center mb-6 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A237E] mb-3 sm:mb-4">Featured Business Partners</h3>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Top-rated professionals in our network offering exclusive member benefits</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {loading && businesses.length === 0
                            ? Array.from({ length: 4 }).map((_, index) => (
                                <BusinessCardSkeleton key={index} />
                              ))
                            : businesses.slice(0, 4).map((business, index) => (
                                <div key={`${business.name}-${index}`} className="bg-gradient-to-br from-[#E0F7FA] to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-[#00BCD4] relative">
                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                        <span className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">✓ Verified</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                                            <span className="text-white text-base sm:text-lg md:text-xl">🚚</span>
                                        </div>
                                        <h4 className="font-bold text-[#1A237E] mb-1 text-sm sm:text-base">{business.name}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{business.type}</p>
                                        <div className="flex items-center justify-center space-x-1 mb-2 sm:mb-3">
                                            <span className="text-yellow-500 text-sm">⭐</span>
                                            <span className="text-xs sm:text-sm font-medium">{business.rating}</span>
                                            <span className="text-xs text-gray-500">({business.reviews} reviews)</span>
                                        </div>
                                        <div className="bg-red-100 text-red-800 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3">
                                            {business.discount}
                                        </div>
                                    </div>
                                </div>
                              ))
                        }
                    </div>

                    {/* Load More Button */}
                    {pagination && pagination.has_more && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="bg-[#00BCD4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0097A7] transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'View More Partners'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Network Stats & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    {/* Network Stats */}
                    <div className="bg-gradient-to-br from-[#00BCD4] to-[#26C6DA] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Our Growing Network</h3>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">250+</div>
                                <p className="text-xs sm:text-sm opacity-90">Verified Businesses</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">15k+</div>
                                <p className="text-xs sm:text-sm opacity-90">Successful Connections</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">4.8★</div>
                                <p className="text-xs sm:text-sm opacity-90">Average Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">98%</div>
                                <p className="text-xs sm:text-sm opacity-90">Customer Satisfaction</p>
                            </div>
                        </div>
                    </div>

                    {/* Member Benefits */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-[#E0F7FA]">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A237E] mb-4 sm:mb-6">Member Benefits</h3>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">✓</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-[#1A237E] text-sm sm:text-base">Exclusive Discounts</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">Save 10-25% with member-only rates</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#00BCD4] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">⚡</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-[#1A237E] text-sm sm:text-base">Priority Booking</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">Skip the queue with fast-track service</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">📋</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-[#1A237E] text-sm sm:text-base">Bespoke Quotes</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">Tailored pricing for your specific needs</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">🛡️</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-[#1A237E] text-sm sm:text-base">Quality Guarantee</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">All providers vetted and insured</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Ready to Connect with Our Network?</h3>
                        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                            Join thousands of movers who've saved time and money with our trusted partners
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <a 
                                href="/register" 
                                className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Start Your Move Journey
                            </a>
                            <a 
                                href="/trade-directory" 
                                className="bg-white text-[#1A237E] px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Browse All Services
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}