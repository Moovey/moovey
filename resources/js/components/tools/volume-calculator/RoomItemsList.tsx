import { FurnitureItem } from './types';

interface RoomItemsListProps {
    items: { [itemId: string]: number };
    furnitureDatabase: FurnitureItem[];
    customItems: FurnitureItem[];
}

export default function RoomItemsList({ items, furnitureDatabase, customItems }: RoomItemsListProps) {
    const hasItems = Object.keys(items).length > 0;

    if (!hasItems) {
        return null;
    }

    return (
        <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Items in this room:</h5>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(items).map(([itemId, quantity]) => {
                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                    if (!item) return null;
                    
                    return (
                        <div key={itemId} className="flex items-center justify-between bg-white px-2 sm:px-3 py-2 rounded border border-blue-200">
                            <span className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded border border-gray-200 flex-shrink-0"
                                    />
                                ) : (
                                    <span className="flex-shrink-0">{item.icon}</span>
                                )}
                                <span className="truncate">{item.name}</span>
                                <span className="text-gray-500 flex-shrink-0">×{quantity}</span>
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-600 font-medium flex-shrink-0 ml-2">
                                {(item.volume * quantity).toFixed(1)}m³
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
