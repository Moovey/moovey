interface Filters {
    category: string;
    condition: string;
    priceMin: number;
    priceMax: number;
    location: string;
    searchTerm: string;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'distance';
}

interface MarketplaceFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Partial<Filters>) => void;
    categories: string[];
    totalItems: number;
}

export default function MarketplaceFilters({
    filters,
    onFiltersChange,
    categories,
    totalItems
}: MarketplaceFiltersProps) {
    const handleReset = () => {
        onFiltersChange({
            category: 'all',
            condition: 'all',
            priceMin: 0,
            priceMax: 1000,
            location: '',
            searchTerm: ''
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                    onClick={handleReset}
                    className="text-sm text-[#17B7C7] hover:text-[#139AAA] font-medium"
                >
                    Reset All
                </button>
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Items
                    </label>
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                        placeholder="Search by name, description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => onFiltersChange({ location: e.target.value })}
                        placeholder="City, postcode..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => onFiltersChange({ category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                    </label>
                    <select
                        value={filters.condition}
                        onChange={(e) => onFiltersChange({ condition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                    >
                        <option value="all">Any Condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range (£)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            min="0"
                            value={filters.priceMin}
                            onChange={(e) => onFiltersChange({ priceMin: parseInt(e.target.value) || 0 })}
                            placeholder="Min"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                        />
                        <input
                            type="number"
                            min="0"
                            value={filters.priceMax}
                            onChange={(e) => onFiltersChange({ priceMax: parseInt(e.target.value) || 1000 })}
                            placeholder="Max"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                        />
                    </div>
                    <div className="mt-2">
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={filters.priceMax}
                            onChange={(e) => onFiltersChange({ priceMax: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #17B7C7 0%, #17B7C7 ${(filters.priceMax / 1000) * 100}%, #e5e7eb ${(filters.priceMax / 1000) * 100}%, #e5e7eb 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>£0</span>
                            <span>£1000+</span>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#17B7C7]">{totalItems}</div>
                        <div className="text-sm text-gray-600">
                            {totalItems === 1 ? 'item found' : 'items found'}
                        </div>
                    </div>
                </div>

                {/* Quick Filters */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Quick Filters
                    </label>
                    <div className="space-y-2">
                        <button
                            onClick={() => onFiltersChange({ priceMax: 50 })}
                            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Under £50
                        </button>
                        <button
                            onClick={() => onFiltersChange({ condition: 'excellent' })}
                            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Excellent Condition
                        </button>
                        <button
                            onClick={() => onFiltersChange({ category: 'Furniture' })}
                            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Furniture Only
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}