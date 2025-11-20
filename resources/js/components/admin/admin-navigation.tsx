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
        <div className="w-full mb-4 sm:mb-6 md:mb-8">
            {/* Mobile Layout - Dropdown */}
            <div className="block sm:hidden">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-red-600">Admin Dashboard</h3>
                        <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">⚡</span>
                        </div>
                    </div>
                    
                    {/* Current Active Tab Display */}
                    <div className="mb-3 p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{navigationTabs.find(tab => tab.id === activeTab)?.icon}</span>
                            <span className="text-white font-semibold text-sm">
                                {navigationTabs.find(tab => tab.id === activeTab)?.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Other Tabs as Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {navigationTabs.filter(tab => tab.id !== activeTab).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className="flex flex-col items-center space-y-1 p-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 touch-manipulation"
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="text-xs font-medium text-center leading-tight">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tablet Layout - Compact Horizontal */}
            <div className="hidden sm:block lg:hidden">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 overflow-x-auto">
                    <div className="flex space-x-1 min-w-max">
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className={`flex flex-col items-center space-y-1 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:scale-102'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span className="text-xs">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop & Large Screen Layout - Full Horizontal */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
                    <div className="flex space-x-2">
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className={`flex items-center space-x-3 px-4 xl:px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:scale-102 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="text-sm xl:text-base">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}