import React from 'react';
import { Link, router } from '@inertiajs/react';

export type AdminTab = 'overview' | 'users' | 'businesses' | 'academy' | 'system' | 'settings';

interface NavigationTab {
    id: AdminTab;
    icon: string;
    label: string;
    route: string;
}

interface AdminNavigationProps {
    activeTab: AdminTab;
    onTabChange?: (tab: AdminTab) => void; // Made optional since we're using routing
}

const navigationTabs: NavigationTab[] = [
    { id: 'overview', icon: '📊', label: 'OVERVIEW', route: 'admin.overview' },
    { id: 'users', icon: '👥', label: 'USERS', route: 'admin.users' },
    { id: 'businesses', icon: '🏢', label: 'BUSINESSES', route: 'admin.businesses' },
    { id: 'academy', icon: '🎓', label: 'ACADEMY', route: 'admin.academy' },
    { id: 'system', icon: '⚙️', label: 'SYSTEM', route: 'admin.system' },
    { id: 'settings', icon: '👤', label: 'ACCOUNT', route: 'admin.settings' }
];

export default function AdminNavigation({ activeTab, onTabChange }: AdminNavigationProps) {
    const handleTabClick = (tab: NavigationTab) => {
        // Use router for navigation instead of callback
        router.visit(route(tab.route));
        
        // Keep backward compatibility if onTabChange is provided
        if (onTabChange) {
            onTabChange(tab.id);
        }
    };

    return (
        <div className="bg-white rounded-xl p-2 mb-8 shadow-lg">
            <div className="flex space-x-2 overflow-x-auto">
                {navigationTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap ${
                            activeTab === tab.id 
                                ? 'bg-red-600 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-[#F5F5F5]'
                        }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}