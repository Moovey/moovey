import { Link } from '@inertiajs/react';
import MarketplaceItemCard from './MarketplaceItemCard';
import { MarketplaceItem } from './types';

interface MarketplaceGridProps {
    items: MarketplaceItem[];
    loading: boolean;
    getImageUrl: (imagePath: string) => string;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => void;
    onItemClick: (item: MarketplaceItem) => void;
}

export default function MarketplaceGrid({ 
    items, 
    loading, 
    getImageUrl, 
    handleImageError,
    onItemClick
}: MarketplaceGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-3">
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
            <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="text-8xl mb-6">🏪</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">No items found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or browse all categories. New items are added daily!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="text-sm text-blue-800">
                        💡 <strong>Want to sell something?</strong> Add items to your declutter list and list them for sale in the marketplace.
                    </div>
                    <Link 
                        href="/tools?tab=declutter"
                        className="inline-block mt-3 bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#139AAA] transition-colors text-sm font-medium"
                    >
                        Start Decluttering
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
                <MarketplaceItemCard
                    key={item.id}
                    item={item}
                    getImageUrl={getImageUrl}
                    handleImageError={handleImageError}
                    onItemClick={onItemClick}
                />
            ))}
        </div>
    );
}