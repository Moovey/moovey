interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    category: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    price: number;
    originalPrice?: number;
    images: string[];
    location: string;
    postcode: string;
    sellerName: string;
    sellerId: string;
    dateAdded: string;
    isActive: boolean;
    views: number;
    isFeatured?: boolean;
}

interface MarketplaceGridProps {
    items: MarketplaceItem[];
    loading: boolean;
}

export default function MarketplaceGrid({ items, loading }: MarketplaceGridProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'bg-green-100 text-green-800';
            case 'good': return 'bg-blue-100 text-blue-800';
            case 'fair': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Furniture':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                    </svg>
                );
            case 'Electronics':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                );
            case 'Clothing':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">No items found</h3>
                <p className="text-gray-500 mb-6">
                    Try adjusting your search criteria or browse all categories
                </p>
                <div className="text-sm text-gray-400">
                    💡 Tip: Items from your declutter list will appear here when you list them for sale
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer ${item.isFeatured ? 'ring-2 ring-[#17B7C7]' : ''}`}>
                    {item.isFeatured && (
                        <div className="bg-gradient-to-r from-[#17B7C7] to-[#1A237E] text-white px-3 py-1 text-xs font-medium">
                            ⭐ Featured
                        </div>
                    )}
                    
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                        <div className="text-6xl opacity-20">
                            {getCategoryIcon(item.category)}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {item.views} views
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#17B7C7] transition-colors line-clamp-2">
                                {item.name}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                        </p>

                        {/* Details */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                                {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                                {getCategoryIcon(item.category)}
                                {item.category}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-[#17B7C7]">
                                    £{item.price}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        £{item.originalPrice}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span className="truncate">{item.location}</span>
                            </div>
                            <span>{formatDate(item.dateAdded)}</span>
                        </div>

                        {/* Seller */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <div className="w-8 h-8 bg-[#17B7C7] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {item.sellerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{item.sellerName}</div>
                                <div className="text-xs text-gray-500">Seller</div>
                            </div>
                            <button className="bg-[#17B7C7] text-white px-3 py-1.5 rounded-lg hover:bg-[#139AAA] transition-colors text-sm font-medium">
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}