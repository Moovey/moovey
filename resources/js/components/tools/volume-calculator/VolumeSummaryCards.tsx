import { TruckSize } from './types';

interface VolumeSummaryCardsProps {
    totalVolume: number;
    recommendedTruck: TruckSize;
}

export default function VolumeSummaryCards({ totalVolume, recommendedTruck }: VolumeSummaryCardsProps) {
    return (
        <div className="p-3 sm:p-4 lg:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Volume</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        {totalVolume.toFixed(1)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">cubic metres</p>
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
        </div>
    );
}
