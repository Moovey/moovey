import React from 'react';
import { router } from '@inertiajs/react';

interface TabItem {
    id: string;
    icon: string;
    label: string;
    route?: string;
}

interface SubNavigationTabsProps {
    activeTab: string;
    tabs: TabItem[];
    onTabChange?: (tabId: string) => void;
}

export default function SubNavigationTabs({ activeTab, tabs, onTabChange }: SubNavigationTabsProps) {
    const handleTabClick = (tab: TabItem) => {
        if (tab.route) {
            // Route to dedicated page
            router.visit(tab.route);
        } else if (onTabChange) {
            // Handle tab change locally
            onTabChange(tab.id);
        }
    };

    return (
        <div className="bg-white rounded-xl p-2 mb-8 shadow-lg">
            <div className="flex space-x-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                            activeTab === tab.id 
                                ? 'bg-[#00BCD4] text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-[#E0F7FA]'
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