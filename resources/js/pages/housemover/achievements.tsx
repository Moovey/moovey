import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import SubNavigationTabs from '@/components/housemover/SubNavigationTabs';
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

export default function Achievements() {
    const [filter, setFilter] = useState<'all' | 'earned' | 'in-progress' | 'locked'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

    const [achievements, setAchievements] = useState<Achievement[]>([
        // Learning Achievements
        {
            id: 'learn-1',
            title: 'Move Dreamer',
            description: 'Just starting your moving journey',
            icon: 'Move Dreamer.png',
            status: 'earned',
            category: 'Learning',
            earnedDate: '2025-08-10',
            points: 100,
            difficulty: 'Beginner'
        },
        {
            id: 'learn-2',
            title: 'Plan Starter',
            description: 'Beginning to plan your move',
            icon: 'Plan Starter.png',
            status: 'earned',
            category: 'Learning',
            earnedDate: '2025-08-12',
            points: 150,
            difficulty: 'Beginner'
        },
        {
            id: 'learn-3',
            title: 'Moovey Critic',
            description: 'Developing moving expertise',
            icon: 'Moovey Critic.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Complete 5 learning modules',
            progress: 2,
            maxProgress: 5,
            points: 200,
            difficulty: 'Beginner'
        },
        {
            id: 'learn-4',
            title: 'Prep Pioneer',
            description: 'Leading the way in preparation',
            icon: 'Prep Pioneer.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Complete all basic lessons',
            progress: 0,
            maxProgress: 10,
            points: 300,
            difficulty: 'Intermediate'
        },
        {
            id: 'learn-5',
            title: 'Moovey Director',
            description: 'Orchestrating successful moves',
            icon: 'Moovey Director.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Achieve 100% on all quizzes',
            progress: 0,
            maxProgress: 15,
            points: 500,
            difficulty: 'Expert'
        },
        {
            id: 'learn-6',
            title: 'Move Rockstar',
            description: 'A true moving superstar',
            icon: 'Move Rockstar.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Complete advanced moving courses',
            progress: 0,
            maxProgress: 20,
            points: 750,
            difficulty: 'Expert'
        },
        {
            id: 'learn-7',
            title: 'New Home Navigator',
            description: 'Expert at finding new homes',
            icon: 'Home Navigator.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Master home search techniques',
            progress: 0,
            maxProgress: 25,
            points: 1000,
            difficulty: 'Expert'
        },
        {
            id: 'learn-8',
            title: 'Settler Specialist',
            description: 'Master of settling into new places',
            icon: 'Settler Specialist.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Complete settling-in masterclass',
            progress: 0,
            maxProgress: 30,
            points: 1500,
            difficulty: 'Expert'
        },
        {
            id: 'learn-9',
            title: 'Moovey Star',
            description: 'The ultimate moving legend',
            icon: 'Moovey Star.png',
            status: 'locked',
            category: 'Learning',
            requirements: 'Achieve perfect moving mastery',
            progress: 0,
            maxProgress: 50,
            points: 2500,
            difficulty: 'Expert'
        },

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
    ]);

    const categories = ['Learning', 'Skills', 'Community', 'Planning', 'Networking', 'Mastery'];

    const filteredAchievements = achievements.filter(achievement => {
        const matchesStatus = filter === 'all' || achievement.status === filter;
        const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
        const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const getStatusCounts = () => {
        const earned = achievements.filter(a => a.status === 'earned').length;
        const inProgress = achievements.filter(a => a.status === 'in-progress').length;
        const locked = achievements.filter(a => a.status === 'locked').length;
        const totalPoints = achievements.filter(a => a.status === 'earned').reduce((sum, a) => sum + a.points, 0);
        return { earned, inProgress, locked, totalPoints };
    };

    const getNextRecommendation = () => {
        const inProgress = achievements.find(a => a.status === 'in-progress');
        if (inProgress) return inProgress;
        
        const locked = achievements.find(a => a.status === 'locked' && a.progress && a.progress > 0);
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
        setAchievements(prev => prev.map(achievement => 
            achievement.id === achievementId 
                ? { ...achievement, status: 'earned' as const, earnedDate: new Date().toISOString().split('T')[0] }
                : achievement
        ));
        
        const unlockedAchievement = achievements.find(a => a.id === achievementId);
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
            
            <EnhancedWelcomeBanner subtitle="Unlock achievements to earn more coins!" />

            {/* Sub-Navigation Tabs */}
            <SubNavigationTabs
                activeTab="achievements"
                tabs={[
                    { id: 'overview', icon: '🏠', label: 'OVERVIEW', route: '/dashboard' },
                    { id: 'move-details', icon: '📋', label: 'MOVE DETAILS', route: '/housemover/move-details' },
                    { id: 'achievements', icon: '🏆', label: 'ACHIEVEMENTS' },
                    { id: 'connections', icon: '🔗', label: 'CONNECTIONS', route: '/housemover/connections' },
                    { id: 'settings', icon: '⚙️', label: 'SETTINGS', route: '/profile-settings' },
                ]}
            />

            {/* Achievement Gallery Header */}
            <AchievementGalleryHeader 
                statusCounts={statusCounts}
                totalAchievements={achievements.length}
            />

            {/* Rank Progress Bar */}
            <AchievementRankProgress statusCounts={statusCounts} />

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

            {/* Debug: Simulate Achievement Unlock */}
            <AchievementDebugSection
                achievements={achievements}
                onSimulateUnlock={simulateAchievementUnlock}
            />

          
        </DashboardLayout>
    );
}
