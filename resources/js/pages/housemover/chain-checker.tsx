import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import SubNavigationTabs from '@/components/housemover/SubNavigationTabs';
import ChainChecker from '@/components/housemover/chain-checker/ChainChecker';

export default function ChainCheckerPage() {
    return (
        <DashboardLayout>
            <Head title="Chain Checker" />
            
            <EnhancedWelcomeBanner subtitle="Track your moving chain progress with real-time updates!" />

            {/* Sub-Navigation Tabs */}
            <SubNavigationTabs
                activeTab="chain-checker"
                tabs={[
                    { id: 'overview', icon: '🏠', label: 'OVERVIEW', route: '/dashboard' },
                    { id: 'chain-checker', icon: '⛓️', label: 'CHAIN CHECKER' },
                    { id: 'move-details', icon: '📋', label: 'MY MOVE', route: '/housemover/move-details' },
                    { id: 'achievements', icon: '🏆', label: 'ACHIEVEMENTS', route: '/housemover/achievements' },
                    { id: 'connections', icon: '🔗', label: 'CONNECTIONS', route: '/housemover/connections' },
                    { id: 'settings', icon: '⚙️', label: 'SETTINGS', route: '/profile-settings' },
                ]}
            />

            {/* Chain Checker Component */}
            <ChainChecker />
        </DashboardLayout>
    );
}