import { Link } from '@inertiajs/react';

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

interface SearchResultsProps {
    serviceProviders: ServiceProvider[];
}

export default function SearchResults({ serviceProviders }: SearchResultsProps) {
    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Search Results</h2>
                    <p className="text-gray-600 text-center sm:text-right text-sm sm:text-base">{serviceProviders.length} providers found</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {serviceProviders.map((provider) => (
                        <div key={provider.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 lg:items-center">
                                {/* Provider Info */}
                                <div className="lg:col-span-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs sm:text-sm text-gray-600">{provider.availability}</span>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-base sm:text-lg ${i < provider.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                    ★
                                                </span>
                                            ))}
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
                                    <div className="w-20 h-12 sm:w-24 sm:h-16 bg-[#17B7C7] rounded-lg flex items-center justify-center overflow-hidden">
                                        {provider.logo_url ? (
                                            <img src={provider.logo_url} alt={`${provider.name} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-xl sm:text-2xl">
                                                {provider.services?.some(s => s.toLowerCase().includes('moving') || s.toLowerCase().includes('removal')) ? '🚚' :
                                                 provider.services?.some(s => s.toLowerCase().includes('packing')) ? '📦' :
                                                 provider.services?.some(s => s.toLowerCase().includes('cleaning')) ? '🧽' :
                                                 provider.services?.some(s => s.toLowerCase().includes('storage')) ? '📁' :
                                                 '🏢'}
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
                                        <button className="flex-1 text-xs sm:text-sm text-gray-600 hover:text-[#17B7C7] transition-colors py-1">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center flex-wrap gap-2 mt-8 sm:mt-12">
                    <button className="p-2 text-gray-600 hover:text-[#17B7C7] transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {[1, 2, 3, 4, 5].map((page) => (
                        <button
                            key={page}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-medium transition-colors text-sm sm:text-base ${
                                page === 1 
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="p-2 text-gray-600 hover:text-[#17B7C7] transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}