export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'earned' | 'in-progress' | 'locked';
    category: string;
    earnedDate?: string;
    progress?: number;
    maxProgress?: number;
    requirements?: string;
    points: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface StatusCounts {
    earned: number;
    inProgress: number;
    locked: number;
    totalPoints: number;
}