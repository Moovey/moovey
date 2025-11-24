import { Link, usePage } from '@inertiajs/react';

// Professional SVG icons for Business Navigation
const getBusinessNavIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        overview: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        leads: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
        services: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        analytics: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        settings: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        business: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        dashboard: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
        )
    };
    
    return icons[name] || icons.dashboard;
};

interface Tab {
  id: 'overview' | 'leads' | 'services' | 'analytics' | 'settings';
  icon: string;
  label: string;
  href: string;
}

const tabs: Tab[] = [
  { id: 'overview', icon: 'overview', label: 'OVERVIEW', href: '/business/dashboard' },
  { id: 'leads', icon: 'leads', label: 'CUSTOMER LEADS', href: '/business/leads' },
  { id: 'services', icon: 'services', label: 'MY SERVICES', href: '/business/services' },
  { id: 'analytics', icon: 'analytics', label: 'ANALYTICS', href: '/business/analytics' },
  { id: 'settings', icon: 'settings', label: 'SETTINGS', href: '/business/profile' },
];

export default function BusinessNavTabs({ active }: { active: Tab['id'] }) {
  return (
    <div className="w-full mb-4 sm:mb-6 md:mb-8">
      {/* Mobile Layout - Dropdown */}
      <div className="block sm:hidden">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1A237E]">Business Dashboard</h3>
            <div className="w-6 h-6 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-full flex items-center justify-center">
              {getBusinessNavIcon('business', 'w-3 h-3 text-white')}
            </div>
          </div>
          
          {/* Current Active Tab Display */}
          <div className="mb-3 p-2 bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] rounded-lg">
            <div className="flex items-center space-x-2">
              {getBusinessNavIcon(tabs.find(tab => tab.id === active)?.icon || 'overview', 'w-5 h-5 text-white')}
              <span className="text-white font-semibold text-sm">
                {tabs.find(tab => tab.id === active)?.label}
              </span>
            </div>
          </div>
          
          {/* Other Tabs as Grid */}
          <div className="grid grid-cols-2 gap-2">
            {tabs.filter(tab => tab.id !== active).map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] transition-all duration-200 touch-manipulation"
              >
                {getBusinessNavIcon(tab.icon, 'w-6 h-6')}
                <span className="text-xs font-medium text-center leading-tight">
                  {tab.label.replace('CUSTOMER ', '').replace('MY ', '')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet Layout - Compact Horizontal */}
      <div className="hidden sm:block lg:hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  active === tab.id 
                    ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] hover:scale-102'
                }`}
              >
                {getBusinessNavIcon(tab.icon, 'w-5 h-5')}
                <span className="text-xs">
                  {tab.label.replace('CUSTOMER ', '').replace('MY ', '')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop & Large Screen Layout - Full Horizontal */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center space-x-3 px-4 xl:px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
                  active === tab.id 
                    ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-[#17B7C7]/10 hover:text-[#17B7C7] hover:scale-102 hover:shadow-sm'
                }`}
              >
                {getBusinessNavIcon(tab.icon, 'w-6 h-6')}
                <span className="text-sm xl:text-base">{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
