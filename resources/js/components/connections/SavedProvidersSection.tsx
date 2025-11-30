import { Link, router } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface SavedProvider {
    id: string;
    business_profile_id: number;
    name: string;
    avatar: string;
    logo_url?: string | null;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    services: string[];
    availability?: string;
    responseTime?: string;
    savedDate: string;
    notes?: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    current_page: number;
    data: SavedProvider[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLinks[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface SavedProvidersSectionProps {
    savedProviders: PaginatedData;
}

export default function SavedProvidersSection({ savedProviders }: SavedProvidersSectionProps) {
    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleContactProvider = (businessProfileId: number) => {
        router.post('/api/messages/connect-business', {
            business_profile_id: businessProfileId,
            message: '',
        }, {
            onSuccess: () => {
                toast.success('Connected! Opening conversation...');
                // Dispatch event to notify MessageDropdown and other components
                window.dispatchEvent(new CustomEvent('conversationUpdated'));
                // Inertia will handle the redirect automatically
            },
            onError: (errors) => {
                console.error('Error connecting:', errors);
                const errorMessage = (errors as any)?.message || 'Failed to connect. Please try again.';
                toast.error(errorMessage);
            },
        });
    };
    return (
        <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-lg h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A237E] mb-1 sm:mb-2 flex items-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#00BCD4] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="truncate">Saved Providers</span>
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">Providers you've saved from the Trade Directory</p>
                    </div>
                    <Link 
                        href="/trade-directory"
                        className="bg-[#00BCD4] text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-[#00ACC1] transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto"
                    >
                        Browse More
                    </Link>
                </div>

                {savedProviders.data.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {savedProviders.data.map((provider) => (
                            <div key={provider.id} className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow">
                                {/* Mobile Layout: Stacked */}
                                <div className="flex flex-col sm:hidden space-y-3">
                                    {/* Mobile Header: Logo, Name, Rating */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                                            {provider.logo_url ? (
                                                <img 
                                                    src={provider.logo_url} 
                                                    alt={`${provider.name} logo`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-1.5 mb-1">
                                                <h5 className="font-semibold text-[#1A237E] text-sm truncate">{provider.name}</h5>
                                                {provider.verified && (
                                                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">{provider.businessType}</p>
                                            <div className="flex items-center space-x-1 mt-1">
                                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-xs font-medium">{provider.rating}</span>
                                                <span className="text-xs text-gray-500">({provider.reviewCount})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Services */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {provider.services.slice(0, 3).map((service, index) => (
                                            <span key={index} className="bg-white text-[#1A237E] px-2 py-1 rounded-full text-xs font-medium">
                                                {service}
                                            </span>
                                        ))}
                                        {provider.services.length > 3 && (
                                            <span className="bg-white text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                                                +{provider.services.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleContactProvider(provider.business_profile_id)}
                                            className="flex-1 bg-[#00BCD4] text-white px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-[#00ACC1] transition-colors"
                                        >
                                            Contact
                                        </button>
                                        <Link 
                                            href={`/business-profile/${provider.id}`}
                                            className="flex-1 bg-white text-[#00BCD4] border border-[#00BCD4] px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-[#00BCD4] hover:text-white transition-colors text-center"
                                        >
                                            Profile
                                        </Link>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">Saved {provider.savedDate}</p>
                                </div>

                                {/* Tablet Layout: 2-Column */}
                                <div className="hidden sm:flex md:hidden items-start space-x-4">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                                        {provider.logo_url ? (
                                            <img 
                                                src={provider.logo_url} 
                                                alt={`${provider.name} logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-7 h-7 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h5 className="font-semibold text-[#1A237E] text-sm truncate">{provider.name}</h5>
                                            {provider.verified && (
                                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{provider.businessType} • {provider.location}</p>
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-sm font-medium">{provider.rating}</span>
                                                <span className="text-xs text-gray-500">({provider.reviewCount})</span>
                                            </div>
                                            <span className="text-xs text-gray-500">Saved {provider.savedDate}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {provider.services.slice(0, 3).map((service, index) => (
                                                <span key={index} className="bg-white text-[#1A237E] px-2 py-1 rounded-full text-xs font-medium">
                                                    {service}
                                                </span>
                                            ))}
                                            {provider.services.length > 3 && (
                                                <span className="bg-white text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                                                    +{provider.services.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleContactProvider(provider.business_profile_id)}
                                                className="bg-[#00BCD4] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#00ACC1] transition-colors"
                                            >
                                                Contact
                                            </button>
                                            <Link 
                                                href={`/business-profile/${provider.id}`}
                                                className="bg-white text-[#00BCD4] border border-[#00BCD4] px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#00BCD4] hover:text-white transition-colors text-center"
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop/Laptop Layout: 4-Column Grid */}
                                <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4 items-center">
                                    {/* Provider Info */}
                                    <div className="md:col-span-3 lg:col-span-4 xl:col-span-3">
                                        <div className="flex items-start space-x-3 lg:space-x-4">
                                            <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-12 xl:h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                                                {provider.logo_url ? (
                                                    <img 
                                                        src={provider.logo_url} 
                                                        alt={`${provider.name} logo`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="w-6 h-6 lg:w-7 lg:h-7 xl:w-6 xl:h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h5 className="font-semibold text-[#1A237E] text-sm lg:text-base truncate">{provider.name}</h5>
                                                    {provider.verified && (
                                                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-xs lg:text-sm text-gray-600 mb-2">{provider.businessType} • {provider.location}</p>
                                                <div className="flex items-center space-x-3 lg:space-x-4 mb-2">
                                                    <div className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{provider.rating}</span>
                                                        <span className="text-xs text-gray-500">({provider.reviewCount})</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">Saved {provider.savedDate}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {provider.services.slice(0, 3).map((service, index) => (
                                                        <span key={index} className="bg-white text-[#1A237E] px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                                            {service}
                                                        </span>
                                                    ))}
                                                    {provider.services.length > 3 && (
                                                        <span className="bg-white text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                                                            +{provider.services.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleContactProvider(provider.business_profile_id)}
                                            className="bg-[#00BCD4] text-white px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-[#00ACC1] transition-colors whitespace-nowrap"
                                        >
                                            Contact
                                        </button>
                                        <Link 
                                            href={`/business-profile/${provider.id}`}
                                            className="bg-white text-[#00BCD4] border border-[#00BCD4] px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-[#00BCD4] hover:text-white transition-colors text-center whitespace-nowrap"
                                        >
                                            Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {savedProviders.last_page > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4">
                                <button
                                    onClick={() => handlePageChange(savedProviders.prev_page_url)}
                                    disabled={!savedProviders.prev_page_url}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#00BCD4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Previous page"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                
                                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                                    {savedProviders.links
                                        .filter(link => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                                        .map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(link.url)}
                                                disabled={!link.url}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                                                    link.active
                                                        ? 'bg-[#00BCD4] text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                } ${!link.url ? 'cursor-not-allowed' : ''}`}
                                                aria-label={`Page ${link.label}`}
                                                aria-current={link.active ? 'page' : undefined}
                                            >
                                                {link.label}
                                            </button>
                                        ))}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(savedProviders.next_page_url)}
                                    disabled={!savedProviders.next_page_url}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#00BCD4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Next page"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6 sm:py-8 lg:py-12 px-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Saved Providers Yet</h4>
                        <p className="text-gray-500 mb-4 text-xs sm:text-sm max-w-md mx-auto">Browse the Trade Directory to save providers you're interested in.</p>
                        <Link
                            href="/trade-directory"
                            className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-[#00BCD4] text-white rounded-lg font-medium hover:bg-[#00ACC1] transition-colors text-xs sm:text-sm shadow-md"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Browse Trade Directory
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
