import React from 'react';
import type { Achievement } from '@/types/achievement';
import AchievementCategorySection from './AchievementCategorySection';

interface AchievementCategoriesGridProps {
    categories: string[];
    achievements: Achievement[];
    categoryFilter: string;
    onAchievementClick: (achievement: Achievement) => void;
    getTimeToComplete: (achievement: Achievement) => string;
}

export default function AchievementCategoriesGrid({
    categories,
    achievements,
    categoryFilter,
    onAchievementClick,
    getTimeToComplete
}: AchievementCategoriesGridProps) {
    const getAchievementsByCategory = (category: string) => {
        return achievements.filter(achievement => achievement.category === category);
    };

    const getCategoryProgress = (category: string) => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const earned = categoryAchievements.filter(a => a.status === 'earned').length;
        return Math.round((earned / categoryAchievements.length) * 100);
    };

    return (
        <>
            {categories.map(category => {
                const categoryAchievements = getAchievementsByCategory(category);
                
                // Skip this category if it doesn't match the filter
                if (categoryFilter !== 'all' && categoryFilter !== category) {
                    return null;
                }
                
                const categoryProgress = getCategoryProgress(category);
                
                return (
                    <AchievementCategorySection
                        key={category}
                        category={category}
                        achievements={categoryAchievements}
                        categoryProgress={categoryProgress}
                        onAchievementClick={onAchievementClick}
                        getTimeToComplete={getTimeToComplete}
                    />
                );
            })}
        </>
    );
}