import { FurnitureItem, UnassignedItem } from './types';

interface UnassignedItemsListProps {
    unassignedItems: UnassignedItem[];
    furnitureDatabase: FurnitureItem[];
    customItems: FurnitureItem[];
    onRemoveItem: (itemId: string) => void;
}

export default function UnassignedItemsList({ 
    unassignedItems, 
    furnitureDatabase, 
    customItems, 
    onRemoveItem 
}: UnassignedItemsListProps) {
    if (unassignedItems.length === 0) {
        return null;
    }

    const totalVolume = unassignedItems.reduce((total, unassignedItem) => {
        const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
        return total + (item ? item.volume * unassignedItem.quantity : 0);
    }, 0);

    return (
        <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">📦 Unassigned Items</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                        Items not assigned to any room
                    </p>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        {totalVolume.toFixed(1)}m³ total
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {unassignedItems.map(unassignedItem => {
                        const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
                        if (!item) return null;
                        
                        return (
                            <div key={unassignedItem.itemId} className="flex items-center justify-between bg-white px-2 sm:px-3 py-2 rounded border border-blue-200">
                                <span className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 flex-1 min-w-0">
                                    <span className="text-sm sm:text-base flex-shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                    <span className="text-gray-500 flex-shrink-0">×{unassignedItem.quantity}</span>
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                        {(item.volume * unassignedItem.quantity).toFixed(1)}m³
                                    </span>
                                    <button
                                        onClick={() => onRemoveItem(unassignedItem.itemId)}
                                        className="text-red-600 hover:text-red-800 text-sm hover:bg-red-100 w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-colors"
                                        title="Remove one item"
                                    >
                                        −
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
