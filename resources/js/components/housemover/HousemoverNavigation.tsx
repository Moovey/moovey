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
    const tabs: Tab[] = [
        { id: 'overview', icon: '🏠', label: 'OVERVIEW', href: onTabChange ? undefined : '/dashboard' },
        { id: 'chain-checker', icon: '⛓️', label: 'CHAIN CHECKER', href: '/housemover/chain-checker' },
        { id: 'move-details', icon: '📋', label: 'MY MOVE', href: '/housemover/move-details' },
        { id: 'achievements', icon: '🏆', label: 'ACHIEVEMENTS', href: '/housemover/achievements' },
        { id: 'connections', icon: '🔗', label: 'CONNECTIONS', href: '/housemover/connections' },
        { id: 'settings', icon: '⚙️', label: 'SETTINGS', href: '/profile-settings' },
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

    const TabContent = ({ tab, className }: { tab: Tab; className: string }) => {
        const content = (
            <>
                <span className="text-lg xl:text-xl">{tab.icon}</span>
                <span className="text-xs xl:text-sm font-medium">{tab.label}</span>
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
                            <span className="text-white text-xs">🏠</span>
                        </div>
                    </div>
                    
                    {/* Current Active Tab Display */}
                    <div className="mb-3 p-2 bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
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
                    <div className="flex space-x-2">
                        {tabs.map((tab) => (
                            <TabContent
                                key={tab.id}
                                tab={tab}
                                className={`flex items-center space-x-3 px-4 xl:px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
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