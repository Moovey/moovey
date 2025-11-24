import React from 'react';
import type { Achievement } from '@/types/achievement';

// Helper function to get the correct image path
const getAchievementImagePath = (icon: string): string => {
    // The images are in public/images/Badges/ (note the capital B)
    // In production, they should be accessible via /images/Badges/
    return `/images/Badges/${icon}`;
};

interface AchievementCardProps {
    achievement: Achievement;
    onClick: (achievement: Achievement) => void;
    getTimeToComplete: (achievement: Achievement) => string;
}

export default function AchievementCard({ 
    achievement, 
    onClick, 
    getTimeToComplete 
}: AchievementCardProps) {
    return (
        <div 
            onClick={() => onClick(achievement)}
            className={`relative bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${
                achievement.status === 'locked' ? 'opacity-60' : ''
            }`}
        >
            {/* Achievement Icon */}
            <div className="relative mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-300 overflow-hidden ${
                    achievement.status === 'earned' ? 'bg-gradient-to-br from-green-400 to-green-600 group-hover:scale-110' :
                    achievement.status === 'in-progress' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    'bg-gray-300'
                }`}>
                    {achievement.status === 'locked' ? (
                        <span className="text-3xl">🔒</span>
                    ) : achievement.icon.endsWith('.png') ? (
                        <img 
                            src={getAchievementImagePath(achievement.icon)}
                            alt={achievement.title}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                // Try alternative paths before falling back to emoji
                                const target = e.target as HTMLImageElement;
                                const currentSrc = target.src;
                                
                                // Try different paths in sequence (case sensitive)
                                if (currentSrc.includes('/images/Badges/')) {
                                    // Already tried the correct path, try lowercase
                                    target.src = `/images/badges/${achievement.icon}`;
                                } else if (currentSrc.includes('/images/badges/')) {
                                    // Try with storage path
                                    target.src = `/storage/images/Badges/${achievement.icon}`;
                                } else {
                                    // All paths failed, show fallback emoji
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.fallback-emoji')) {
                                        const fallback = document.createElement('span');
                                        fallback.className = 'fallback-emoji text-3xl';
                                        fallback.textContent = '🏆'; // Trophy emoji as fallback
                                        parent.appendChild(fallback);
                                    }
                                }
                            }}
                        />
                    ) : (
                        <span className="text-3xl">{achievement.icon}</span>
                    )}
                </div>
                
                {/* Status Indicator */}
                {achievement.status === 'earned' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* Hover overlay for locked achievements */}
                {achievement.status === 'locked' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-xs font-medium">Click for details</span>
                    </div>
                )}
            </div>

            {/* Achievement Title */}
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                {achievement.title}
            </h3>

            {/* Achievement Description */}
            <p className="text-sm text-gray-600 text-center mb-3">
                {achievement.description}
            </p>

            {/* Status-specific content */}
            {achievement.status === 'earned' && achievement.earnedDate && (
                <div className="text-center">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-2 animate-pulse">
                        Achievement unlocked!
                    </div>
                    <div className="text-xs text-gray-500">
                        Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                    <button className="mt-2 text-xs text-[#00BCD4] hover:text-[#0097A7] font-medium">
                        Click to share
                    </button>
                </div>
            )}

            {achievement.status === 'locked' && (
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">
                        {achievement.requirements}
                    </div>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-[#00BCD4] h-2 rounded-full transition-all duration-300"
                                    style={{width: `${(achievement.progress / achievement.maxProgress) * 100}%`}}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Est. {getTimeToComplete(achievement)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {achievement.status === 'in-progress' && (
                <div className="text-center">
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                        In Progress
                    </div>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{width: `${(achievement.progress / achievement.maxProgress) * 100}%`}}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Points and Difficulty */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-[#00BCD4]">
                    {achievement.points} pts
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    achievement.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    achievement.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {achievement.difficulty}
                </span>
            </div>

            {/* Shine effect for earned achievements */}
            {achievement.status === 'earned' && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
            )}
        </div>
    );
}