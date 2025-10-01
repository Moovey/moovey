import React from 'react';

interface AchievementFiltersProps {
    filter: 'all' | 'earned' | 'in-progress' | 'locked';
    setFilter: (filter: 'all' | 'earned' | 'in-progress' | 'locked') => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    categories: string[];
}

export default function AchievementFilters({
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    categories
}: AchievementFiltersProps) {
    return (
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="earned">Earned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="locked">Locked</option>
                    </select>

                    {/* Category Filter */}
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                />
            </div>
        </div>
    );
}