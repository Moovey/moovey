import { TruckSize } from './types';

interface VolumeSummaryCardsProps {
    totalVolume: number;
    furnitureVolume: number;
    boxVolume: number;
    totalBoxes: number;
    regularBoxes?: number;
    fragileBoxes?: number;
    autoFragileBoxes?: number;
    recommendedTruck: TruckSize;
    boxWarning?: string | null;
}

export default function VolumeSummaryCards({ 
    totalVolume, 
    furnitureVolume,
    boxVolume,
    totalBoxes,
    regularBoxes,
    fragileBoxes,
    autoFragileBoxes,
    recommendedTruck,
    boxWarning
}: VolumeSummaryCardsProps) {
    return (
        <div className="p-3 sm:p-4 lg:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Volume</p>
                    </div>
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
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">Regular Boxes</p>
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
                        {regularBoxes || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {((regularBoxes || 0) * 0.14).toFixed(2)}m³
                    </p>
                </div>

                <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">Fragile Boxes</p>
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-900">
                        {(fragileBoxes || 0)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {((fragileBoxes || 0) * 0.14).toFixed(2)}m³
                    </p>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9M3 4h18l-2 13H5L3 4z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">Recommended Truck</p>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {recommendedTruck.icon} {recommendedTruck.name}
                    </p>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">Estimated Cost</p>
                    </div>
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
