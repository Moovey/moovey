import React from 'react';
import type { StatusCounts } from '@/types/achievement';

interface AchievementStatsProps {
    statusCounts: StatusCounts;
    totalAchievements: number;
}

export default function AchievementStats({ statusCounts, totalAchievements }: AchievementStatsProps) {
    const completionRate = Math.round((statusCounts.earned / totalAchievements) * 100);

    return (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-[#00BCD4] mb-2">{statusCounts.earned}</div>
                <div className="text-sm text-gray-600">Achievements Earned</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{statusCounts.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{statusCounts.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                    {completionRate}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
        </div>
    );
}