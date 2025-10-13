import { Filters } from './types';
import { useState, useEffect, useRef } from 'react';

interface ContentHeaderProps {
    filteredItemsCount: number;
    filters: Filters;
    onFiltersChange: (newFilters: Partial<Filters>) => void;
}

export default function ContentHeader({ filteredItemsCount, filters, onFiltersChange }: ContentHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'distance', label: 'Distance' }
    ];
    
    const currentSortLabel = sortOptions.find(option => option.value === filters.sortBy)?.label || 'Newest First';
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
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
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm bg-white text-gray-900 flex items-center justify-between min-w-[200px] hover:bg-gray-50"
                        style={{ color: '#111827' }}
                    >
                        <span className="font-medium">{currentSortLabel}</span>
                        <svg 
                            className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] overflow-hidden">
                            {sortOptions.map((option, index) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onFiltersChange({ sortBy: option.value as any });
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
                                        filters.sortBy === option.value 
                                            ? 'bg-[#17B7C7] text-white hover:bg-[#139AAA]' 
                                            : 'text-gray-900 bg-white hover:bg-gray-50'
                                    }`}
                                    style={{
                                        color: filters.sortBy === option.value ? '#ffffff' : '#111827',
                                        backgroundColor: filters.sortBy === option.value ? '#17B7C7' : '#ffffff'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
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