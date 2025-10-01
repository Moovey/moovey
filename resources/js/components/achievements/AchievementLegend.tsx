import React from 'react';
import type { StatusCounts } from '@/types/achievement';

interface AchievementLegendProps {
    statusCounts: StatusCounts;
}

export default function AchievementLegend({ statusCounts }: AchievementLegendProps) {
    return (
        <div className="flex justify-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                    Earned ({statusCounts.earned})
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                    In-progress ({statusCounts.inProgress})
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                    Locked ({statusCounts.locked})
                </span>
            </div>
        </div>
    );
}