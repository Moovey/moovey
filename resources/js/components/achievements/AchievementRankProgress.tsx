import React from 'react';
import type { StatusCounts } from '@/types/achievement';

interface Rank {
    name: string;
    pointsRequired: number;
    emoji: string;
    description: string;
}

interface AchievementRankProgressProps {
    statusCounts: StatusCounts;
}

export default function AchievementRankProgress({ statusCounts }: AchievementRankProgressProps) {
    const ranks: Rank[] = [
        { name: 'Move Dreamer', pointsRequired: 0, emoji: '💭', description: 'Just starting your moving journey' },
        { name: 'Plan Starter', pointsRequired: 500, emoji: '📋', description: 'Beginning to plan your move' },
        { name: 'Moovey Critic', pointsRequired: 1000, emoji: '🎯', description: 'Developing moving expertise' },
        { name: 'Prep Pioneer', pointsRequired: 2000, emoji: '🚀', description: 'Leading the way in preparation' },
        { name: 'Moovey Director', pointsRequired: 4000, emoji: '🎬', description: 'Orchestrating successful moves' },
        { name: 'Move Rockstar', pointsRequired: 7000, emoji: '🌟', description: 'A true moving superstar' },
        { name: 'New Home Navigator', pointsRequired: 12000, emoji: '🧭', description: 'Expert at finding new homes' },
        { name: 'Settler Specialist', pointsRequired: 20000, emoji: '🏰', description: 'Master of settling into new places' },
        { name: 'Moovey Star', pointsRequired: 35000, emoji: '⭐', description: 'The ultimate moving legend' }
    ];

    const currentPoints = statusCounts.totalPoints;
    let currentRank = ranks[0];
    let nextRank = ranks[1];

    for (let i = 0; i < ranks.length; i++) {
        if (currentPoints >= ranks[i].pointsRequired) {
            currentRank = ranks[i];
            nextRank = ranks[i + 1] || ranks[i];
        } else {
            break;
        }
    }

    const progressToNext = nextRank && currentRank !== nextRank 
        ? Math.min(100, ((currentPoints - currentRank.pointsRequired) / (nextRank.pointsRequired - currentRank.pointsRequired)) * 100) 
        : 100;

    return (
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-3xl p-8 mb-8 text-white shadow-xl">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Your Moovey Rank</h3>
                <p className="opacity-90">Advance through the ranks by earning achievement points</p>
            </div>
            
            <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                    <div className="text-6xl mb-2">{currentRank.emoji}</div>
                    <h4 className="text-xl font-bold mb-1">{currentRank.name}</h4>
                    <p className="opacity-90 text-sm">{currentRank.description}</p>
                    <div className="mt-2 text-lg font-semibold">
                        {currentPoints.toLocaleString()} points
                    </div>
                </div>
            </div>
            
            {nextRank && currentRank !== nextRank && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm opacity-90">
                            Progress to {nextRank.name} {nextRank.emoji}
                        </div>
                        <div className="text-sm font-medium">
                            {currentPoints}/{nextRank.pointsRequired} points
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                        <div 
                            className="bg-white h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{width: `${progressToNext}%`}}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-center text-sm opacity-90">
                        {(nextRank.pointsRequired - currentPoints).toLocaleString()} points until next rank
                    </div>
                </div>
            )}
            
            {currentRank === ranks[ranks.length - 1] && (
                <div className="text-center">
                    <div className="bg-white/20 rounded-2xl p-4">
                        <h5 className="font-bold mb-2">🏆 Maximum Rank Achieved!</h5>
                        <p className="text-sm opacity-90">You've reached the highest Moovey rank. Congratulations!</p>
                    </div>
                </div>
            )}
        </div>
    );
}