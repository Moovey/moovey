import { FurnitureItem } from './types';

interface PresetItemsListProps {
    items: FurnitureItem[];
    getItemQuantity: (itemId: string) => number;
    onIncrement: (itemId: string) => void;
    onDecrement: (itemId: string) => void;
}

export default function PresetItemsList({ 
    items, 
    getItemQuantity, 
    onIncrement, 
    onDecrement 
}: PresetItemsListProps) {
    return (
        <div className="mb-4 sm:mb-6 lg:mb-8">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Common Items</h5>
            <div className="space-y-2">
                {items.map(item => {
                    const quantity = getItemQuantity(item.id);
                    return (
                        <div 
                            key={item.id} 
                            className="flex items-center justify-between bg-gray-50 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 hover:border-[#17B7C7] transition-colors"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                                    />
                                ) : (
                                    <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs sm:text-sm font-medium text-gray-800 block truncate">{item.name}</span>
                                    <span className="text-[10px] sm:text-xs text-gray-500">({item.volume}m³)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                {quantity > 0 && (
                                    <span className="text-xs sm:text-sm font-semibold text-[#17B7C7] hidden sm:inline">
                                        {(item.volume * quantity).toFixed(1)}m³
                                    </span>
                                )}
                                <div className="flex items-center gap-1 sm:gap-2 bg-white border border-gray-300 rounded-lg px-1 sm:px-2 py-1">
                                    <button
                                        onClick={() => onDecrement(item.id)}
                                        disabled={quantity === 0}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-base sm:text-lg font-bold transition-colors ${
                                            quantity === 0 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        −
                                    </button>
                                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-gray-800">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => onIncrement(item.id)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-base sm:text-lg font-bold text-green-600 hover:bg-green-50 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
