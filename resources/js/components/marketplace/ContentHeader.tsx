import { Filters } from './types';

interface ContentHeaderProps {
    filteredItemsCount: number;
    filters: Filters;
    onFiltersChange: (newFilters: Partial<Filters>) => void;
}

export default function ContentHeader({ filteredItemsCount, filters, onFiltersChange }: ContentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Today's Picks
                </h2>
                <p className="text-gray-600 mt-1">
                    {filteredItemsCount} items available
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <select
                    value={filters.sortBy}
                    onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm bg-white"
                >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="distance">Distance</option>
                </select>
                
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button className="px-3 py-2 bg-[#17B7C7] text-white hover:bg-[#139AAA] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button className="px-3 py-2 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}