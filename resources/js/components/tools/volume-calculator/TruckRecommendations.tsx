import { TruckSize } from './types';

interface TruckRecommendationsProps {
    truckSizes: TruckSize[];
    totalVolume: number;
}

export default function TruckRecommendations({ truckSizes, totalVolume }: TruckRecommendationsProps) {
    if (totalVolume === 0) {
        return null;
    }

    return (
        <div className="p-3 sm:p-4 lg:p-6 bg-white border-t border-gray-200">
            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-700 mb-3 sm:mb-4 lg:mb-6">Truck Size Recommendations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {truckSizes.map(truck => {
                    const isRecommended = truck.volume >= totalVolume && 
                                        (truckSizes.find(t => t.volume >= totalVolume)?.name === truck.name);
                    
                    return (
                        <div 
                            key={truck.name}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                                isRecommended 
                                    ? 'border-[#17B7C7] bg-blue-50 shadow-lg sm:transform sm:scale-105' 
                                    : truck.volume < totalVolume
                                        ? 'border-red-200 bg-red-50 opacity-60'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{truck.icon}</div>
                                <h5 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 sm:mb-2">
                                    {truck.name}
                                    {isRecommended && <span className="text-[#17B7C7] ml-1 text-base sm:text-lg">✓</span>}
                                </h5>
                                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">{truck.volume}m³ capacity</p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-2">{truck.description}</p>
                                <p className="text-xs sm:text-sm font-bold text-gray-900">{truck.price}</p>
                                {isRecommended && (
                                    <p className="text-[10px] sm:text-xs text-[#17B7C7] font-semibold mt-2">Recommended</p>
                                )}
                                {truck.volume < totalVolume && (
                                    <p className="text-[10px] sm:text-xs text-red-600 mt-2 font-medium">Too small</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
