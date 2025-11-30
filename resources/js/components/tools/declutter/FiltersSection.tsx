import { categories } from './types';

interface FiltersSectionProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filterCategory: string;
    setFilterCategory: (value: string) => void;
    filterAction: string;
    setFilterAction: (value: string) => void;
}

export default function FiltersSection({
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterAction,
    setFilterAction
}: FiltersSectionProps) {
    return (
        <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🔍</span>
                <span>Filter Items</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white font-medium"
                />
                
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white font-medium"
                >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white font-medium"
                >
                    <option value="all">All Actions</option>
                    <option value="throw">Throw Away</option>
                    <option value="donate">Donate</option>
                    <option value="sell">Sell</option>
                    <option value="keep">Keep</option>
                </select>
            </div>
        </div>
    );
}
