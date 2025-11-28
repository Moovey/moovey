interface BoxEstimatorProps {
    roomName: string;
    boxCount: number;
    onBoxCountChange: (count: number) => void;
}

export default function BoxEstimator({ 
    roomName, 
    boxCount, 
    onBoxCountChange
}: BoxEstimatorProps) {
    const handleIncrement = () => {
        onBoxCountChange(boxCount + 1);
    };

    const handleDecrement = () => {
        if (boxCount > 0) {
            onBoxCountChange(boxCount - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        onBoxCountChange(Math.max(0, value));
    };

    const estimatedVolume = (boxCount * 0.14).toFixed(2);

    return (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex-1">
                    <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                        📦 Boxes for {roomName}
                    </h5>
                    <p className="text-xs sm:text-sm text-gray-600">
                        Standard moving boxes for general items (fragile items auto-calculated)
                    </p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={handleDecrement}
                        disabled={boxCount === 0}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
                            boxCount === 0 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        −
                    </button>
                    
                    <input
                        type="number"
                        min="0"
                        value={boxCount}
                        onChange={handleInputChange}
                        className="w-16 sm:w-20 px-2 py-2 text-center text-sm sm:text-base font-semibold text-gray-900 bg-white border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    
                    <button
                        onClick={handleIncrement}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-blue-200">
                {boxCount > 0 && (
                    <p className="text-xs text-blue-700">
                        Estimated volume: {estimatedVolume}m³ (using buffered 5 cu ft per box)
                    </p>
                )}
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 italic">
                    💡 Tip: Fragile items are automatically calculated based on furniture added. This counter is for additional general boxes.
                </p>
            </div>
        </div>
    );
}
