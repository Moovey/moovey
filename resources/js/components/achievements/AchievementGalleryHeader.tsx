import React from 'react';
import AchievementStats from './AchievementStats';
import AchievementLegend from './AchievementLegend';
import type { StatusCounts } from '@/types/achievement';

interface AchievementGalleryHeaderProps {
    statusCounts: StatusCounts;
    totalAchievements: number;
}

export default function AchievementGalleryHeader({ statusCounts, totalAchievements }: AchievementGalleryHeaderProps) {
    return (
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Achievement Gallery</h2>
            <p className="text-gray-600 mb-6">Track your progress and celebrate your moving milestones</p>
            
            {/* Achievement Stats */}
            <AchievementStats 
                statusCounts={statusCounts}
                totalAchievements={totalAchievements}
            />
            
            {/* Status Legend */}
            <AchievementLegend statusCounts={statusCounts} />
        </div>
    );
}