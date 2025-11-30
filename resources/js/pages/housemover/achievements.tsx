import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';
import { useMoveProgress } from '@/hooks/useMoveProgress';
import { 
    AchievementCelebrationModal, 
    AchievementCard, 
    AchievementGalleryHeader,
    AchievementFilters,
    AchievementRankProgress,
    AchievementCategoriesGrid,
    AchievementDebugSection
} from '@/components/achievements';
import type { Achievement } from '@/types/achievement';

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

interface AchievementsProps {
    academyProgress: AcademyProgress;
    learningAchievements: Achievement[];
}

export default function Achievements({ academyProgress, learningAchievements }: AchievementsProps) {
    const { taskData } = useMoveProgress();
    const [filter, setFilter] = useState<'all' | 'earned' | 'in-progress' | 'locked'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

    // Merge real learning achievements with placeholder achievements for other categories
    const placeholderAchievements: Achievement[] = [
        // Skills Achievements
        {
            id: 'skill-1',
            title: 'Budget Master Award',
            description: 'Master the art of moving on a budget',
            icon: '�',
            status: 'earned',
            category: 'Skills',
            earnedDate: '2025-08-14',
            points: 250,
            difficulty: 'Intermediate'
        },
        {
            id: 'skill-2',
            title: 'Community Leader Award',
            description: 'Lead and inspire your moving community',
            icon: '�',
            status: 'locked',
            category: 'Skills',
            requirements: 'Help 25 community members with their moves',
            progress: 15,
            maxProgress: 25,
            points: 300,
            difficulty: 'Intermediate'
        },
        {
            id: 'skill-3',
            title: 'Networker Award',
            description: 'Build valuable connections in the moving industry',
            icon: '🌐',
            status: 'locked',
            category: 'Skills',
            requirements: 'Connect with 50 moving professionals',
            progress: 0,
            maxProgress: 50,
            points: 400,
            difficulty: 'Expert'
        },
        {
            id: 'skill-4',
            title: 'Offer Accepted Award',
            description: 'Successfully navigate property offers',
            icon: '🏠',
            status: 'locked',
            category: 'Skills',
            requirements: 'Have 3 property offers accepted',
            progress: 0,
            maxProgress: 3,
            points: 500,
            difficulty: 'Expert'
        },
        {
            id: 'skill-5',
            title: 'Utility Wizard Award',
            description: 'Master all aspects of utility transfers',
            icon: '⚡',
            status: 'locked',
            category: 'Skills',
            requirements: 'Complete utility setups for 5 properties',
            progress: 0,
            maxProgress: 5,
            points: 1000,
            difficulty: 'Expert'
        },

        // Community Achievements
        {
            id: 'community-1',
            title: 'Helper',
            description: 'Help your first community member',
            icon: '🤝',
            status: 'earned',
            category: 'Community',
            earnedDate: '2025-08-15',
            points: 200,
            difficulty: 'Beginner'
        },
        {
            id: 'community-2',
            title: 'Mentor',
            description: 'Provide guidance to new movers',
            icon: '👨‍🏫',
            status: 'earned',
            category: 'Community',
            earnedDate: '2025-08-16',
            points: 300,
            difficulty: 'Intermediate'
        },
        {
            id: 'community-3',
            title: 'Supporter',
            description: 'Receive 5-star ratings',
            icon: '⭐',
            status: 'earned',
            category: 'Community',
            earnedDate: '2025-08-16',
            points: 250,
            difficulty: 'Intermediate'
        },
        {
            id: 'community-4',
            title: 'Leader',
            description: 'Lead community discussions',
            icon: '👑',
            status: 'earned',
            category: 'Community',
            earnedDate: '2025-08-16',
            points: 400,
            difficulty: 'Expert'
        },
        {
            id: 'community-5',
            title: 'Ambassador',
            description: 'Represent the community',
            icon: '🌟',
            status: 'locked',
            category: 'Community',
            requirements: 'Help 50 community members',
            progress: 4,
            maxProgress: 50,
            points: 1000,
            difficulty: 'Expert'
        },

        // Planning Achievements
        {
            id: 'planning-1',
            title: 'Organizer',
            description: 'Create your first moving plan',
            icon: '📋',
            status: 'locked',
            category: 'Planning',
            requirements: 'Complete moving timeline',
            progress: 0,
            maxProgress: 1,
            points: 150,
            difficulty: 'Beginner'
        },
        {
            id: 'planning-2',
            title: 'Scheduler',
            description: 'Set up detailed timelines',
            icon: '⏰',
            status: 'locked',
            category: 'Planning',
            requirements: 'Schedule all moving tasks',
            progress: 0,
            maxProgress: 20,
            points: 200,
            difficulty: 'Intermediate'
        },
        {
            id: 'planning-3',
            title: 'Coordinator',
            description: 'Coordinate multiple services',
            icon: '🎯',
            status: 'locked',
            category: 'Planning',
            requirements: 'Book 5 different services',
            progress: 0,
            maxProgress: 5,
            points: 300,
            difficulty: 'Intermediate'
        },
        {
            id: 'planning-4',
            title: 'Manager',
            description: 'Successfully manage entire move',
            icon: '💼',
            status: 'locked',
            category: 'Planning',
            requirements: 'Complete move on schedule',
            progress: 0,
            maxProgress: 1,
            points: 500,
            difficulty: 'Expert'
        },
        {
            id: 'planning-5',
            title: 'Master Planner',
            description: 'Plan multiple successful moves',
            icon: '🏅',
            status: 'locked',
            category: 'Planning',
            requirements: 'Plan 3 successful moves',
            progress: 0,
            maxProgress: 3,
            points: 1000,
            difficulty: 'Expert'
        },

        // Networking Achievements
        {
            id: 'network-1',
            title: 'Connector',
            description: 'Make your first connection',
            icon: '🔗',
            status: 'locked',
            category: 'Networking',
            requirements: 'Connect with 5 people',
            progress: 0,
            maxProgress: 5,
            points: 100,
            difficulty: 'Beginner'
        },
        {
            id: 'network-2',
            title: 'Networker',
            description: 'Build a strong network',
            icon: '🌐',
            status: 'locked',
            category: 'Networking',
            requirements: 'Connect with 25 people',
            progress: 0,
            maxProgress: 25,
            points: 300,
            difficulty: 'Intermediate'
        },
        {
            id: 'network-3',
            title: 'Influencer',
            description: 'Become a trusted voice',
            icon: '📢',
            status: 'locked',
            category: 'Networking',
            requirements: 'Receive 100 referrals',
            progress: 0,
            maxProgress: 100,
            points: 500,
            difficulty: 'Expert'
        },
        {
            id: 'network-4',
            title: 'Hub',
            description: 'Become a networking hub',
            icon: '🎪',
            status: 'locked',
            category: 'Networking',
            requirements: 'Connect 50 people',
            progress: 0,
            maxProgress: 50,
            points: 750,
            difficulty: 'Expert'
        },
        {
            id: 'network-5',
            title: 'Super Connector',
            description: 'Master of networking',
            icon: '⚡',
            status: 'locked',
            category: 'Networking',
            requirements: 'Maintain 500+ connections',
            progress: 0,
            maxProgress: 500,
            points: 2000,
            difficulty: 'Expert'
        },

        // Mastery Achievements
        {
            id: 'mastery-1',
            title: 'Expert',
            description: 'Demonstrate expertise',
            icon: '🧠',
            status: 'locked',
            category: 'Mastery',
            requirements: 'Complete all categories',
            progress: 0,
            maxProgress: 5,
            points: 1000,
            difficulty: 'Expert'
        },
        {
            id: 'mastery-2',
            title: 'Guru',
            description: 'Become a moving guru',
            icon: '🕯️',
            status: 'locked',
            category: 'Mastery',
            requirements: 'Help 100 successful moves',
            progress: 0,
            maxProgress: 100,
            points: 2000,
            difficulty: 'Expert'
        },
        {
            id: 'mastery-3',
            title: 'Legend',
            description: 'Legendary status achieved',
            icon: '👑',
            status: 'locked',
            category: 'Mastery',
            requirements: 'Maintain expert status for 1 year',
            progress: 0,
            maxProgress: 365,
            points: 5000,
            difficulty: 'Expert'
        },
        {
            id: 'mastery-4',
            title: 'Sage',
            description: 'Ultimate wisdom achieved',
            icon: '🌟',
            status: 'locked',
            category: 'Mastery',
            requirements: 'Train 50 other experts',
            progress: 0,
            maxProgress: 50,
            points: 10000,
            difficulty: 'Expert'
        },
        {
            id: 'mastery-5',
            title: 'Master',
            description: 'The ultimate achievement',
            icon: '💎',
            status: 'locked',
            category: 'Mastery',
            requirements: 'Achieve all other badges',
            progress: 0,
            maxProgress: 30,
            points: 25000,
            difficulty: 'Expert'
        }
    ];

    // Combine real learning achievements with placeholder achievements
    const [achievements, setAchievements] = useState<Achievement[]>([
        ...learningAchievements,
        ...placeholderAchievements
    ]);

    const categories = ['Learning', 'Skills', 'Community', 'Planning', 'Networking', 'Mastery'];

    const filteredAchievements = achievements.filter((achievement: Achievement) => {
        const matchesStatus = filter === 'all' || achievement.status === filter;
        const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
        const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const getStatusCounts = () => {
        const earned = achievements.filter((a: Achievement) => a.status === 'earned').length;
        const inProgress = achievements.filter((a: Achievement) => a.status === 'in-progress').length;
        const locked = achievements.filter((a: Achievement) => a.status === 'locked').length;
        // Only count points from Learning category (real achievements from academy progress)
        const totalPoints = achievements
            .filter((a: Achievement) => a.status === 'earned' && a.category === 'Learning')
            .reduce((sum: number, a: Achievement) => sum + a.points, 0);
        return { earned, inProgress, locked, totalPoints };
    };

    const getNextRecommendation = () => {
        const inProgress = achievements.find((a: Achievement) => a.status === 'in-progress');
        if (inProgress) return inProgress;
        
        const locked = achievements.find((a: Achievement) => a.status === 'locked' && a.progress && a.progress > 0);
        return locked;
    };

    const handleAchievementClick = (achievement: Achievement) => {
        if (achievement.status === 'locked') {
            // Show requirements in a tooltip or modal
            console.log('Show requirements for:', achievement.title);
            alert(`To unlock "${achievement.title}":\n${achievement.requirements}\n\nProgress: ${achievement.progress}/${achievement.maxProgress}`);
        } else if (achievement.status === 'earned') {
            // Show share options
            console.log('Share achievement:', achievement.title);
            if (navigator.share) {
                navigator.share({
                    title: `I earned the ${achievement.title} badge on Moovey!`,
                    text: `Check out my latest achievement: ${achievement.title} - ${achievement.description}`,
                    url: window.location.href,
                });
            } else {
                // Fallback share functionality
                const shareText = `I earned the ${achievement.title} badge on Moovey! 🏆`;
                navigator.clipboard.writeText(shareText);
                alert('Achievement details copied to clipboard!');
            }
        }
    };

    const getTimeToComplete = (achievement: Achievement): string => {
        if (achievement.status === 'earned') return 'Completed';
        if (!achievement.progress || !achievement.maxProgress) return 'Not started';
        
        const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
        if (progressPercentage < 25) return '4-6 weeks';
        if (progressPercentage < 50) return '2-4 weeks';
        if (progressPercentage < 75) return '1-2 weeks';
        return 'Almost there!';
    };

    const simulateAchievementUnlock = (achievementId: string) => {
        setAchievements((prev: Achievement[]) => prev.map((achievement: Achievement) => 
            achievement.id === achievementId 
                ? { ...achievement, status: 'earned' as const, earnedDate: new Date().toISOString().split('T')[0] }
                : achievement
        ));
        
        const unlockedAchievement = achievements.find((a: Achievement) => a.id === achievementId);
        if (unlockedAchievement) {
            setNewlyUnlocked(unlockedAchievement);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
        }
    };

    const statusCounts = getStatusCounts();

    return (
        <DashboardLayout>
            <Head title="Achievements" />
            
            {/* Celebration Modal */}
            <AchievementCelebrationModal 
                isVisible={showCelebration}
                achievement={newlyUnlocked}
                onClose={() => setShowCelebration(false)}
            />
            
            <EnhancedWelcomeBanner subtitle="Unlock achievements to earn more coins!" showProgress={true} taskData={taskData || undefined} />

            {/* Sub-Navigation Tabs */}
            <HousemoverNavigation activeTab="achievements" />

            {/* Achievement Gallery Header */}
            <AchievementGalleryHeader 
                statusCounts={statusCounts}
                totalAchievements={achievements.length}
            />

            {/* Rank Progress Bar */}
            <AchievementRankProgress statusCounts={statusCounts} academyProgress={academyProgress} />

            {/* Filters */}
            <AchievementFilters
                filter={filter}
                setFilter={setFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
            />

            {/* Achievement Categories */}
            <AchievementCategoriesGrid
                categories={categories}
                achievements={achievements}
                categoryFilter={categoryFilter}
                onAchievementClick={handleAchievementClick}
                getTimeToComplete={getTimeToComplete}
            />

          
        </DashboardLayout>
    );
}
