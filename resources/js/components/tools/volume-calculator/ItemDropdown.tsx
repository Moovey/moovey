import { useRef, useEffect, useState } from 'react';
import { FurnitureItem } from './types';

interface ItemDropdownProps {
    items: FurnitureItem[];
    onItemSelect: (itemId: string) => void;
}

export default function ItemDropdown({ items, onItemSelect }: ItemDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleItemClick = (itemId: string) => {
        onItemSelect(itemId);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="mb-4 sm:mb-6 lg:mb-8">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Add Other Items</h5>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-left text-gray-800 font-medium text-sm sm:text-base focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none flex items-center justify-between min-h-[44px]"
                >
                    <span>Select an item to add...</span>
                    <svg 
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[70vh] sm:max-h-96 overflow-hidden">
                        <div className="p-2 sm:p-3 border-b border-gray-200 sticky top-0 bg-white">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none min-h-[44px]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        
                        <div className="overflow-y-auto max-h-[calc(70vh-80px)] sm:max-h-80">
                            {filteredItems.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleItemClick(item.id)}
                                    className="w-full px-3 sm:px-4 py-3 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 sm:gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-left min-h-[60px]"
                                >
                                    {item.image ? (
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">{item.name}</div>
                                        <div className="text-[10px] sm:text-xs text-gray-500">{item.volume}m³</div>
                                    </div>
                                </button>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No items found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
