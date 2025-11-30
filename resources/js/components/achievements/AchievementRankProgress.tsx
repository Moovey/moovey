import React from 'react';
import type { StatusCounts } from '@/types/achievement';

interface Rank {
    name: string;
    emoji: string;
    description: string;
}

interface AcademyProgress {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    currentLevel: number;
    currentRank: string;
    nextRank: string;
    completedStages: number;
    highestCompletedLevel: number;
}

interface AchievementRankProgressProps {
    statusCounts: StatusCounts;
    academyProgress: AcademyProgress;
}

export default function AchievementRankProgress({ statusCounts, academyProgress }: AchievementRankProgressProps) {
    const rankInfo: { [key: string]: { description: string; image: string } } = {
        'MOVE DREAMER': { description: 'Just starting your moving journey', image: 'Move Dreamer.png' },
        'PLAN STARTER': { description: 'Beginning to plan your move', image: 'Plan Starter.png' },
        'MOOVEY CRITIC': { description: 'Developing moving expertise', image: 'Moovey Critic.png' },
        'PREP PIONEER': { description: 'Leading the way in preparation', image: 'Prep Pioneer.png' },
        'MOOVEY DIRECTOR': { description: 'Orchestrating successful moves', image: 'Moovey Director.png' },
        'MOVE ROCKSTAR': { description: 'A true moving superstar', image: 'Move Rockstar.png' },
        'HOME NAVIGATOR': { description: 'Expert at finding new homes', image: 'Home Navigator.png' },
        'SETTLER SPECIALIST': { description: 'Master of settling into new places', image: 'Settler Specialist.png' },
        'MOOVEY STAR': { description: 'The ultimate moving legend', image: 'Moovey Star.png' }
    };

    const currentRankInfo = rankInfo[academyProgress.currentRank] || rankInfo['MOVE DREAMER'];
    const isMaxRank = academyProgress.currentRank === 'MOOVEY STAR';
    const currentPoints = statusCounts.totalPoints;

    return (
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-3xl p-8 mb-8 text-white shadow-xl">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Your Moovey Rank</h3>
                <p className="opacity-90">Advance through the ranks by earning achievement points</p>
            </div>
            
            <div className="flex items-center justify-center">
                <div className="text-center">
                    {/* Rank Badge Image */}
                    <div className="mb-4 flex justify-center">
                        <img 
                            src={`/images/badges/${currentRankInfo.image}`} 
                            alt={academyProgress.currentRank}
                            className="w-32 h-32 object-contain drop-shadow-lg"
                        />
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-2">{academyProgress.currentRank}</h4>
                    <p className="opacity-90 text-sm mb-3">{currentRankInfo.description}</p>
                    <div className="text-sm opacity-90 mb-4">
                        Level {academyProgress.currentLevel}
                    </div>
                    
                    {/* Total Points - At the bottom */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="text-lg font-semibold">
                            {currentPoints.toLocaleString()} points
                        </div>
                        <div className="text-xs opacity-75 mt-1">Total Points Earned</div>
                    </div>
                </div>
            </div>
            
            {isMaxRank && (
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