import { Filters } from './types';

interface ActiveFiltersProps {
    filters: Filters;
    onClearAll: () => void;
    onRemoveFilter: (filterType: keyof Filters, value?: any) => void;
}

export default function ActiveFilters({ filters, onClearAll, onRemoveFilter }: ActiveFiltersProps) {
    const hasActiveFilters = 
        filters.searchTerm || 
        filters.category !== 'all' || 
        filters.location || 
        filters.condition !== 'all' || 
        filters.priceMin > 0 || 
        filters.priceMax < 1000;

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
                <button
                    onClick={onClearAll}
                    className="text-xs text-[#17B7C7] hover:text-[#139AAA] transition-colors"
                >
                    Clear All
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                        Search: "{filters.searchTerm}"
                        <button 
                            onClick={() => onRemoveFilter('searchTerm')} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </span>
                )}
                {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                        Category: {filters.category}
                        <button 
                            onClick={() => onRemoveFilter('category')} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </span>
                )}
                {filters.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                        Location: {filters.location}
                        <button 
                            onClick={() => onRemoveFilter('location')} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </span>
                )}
                {filters.condition !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                        Condition: {filters.condition}
                        <button 
                            onClick={() => onRemoveFilter('condition')} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </span>
                )}
                {(filters.priceMin > 0 || filters.priceMax < 1000) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                        Price: £{filters.priceMin}-£{filters.priceMax}
                        <button 
                            onClick={() => onRemoveFilter('priceMin')} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </span>
                )}
            </div>
        </div>
    );
}