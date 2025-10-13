import { MarketplaceItem } from './types';

interface MarketplaceItemCardProps {
    item: MarketplaceItem;
    getImageUrl: (imagePath: string) => string;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => void;
}

export default function MarketplaceItemCard({ 
    item, 
    getImageUrl, 
    handleImageError 
}: MarketplaceItemCardProps) {
    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'bg-green-100 text-green-800';
            case 'good': return 'bg-blue-100 text-blue-800';
            case 'fair': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer">
            {/* Image Display */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                {item.images && item.images.length > 0 ? (
                    <img
                        src={getImageUrl(item.images[0])}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => handleImageError(e, item.images?.[0] || '')}
                        data-attempt="0"
                    />
                ) : (
                    <div className="text-4xl opacity-20">📦</div>
                )}
                
                {/* Image count indicator */}
                {item.images && item.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {item.images.length}
                    </div>
                )}
                
                {/* Heart/Save icon */}
                <button className="absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                
                {/* Condition badge */}
                <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getConditionColor(item.condition)}`}>
                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </span>
                </div>
            </div>

            <div className="p-3">
                {/* Price - Most prominent */}
                <div className="mb-2">
                    <span className="text-lg font-bold text-gray-900">
                        £{item.estimated_value}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-[#17B7C7] transition-colors">
                    {item.name}
                </h3>

                {/* Location and Date */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span className="truncate">{item.location || 'Location not specified'}</span>
                    </div>
                    <span className="flex-shrink-0 ml-2">{formatDate(item.created_at)}</span>
                </div>

                {/* Category tag */}
                <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {item.category}
                    </span>
                    
                    {/* Seller initial */}
                    <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {(item.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
}