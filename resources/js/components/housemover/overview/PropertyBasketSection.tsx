import { useState, Suspense, lazy } from 'react';

const PropertyBasket = lazy(() => import('@/components/housemover/chain-checker/PropertyBasket'));

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

interface PropertyBasketSectionProps {
    className?: string;
}

export default function PropertyBasketSection({ className = '' }: PropertyBasketSectionProps) {
    const [showPropertyBasket, setShowPropertyBasket] = useState(false);

    return (
        <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 ${className}`}>
            {/* Mobile Header (< 640px) */}
            <div className="block sm:hidden mb-4">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Property Basket</h3>
                    <p className="text-sm text-gray-600 mb-3 px-2">Track properties and claim listings</p>
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => setShowPropertyBasket(!showPropertyBasket)}
                            className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-colors font-medium py-1"
                        >
                            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                {showPropertyBasket ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 3" />
                                ) : (
                                    <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                )}
                            </svg>
                            {showPropertyBasket ? 'Hide' : 'Show'} Properties
                        </button>
                        <a
                            href="/housemover/chain-checker"
                            className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-colors font-medium py-1 flex items-center justify-center space-x-1"
                        >
                            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>Chain Checker</span>
                            <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Tablet Header (640px - 1024px) */}
            <div className="hidden sm:flex lg:hidden items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Property Basket</h3>
                        <p className="text-sm text-gray-600">Track properties and claim listings</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowPropertyBasket(!showPropertyBasket)}
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-2 py-1 rounded hover:bg-[#E0F7FA] font-medium"
                    >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            {showPropertyBasket ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 3" />
                            ) : (
                                <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                            )}
                        </svg>
                        {showPropertyBasket ? 'Hide' : 'Show'}
                    </button>
                    <a
                        href="/housemover/chain-checker"
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-2 py-1 rounded hover:bg-[#E0F7FA] font-medium"
                    >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Chain Checker →
                    </a>
                </div>
            </div>

            {/* Desktop & Large Screen Header (1024px+) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 xl:w-14 xl:h-14 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 xl:w-7 xl:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl xl:text-2xl font-semibold text-gray-900">Property Basket</h3>
                        <p className="text-sm xl:text-base text-gray-600">Track properties and claim your listings</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowPropertyBasket(!showPropertyBasket)}
                        className="text-sm xl:text-base text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#E0F7FA] font-medium shadow-sm hover:shadow-md"
                    >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            {showPropertyBasket ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 3" />
                            ) : (
                                <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                            )}
                        </svg>
                        {showPropertyBasket ? 'Hide Properties' : 'Show Properties'}
                    </button>
                    <a
                        href="/housemover/chain-checker"
                        className="text-sm xl:text-base text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#E0F7FA] font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>View in Chain Checker</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
            
            {/* Description - Responsive Typography */}
            <div className="mb-4 sm:mb-5 lg:mb-6">
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                    <span className="hidden sm:inline">Add properties from Rightmove to track interest and claim your listings. When others claim the same properties, you'll be notified of potential chain connections.</span>
                    <span className="sm:hidden">Add Rightmove properties to track interest and get notified of chain connections.</span>
                </p>
            </div>
            
            {/* Property Basket Content - Responsive Container */}
            {showPropertyBasket && (
                <div className="mb-4 sm:mb-5 lg:mb-6">
                    <Suspense fallback={
                        <div className="space-y-3 sm:space-y-4">
                            <LoadingSkeleton className="h-16 sm:h-20 lg:h-24" />
                            <LoadingSkeleton className="h-16 sm:h-20 lg:h-24" />
                            <LoadingSkeleton className="h-16 sm:h-20 lg:h-24" />
                        </div>
                    }>
                        <div className="overflow-hidden rounded-lg sm:rounded-xl">
                            <PropertyBasket />
                        </div>
                    </Suspense>
                </div>
            )}
            
            {/* Call-to-Action - Fully Responsive Across All Devices */}
            <div className="mt-4 sm:mt-5 lg:mt-6">
                {/* Mobile CTA (< 640px) */}
                <div className="block sm:hidden">
                    <div className="p-4 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg text-white text-center shadow-md">
                        <div className="mb-3">
                            <h4 className="font-semibold text-base mb-2 flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span>Track Your Chain</span>
                            </h4>
                            <p className="text-sm opacity-90 leading-relaxed">Sync properties and monitor moving progress</p>
                        </div>
                        <a
                            href="/housemover/chain-checker"
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-[#00BCD4] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                            <span>Activate Chain Checker</span>
                        </a>
                    </div>
                </div>

                {/* Tablet CTA (640px - 1024px) */}
                <div className="hidden sm:block lg:hidden">
                    <div className="p-4 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl text-white shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-base mb-1 flex items-center justify-center sm:justify-start space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span>Ready to track your moving chain?</span>
                                </h4>
                                <p className="text-sm opacity-90">Activate Chain Checker to sync properties and monitor progress</p>
                            </div>
                            <a
                                href="/housemover/chain-checker"
                                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-[#00BCD4] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                                <span>Activate Chain Checker</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desktop CTA (1024px - 1280px) */}
                <div className="hidden lg:block xl:hidden">
                    <div className="p-5 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1">Ready to track your moving chain?</h4>
                                    <p className="text-base opacity-90">Activate Chain Checker to sync your properties and monitor progress</p>
                                </div>
                            </div>
                            <a
                                href="/housemover/chain-checker"
                                className="inline-flex items-center justify-center space-x-3 px-6 py-3 bg-white text-[#00BCD4] rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-base"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                                <span>Activate Chain Checker</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Large Screen CTA (1280px+) */}
                <div className="hidden xl:block">
                    <div className="p-6 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-5">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-2 flex items-center space-x-2">
                                        <span>Ready to track your moving chain?</span>
                                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </h4>
                                    <p className="text-base opacity-90 leading-relaxed">Activate Chain Checker to sync your properties and monitor your entire moving progress in real-time</p>
                                </div>
                            </div>
                            <a
                                href="/housemover/chain-checker"
                                className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-white text-[#00BCD4] rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-bold shadow-lg hover:shadow-xl text-lg group"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                                <span>Activate Chain Checker</span>
                                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}