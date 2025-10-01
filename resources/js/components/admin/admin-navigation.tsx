import React from 'react';

export type AdminTab = 'overview' | 'users' | 'businesses' | 'academy' | 'system' | 'settings';

interface NavigationTab {
    id: AdminTab;
    icon: string;
    label: string;
}

interface AdminNavigationProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

const navigationTabs: NavigationTab[] = [
    { id: 'overview', icon: '📊', label: 'OVERVIEW' },
    { id: 'users', icon: '👥', label: 'USERS' },
    { id: 'businesses', icon: '🏢', label: 'BUSINESSES' },
    { id: 'academy', icon: '🎓', label: 'ACADEMY' },
    { id: 'system', icon: '⚙️', label: 'SYSTEM' },
    { id: 'settings', icon: '👤', label: 'ACCOUNT' }
];

export default function AdminNavigation({ activeTab, onTabChange }: AdminNavigationProps) {
    return (
        <div className="bg-white rounded-xl p-2 mb-8 shadow-lg">
            <div className="flex space-x-2 overflow-x-auto">
                {navigationTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
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