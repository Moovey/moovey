import { DeclutterStats } from './types';

interface StatsOverviewProps {
    stats: DeclutterStats;
    totalEstimatedValue: number;
}

export default function StatsOverview({ stats, totalEstimatedValue }: StatsOverviewProps) {
    return (
        <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📊</span>
                <span>Overview</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-gradient-to-r from-[#17B7C7] to-[#138994] rounded-lg sm:rounded-xl p-3 sm:p-4 text-white text-center">
                    <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs sm:text-sm opacity-90">Total Items</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white text-center">
                    <div className="text-xl sm:text-2xl font-bold">£{totalEstimatedValue.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm opacity-90">Est. Value</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 sm:mt-3">
                <div className="bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-blue-700">{stats.sell}</div>
                    <div className="text-xs text-blue-600">Sell</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-md sm:rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-green-700">{stats.donate}</div>
                    <div className="text-xs text-green-600">Donate</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-md sm:rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-red-700">{stats.throw}</div>
                    <div className="text-xs text-red-600">Throw</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-gray-700">{stats.keep}</div>
                    <div className="text-xs text-gray-600">Keep</div>
                </div>
            </div>
        </div>
    );
}
