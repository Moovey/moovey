import React from 'react';
import type { Achievement } from '@/types/achievement';

interface AchievementCelebrationModalProps {
    isVisible: boolean;
    achievement: Achievement | null;
    onClose: () => void;
}

export default function AchievementCelebrationModal({ 
    isVisible, 
    achievement, 
    onClose 
}: AchievementCelebrationModalProps) {
    if (!isVisible || !achievement) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center animate-bounce">
                <div className="text-6xl mb-4">{achievement.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
                <h3 className="text-xl font-semibold text-[#00BCD4] mb-4">{achievement.title}</h3>
                <p className="text-gray-600 mb-4">{achievement.description}</p>
                <div className="text-lg font-bold text-green-600">+{achievement.points} points!</div>
                <button 
                    onClick={onClose}
                    className="mt-6 bg-[#00BCD4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0097A7] transition-colors"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
}