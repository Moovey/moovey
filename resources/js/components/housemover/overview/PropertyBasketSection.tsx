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
                        <span className="text-white text-xl">🏠</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Property Basket</h3>
                    <p className="text-sm text-gray-600 mb-3 px-2">Track properties and claim listings</p>
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => setShowPropertyBasket(!showPropertyBasket)}
                            className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-colors font-medium py-1"
                        >
                            {showPropertyBasket ? '👁️ Hide' : '👁️ Show'} Properties
                        </button>
                        <a
                            href="/housemover/chain-checker"
                            className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-colors font-medium py-1 flex items-center justify-center space-x-1"
                        >
                            <span>🔗 Chain Checker</span>
                            <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Tablet Header (640px - 1024px) */}
            <div className="hidden sm:flex lg:hidden items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white text-xl">🏠</span>
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
                        {showPropertyBasket ? '👁️ Hide' : '👁️ Show'}
                    </button>
                    <a
                        href="/housemover/chain-checker"
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-2 py-1 rounded hover:bg-[#E0F7FA] font-medium"
                    >
                        🔗 Chain Checker →
                    </a>
                </div>
            </div>

            {/* Desktop & Large Screen Header (1024px+) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 xl:w-14 xl:h-14 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-xl xl:text-2xl">🏠</span>
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
                        {showPropertyBasket ? '👁️ Hide Properties' : '👁️ Show Properties'}
                    </button>
                    <a
                        href="/housemover/chain-checker"
                        className="text-sm xl:text-base text-[#00BCD4] hover:text-[#00ACC1] active:text-[#0097A7] transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#E0F7FA] font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                        <span>🔗 View in Chain Checker</span>
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
                                <span>🔗</span>
                                <span>Track Your Chain</span>
                            </h4>
                            <p className="text-sm opacity-90 leading-relaxed">Sync properties and monitor moving progress</p>
                        </div>
                        <a
                            href="/housemover/chain-checker"
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-[#00BCD4] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full"
                        >
                            <span>🚀</span>
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
                                    <span>🔗</span>
                                    <span>Ready to track your moving chain?</span>
                                </h4>
                                <p className="text-sm opacity-90">Activate Chain Checker to sync properties and monitor progress</p>
                            </div>
                            <a
                                href="/housemover/chain-checker"
                                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-[#00BCD4] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                <span>🚀</span>
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
                                    <span className="text-2xl">🔗</span>
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
                                <span>🚀</span>
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
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="text-3xl">🔗</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-2 flex items-center space-x-2">
                                        <span>Ready to track your moving chain?</span>
                                        <span className="animate-pulse">✨</span>
                                    </h4>
                                    <p className="text-base opacity-90 leading-relaxed">Activate Chain Checker to sync your properties and monitor your entire moving progress in real-time</p>
                                </div>
                            </div>
                            <a
                                href="/housemover/chain-checker"
                                className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-white text-[#00BCD4] rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-bold shadow-lg hover:shadow-xl text-lg group"
                            >
                                <span>🚀</span>
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