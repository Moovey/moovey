import { DeclutterItem } from './types';
import { getImageUrl, handleImageError } from './utils';

interface ItemCardProps {
    item: DeclutterItem;
    onEdit: (item: DeclutterItem) => void;
    onDelete: (id: number) => void;
    onListForSale: (item: DeclutterItem) => void;
    onUnlistFromSale: (item: DeclutterItem) => void;
}

export default function ItemCard({
    item,
    onEdit,
    onDelete,
    onListForSale,
    onUnlistFromSale
}: ItemCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-2 sm:gap-3">
                {/* Image Display */}
                {item.images && item.images.length > 0 ? (
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 relative">
                            <img
                                src={getImageUrl(item.images[0])}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e, item.images?.[0] || '')}
                                data-attempt="0"
                            />
                            {item.images.length > 1 && (
                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tl">
                                    +{item.images.length - 1}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md sm:rounded-lg bg-gray-100 flex items-center justify-center">
                            <div className="text-xl sm:text-2xl text-gray-400">📦</div>
                        </div>
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{item.name}</h4>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                                    item.action === 'sell' ? 'bg-green-100 text-green-800' :
                                    item.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                                    item.action === 'throw' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {item.action === 'throw' ? 'Throw' : 
                                     item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                                </span>
                                {item.is_listed_for_sale && (
                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Listed
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                <div className="truncate">{item.category} • {item.condition}</div>
                                {item.estimated_value > 0 && (
                                    <div>Est. Value: £{item.estimated_value}</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                                onClick={() => onEdit(item)}
                                className="bg-[#17B7C7] text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-[#138994] transition-colors whitespace-nowrap"
                            >
                                Edit
                            </button>
                            {!item.is_listed_for_sale && item.action === 'sell' ? (
                                <button
                                    onClick={() => onListForSale(item)}
                                    className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors whitespace-nowrap"
                                >
                                    List
                                </button>
                            ) : item.is_listed_for_sale ? (
                                <button
                                    onClick={() => onUnlistFromSale(item)}
                                    className="bg-orange-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors whitespace-nowrap"
                                >
                                    Unlist
                                </button>
                            ) : null}
                            <button
                                onClick={() => onDelete(item.id)}
                                className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                                Del
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
