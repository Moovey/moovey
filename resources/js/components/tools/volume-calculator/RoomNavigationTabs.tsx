import { Room, FurnitureItem } from './types';

interface RoomNavigationTabsProps {
    rooms: Room[];
    currentRoomIndex: number;
    furnitureDatabase: FurnitureItem[];
    customItems: FurnitureItem[];
    onRoomSelect: (index: number) => void;
}

export default function RoomNavigationTabs({ 
    rooms, 
    currentRoomIndex, 
    furnitureDatabase, 
    customItems, 
    onRoomSelect 
}: RoomNavigationTabsProps) {
    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {rooms.map((room, index) => {
                    const roomVolume = Object.entries(room.items).reduce((total, [itemId, quantity]) => {
                        const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                        return total + (item ? item.volume * quantity : 0);
                    }, 0);
                    const itemCount = Object.values(room.items).reduce((sum, qty) => sum + qty, 0);
                    
                    return (
                        <button
                            key={room.id}
                            onClick={() => onRoomSelect(index)}
                            className={`flex-shrink-0 min-w-[120px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                currentRoomIndex === index
                                    ? 'bg-[#17B7C7] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#17B7C7]'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="whitespace-nowrap">{room.name}</span>
                                {itemCount > 0 && (
                                    <span className="text-[10px] sm:text-xs opacity-75 whitespace-nowrap">
                                        {itemCount} items ({roomVolume.toFixed(1)}m³)
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
