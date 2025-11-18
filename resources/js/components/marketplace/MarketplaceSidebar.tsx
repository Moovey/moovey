import { Link } from '@inertiajs/react';
import { Filters, MarketplaceItem } from './types';

interface MarketplaceSidebarProps {
    filters: Filters;
    onFiltersChange: (newFilters: Partial<Filters>) => void;
    categories: string[];
    items: MarketplaceItem[];
    filteredItems: MarketplaceItem[];
    isVisible: boolean;
}

export default function MarketplaceSidebar({ 
    filters, 
    onFiltersChange, 
    categories, 
    items, 
    filteredItems,
    isVisible 
}: MarketplaceSidebarProps) {
    return (
        <div className={`lg:w-80 flex-shrink-0 space-y-6 ${isVisible ? 'block' : 'hidden lg:block'}`}>
            {/* Navigation Menu (hide on mobile) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hidden md:block">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#17B7C7] rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Marketplace</h3>
                    </div>
                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Browse All</div>
                                <div className="text-sm text-blue-600/80">Explore everything</div>
                            </div>
                        </button>
                        
                        <Link 
                            href="/tools/declutter-list"
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Selling</div>
                                <div className="text-sm text-gray-500">List items to sell</div>
                            </div>
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Search Bar (show on all viewports) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search marketplace..."
                        value={filters.searchTerm}
                        onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
                        aria-label="Search marketplace"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Location Filter (hide on mobile) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden md:block">
                <h4 className="text-md font-medium text-gray-900 mb-4">Location</h4>
                <div className="space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter location..."
                            value={filters.location}
                            onChange={(e) => onFiltersChange({ location: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div className="space-y-2">
                        {['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'].map(city => (
                            <button
                                key={city}
                                onClick={() => onFiltersChange({ location: city })}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    filters.location === city 
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Filter (hide on mobile) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden md:block">
                <h4 className="text-md font-medium text-gray-900 mb-4">Categories</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => onFiltersChange({ category: 'all' })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.category === 'all' 
                                ? 'bg-[#17B7C7] text-white' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => onFiltersChange({ category })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                filters.category === category 
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range Filter (hide on mobile) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden md:block">
                <h4 className="text-md font-medium text-gray-900 mb-4">Price Range</h4>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                            <input
                                type="number"
                                min="0"
                                value={filters.priceMin}
                                onChange={(e) => onFiltersChange({ priceMin: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                                placeholder="£0"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-900 mb-1">Max Price</label>
                            <input
                                type="number"
                                min="0"
                                value={filters.priceMax}
                                onChange={(e) => onFiltersChange({ priceMax: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                                placeholder="£1000"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Under £10', min: 0, max: 10 },
                            { label: '£10-50', min: 10, max: 50 },
                            { label: '£50-100', min: 50, max: 100 },
                            { label: '£100+', min: 100, max: 10000 }
                        ].map(range => (
                            <button
                                key={range.label}
                                onClick={() => onFiltersChange({ priceMin: range.min, priceMax: range.max })}
                                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                    filters.priceMin === range.min && filters.priceMax === range.max
                                        ? 'bg-[#17B7C7] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Condition Filter (hide on mobile) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden md:block">
                <h4 className="text-md font-medium text-gray-900 mb-4">Condition</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => onFiltersChange({ condition: 'all' })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.condition === 'all' 
                                ? 'bg-[#17B7C7] text-white' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All Conditions
                    </button>
                    {[
                        { value: 'excellent', label: 'Excellent', icon: '⭐' },
                        { value: 'good', label: 'Good', icon: '👍' },
                        { value: 'fair', label: 'Fair', icon: '👌' },
                        { value: 'poor', label: 'Poor', icon: '🔧' }
                    ].map(condition => (
                        <button
                            key={condition.value}
                            onClick={() => onFiltersChange({ condition: condition.value })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                filters.condition === condition.value 
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{condition.icon}</span>
                            {condition.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats removed per request */}

            {/* Helpful Tips (hide on mobile) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-md font-medium text-blue-900">Buying Tips</h4>
                </div>
                <ul className="text-xs text-blue-800 space-y-2">
                    <li>• Meet in public places for safety</li>
                    <li>• Check item condition before buying</li>
                    <li>• Ask questions about the item's history</li>
                    <li>• Consider negotiating the price</li>
                </ul>
            </div>
        </div>
    );
}