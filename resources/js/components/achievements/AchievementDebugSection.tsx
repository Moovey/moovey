import React from 'react';
import type { Achievement } from '@/types/achievement';

interface AchievementDebugSectionProps {
    achievements: Achievement[];
    onSimulateUnlock: (achievementId: string) => void;
}

export default function AchievementDebugSection({ 
    achievements, 
    onSimulateUnlock 
}: AchievementDebugSectionProps) {
    const lockedAchievements = achievements.filter(a => a.status === 'locked').slice(0, 5);

    return (
        <div className="bg-gray-100 rounded-2xl p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Debug: Simulate Achievement Unlock</h3>
            <div className="flex flex-wrap gap-2">
                {lockedAchievements.map(achievement => (
                    <button
                        key={achievement.id}
                        onClick={() => onSimulateUnlock(achievement.id)}
                        className="px-3 py-1 bg-[#00BCD4] text-white rounded-lg text-sm hover:bg-[#0097A7] transition-colors"
                    >
                        Unlock {achievement.title}
                    </button>
                ))}
            </div>
        </div>
    );
}