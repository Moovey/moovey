interface RoomNavigationButtonsProps {
    currentRoomIndex: number;
    totalRooms: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function RoomNavigationButtons({ 
    currentRoomIndex, 
    totalRooms, 
    onPrevious, 
    onNext 
}: RoomNavigationButtonsProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-200">
            <button
                onClick={onPrevious}
                disabled={currentRoomIndex === 0}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] ${
                    currentRoomIndex === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700 active:scale-[0.98]'
                }`}
            >
                ← Previous Room
            </button>
            
            <button
                onClick={onNext}
                disabled={currentRoomIndex === totalRooms - 1}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] ${
                    currentRoomIndex === totalRooms - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#17B7C7] text-white hover:bg-[#139AAA] shadow-md hover:shadow-lg active:scale-[0.98]'
                }`}
            >
                Next Room →
            </button>
        </div>
    );
}
