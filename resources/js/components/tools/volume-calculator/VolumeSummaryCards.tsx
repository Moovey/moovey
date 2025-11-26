import { TruckSize } from './types';

interface VolumeSummaryCardsProps {
    totalVolume: number;
    furnitureVolume: number;
    boxVolume: number;
    totalBoxes: number;
    recommendedTruck: TruckSize;
    boxWarning?: string | null;
}

export default function VolumeSummaryCards({ 
    totalVolume, 
    furnitureVolume,
    boxVolume,
    totalBoxes,
    recommendedTruck,
    boxWarning
}: VolumeSummaryCardsProps) {
    return (
        <div className="p-3 sm:p-4 lg:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Volume</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        {totalVolume.toFixed(1)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">cubic metres</p>
                    {boxVolume > 0 && (
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                            Furniture: {furnitureVolume.toFixed(1)}m³ + Boxes: {boxVolume.toFixed(1)}m³
                        </p>
                    )}
                </div>

                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">📦 Total Boxes</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
                        {totalBoxes}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {boxVolume > 0 ? `${boxVolume.toFixed(2)}m³` : 'No boxes added'}
                    </p>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Recommended Truck</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {recommendedTruck.icon} {recommendedTruck.name}
                    </p>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Estimated Cost</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {recommendedTruck.price}
                    </p>
                </div>
            </div>

            {boxWarning && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-xs sm:text-sm text-yellow-800">
                        {boxWarning}
                    </p>
                </div>
            )}
        </div>
    );
}
