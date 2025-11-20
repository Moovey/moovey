import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';
import ChainChecker from '@/components/housemover/chain-checker/ChainChecker';
import { useMoveProgress } from '@/hooks/useMoveProgress';

export default function ChainCheckerPage() {
    const { taskData } = useMoveProgress();
    
    return (
        <DashboardLayout>
            <Head title="Chain Checker" />
            
            <EnhancedWelcomeBanner subtitle="Track your moving chain progress with real-time updates!" showProgress={true} taskData={taskData || undefined} />

            {/* Sub-Navigation Tabs */}
            <HousemoverNavigation activeTab="chain-checker" />

            {/* Chain Checker Component */}
            <ChainChecker />
        </DashboardLayout>
    );
}