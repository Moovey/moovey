import { useState } from 'react';
import { Room, FurnitureItem } from './types';

interface RoomSelectionModalProps {
    isOpen: boolean;
    selectedItem: FurnitureItem | null;
    rooms: Room[];
    onClose: () => void;
    onAddToRoom: (roomId: string, itemId: string, quantity: number) => void;
    onAddUnassigned: (itemId: string, quantity: number) => void;
}

export default function RoomSelectionModal({ 
    isOpen, 
    selectedItem, 
    rooms, 
    onClose, 
    onAddToRoom, 
    onAddUnassigned 
}: RoomSelectionModalProps) {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !selectedItem) {
        return null;
    }

    const handleAddToRoom = (roomId: string) => {
        onAddToRoom(roomId, selectedItem.id, quantity);
        setQuantity(1);
        onClose();
    };

    const handleAddUnassigned = () => {
        onAddUnassigned(selectedItem.id, quantity);
        setQuantity(1);
        onClose();
    };

    const handleClose = () => {
        setQuantity(1);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-full sm:max-w-md w-full shadow-2xl border border-gray-200 max-h-[95vh] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Add {selectedItem.name}
                </h3>
                
                <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] focus:bg-white outline-none transition-all duration-200 min-h-[44px]"
                    />
                </div>
                
                <div className="mb-6 sm:mb-8">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-4">Select room or add without room:</p>
                    <div className="space-y-2 sm:space-y-3">
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => handleAddToRoom(room.id)}
                                className="w-full text-left px-3 sm:px-4 py-3 bg-gray-50 text-gray-900 text-sm sm:text-base font-medium hover:bg-[#17B7C7] hover:text-white rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 hover:border-[#17B7C7] min-h-[44px] active:scale-[0.98]"
                            >
                                🏠 {room.name}
                            </button>
                        ))}
                        <button
                            onClick={handleAddUnassigned}
                            className="w-full text-left px-3 sm:px-4 py-3 bg-blue-50 text-blue-900 text-sm sm:text-base font-medium hover:bg-blue-100 rounded-lg sm:rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 min-h-[44px] active:scale-[0.98]"
                        >
                            📦 Add without room
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
