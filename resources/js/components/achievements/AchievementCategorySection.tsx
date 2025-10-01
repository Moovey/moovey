import React from 'react';
import type { Achievement } from '@/types/achievement';
import AchievementCard from './AchievementCard';

interface AchievementCategorySectionProps {
    category: string;
    achievements: Achievement[];
    categoryProgress: number;
    onAchievementClick: (achievement: Achievement) => void;
    getTimeToComplete: (achievement: Achievement) => string;
}

export default function AchievementCategorySection({
    category,
    achievements,
    categoryProgress,
    onAchievementClick,
    getTimeToComplete
}: AchievementCategorySectionProps) {
    if (achievements.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{category} Achievements</h3>
                <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">{categoryProgress}% Complete</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-[#00BCD4] h-2 rounded-full transition-all duration-500"
                            style={{width: `${categoryProgress}%`}}
                        ></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {achievements.map(achievement => (
                    <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        onClick={onAchievementClick}
                        getTimeToComplete={getTimeToComplete}
                    />
                ))}
            </div>
        </div>
    );
}