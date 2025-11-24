import React from 'react';
import { Link, router } from '@inertiajs/react';

export type AdminTab = 'overview' | 'users' | 'businesses' | 'academy' | 'system' | 'settings';

interface NavigationTab {
    id: AdminTab;
    icon: string;
    label: string;
    route: string;
}

// Professional SVG icon mapping function
const getAdminIcon = (iconName: string, className: string = "w-5 h-5", isActive: boolean = false) => {
    const iconProps = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 2
    };

    const iconMap: Record<string, React.ReactElement> = {
        'overview': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        'users': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4a.5.5 0 01.5.5v.5a6 6 0 01-6 6v1a.5.5 0 01-.5.5z" />
            </svg>
        ),
        'businesses': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        'academy': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
        ),
        'system': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        'settings': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    };
    return iconMap[iconName] || null;
};

interface AdminNavigationProps {
    activeTab: AdminTab;
    onTabChange?: (tab: AdminTab) => void; // Made optional since we're using routing
}

const navigationTabs: NavigationTab[] = [
    { id: 'overview', icon: 'overview', label: 'OVERVIEW', route: 'admin.overview' },
    { id: 'users', icon: 'users', label: 'USERS', route: 'admin.users' },
    { id: 'businesses', icon: 'businesses', label: 'BUSINESSES', route: 'admin.businesses' },
    { id: 'academy', icon: 'academy', label: 'ACADEMY', route: 'admin.academy' },
    { id: 'system', icon: 'system', label: 'SYSTEM', route: 'admin.system' },
    { id: 'settings', icon: 'settings', label: 'ACCOUNT', route: 'admin.settings' }
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
                        <h3 className="text-sm font-bold text-[#1A237E]">Admin Dashboard</h3>
                        <div className="w-6 h-6 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Current Active Tab Display */}
                    <div className="mb-3 p-2 bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="text-white">
                                {getAdminIcon(navigationTabs.find(tab => tab.id === activeTab)?.icon || '', "w-5 h-5", true)}
                            </div>
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
                                className="flex flex-col items-center space-y-1 p-3 rounded-lg text-gray-600 hover:bg-[#E0F7FA] hover:text-[#00BCD4] transition-all duration-200 touch-manipulation"
                            >
                                <div className="text-gray-600 hover:text-[#00BCD4] transition-colors duration-200">
                                    {getAdminIcon(tab.icon, "w-5 h-5")}
                                </div>
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
                                        ? 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-[#E0F7FA] hover:text-[#00BCD4] hover:scale-102'
                                }`}
                            >
                                <div className={activeTab === tab.id ? 'text-white' : 'text-gray-600'}>
                                    {getAdminIcon(tab.icon, "w-5 h-5", activeTab === tab.id)}
                                </div>
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
                                        ? 'bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-[#E0F7FA] hover:text-[#00BCD4] hover:scale-102 hover:shadow-sm'
                                }`}
                            >
                                <div className={activeTab === tab.id ? 'text-white' : 'text-gray-600'}>
                                    {getAdminIcon(tab.icon, "w-6 h-6 xl:w-7 xl:h-7", activeTab === tab.id)}
                                </div>
                                <span className="text-sm xl:text-base">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}