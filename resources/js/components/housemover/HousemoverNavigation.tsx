import { Link } from '@inertiajs/react';

interface Tab {
  id: 'overview' | 'chain-checker' | 'move-details' | 'achievements' | 'connections' | 'settings';
  icon: string;
  label: string;
  href?: string;
}

interface HousemoverNavigationProps {
    activeTab: 'overview' | 'chain-checker' | 'move-details' | 'achievements' | 'connections' | 'settings';
    onTabChange?: (tabId: string) => void;
}

export default function HousemoverNavigation({ activeTab, onTabChange }: HousemoverNavigationProps) {
    const getTabIcon = (tabId: string, isActive: boolean = false) => {
        const iconColor = isActive ? 'currentColor' : '#17B7C7';
        const iconSize = "w-5 h-5 lg:w-6 lg:h-6";
        
        switch (tabId) {
            case 'overview':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'chain-checker':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                );
            case 'move-details':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                );
            case 'achievements':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
            case 'connections':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'settings':
                return (
                    <svg className={iconSize} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const tabs: Tab[] = [
        { id: 'overview', icon: '', label: 'OVERVIEW', href: onTabChange ? undefined : '/dashboard' },
        { id: 'chain-checker', icon: '', label: 'CHAIN CHECKER', href: '/housemover/chain-checker' },
        { id: 'move-details', icon: '', label: 'MY MOVE', href: '/housemover/move-details' },
        { id: 'achievements', icon: '', label: 'ACHIEVEMENTS', href: '/housemover/achievements' },
        { id: 'connections', icon: '', label: 'CONNECTIONS', href: '/housemover/connections' },
        { id: 'settings', icon: '', label: 'SETTINGS', href: '/profile-settings' },
    ];

    const handleTabClick = (tab: Tab) => {
        if (onTabChange && tab.id === 'overview') {
            // Special handling for overview tab on dashboard
            onTabChange(tab.id);
        } else if (tab.href) {
            // Navigate to other pages
            window.location.href = tab.href;
        }
    };

    const TabContent = ({ tab, className, isActive = false }: { tab: Tab; className: string; isActive?: boolean }) => {
        const content = (
            <>
                {getTabIcon(tab.id, isActive)}
                <span className="text-xs lg:text-xs xl:text-sm font-medium">{tab.label}</span>
            </>
        );

        if (tab.href && (!onTabChange || tab.id !== 'overview')) {
            return (
                <Link
                    href={tab.href}
                    className={className}
                >
                    {content}
                </Link>
            );
        } else {
            return (
                <button
                    onClick={() => handleTabClick(tab)}
                    className={className}
                >
                    {content}
                </button>
            );
        }
    };

    return (
        <div className="w-full mb-4 sm:mb-6 md:mb-8">
            {/* Mobile Layout - Card Style with Active Tab Display */}
            <div className="block sm:hidden">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-[#1A237E]">Housemover Dashboard</h3>
                        <div className="w-6 h-6 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Current Active Tab Display */}
                    <div className="mb-3 p-2 bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] rounded-lg">
                        <div className="flex items-center space-x-2">
                            {getTabIcon(activeTab, true)}
                            <span className="text-white font-semibold text-sm">
                                {tabs.find(tab => tab.id === activeTab)?.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Other Tabs as Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {tabs.filter(tab => tab.id !== activeTab).map((tab) => (
                            <TabContent
                                key={tab.id}
                                tab={tab}
                                isActive={false}
                                className="flex flex-col items-center space-y-1 p-3 rounded-lg text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] transition-all duration-200 touch-manipulation"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Tablet Layout - Compact Horizontal Scrollable */}
            <div className="hidden sm:block lg:hidden">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 overflow-x-auto">
                    <div className="flex space-x-1 min-w-max">
                        {tabs.map((tab) => (
                            <TabContent
                                key={tab.id}
                                tab={tab}
                                isActive={activeTab === tab.id}
                                className={`flex flex-col items-center space-y-1 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] hover:scale-102'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop & Large Screen Layout - Full Horizontal */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
                    <div className="flex space-x-1 lg:space-x-2">
                        {tabs.map((tab) => (
                            <TabContent
                                key={tab.id}
                                tab={tab}
                                isActive={activeTab === tab.id}
                                className={`flex items-center space-x-2 px-2 lg:px-3 xl:px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] hover:scale-102 hover:shadow-sm'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}