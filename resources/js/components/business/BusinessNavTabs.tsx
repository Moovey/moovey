import { Link, usePage } from '@inertiajs/react';

interface Tab {
  id: 'overview' | 'leads' | 'services' | 'analytics' | 'settings';
  icon: string;
  label: string;
  href: string;
}

const tabs: Tab[] = [
  { id: 'overview', icon: '📊', label: 'OVERVIEW', href: '/business/dashboard' },
  { id: 'leads', icon: '👥', label: 'CUSTOMER LEADS', href: '/business/leads' },
  { id: 'services', icon: '🛠️', label: 'MY SERVICES', href: '/business/services' },
  { id: 'analytics', icon: '📈', label: 'ANALYTICS', href: '/business/analytics' },
  { id: 'settings', icon: '⚙️', label: 'SETTINGS', href: '/business/profile' },
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
              <span className="text-white text-xs">🏢</span>
            </div>
          </div>
          
          {/* Current Active Tab Display */}
          <div className="mb-3 p-2 bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{tabs.find(tab => tab.id === active)?.icon}</span>
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
                <span className="text-xl">{tab.icon}</span>
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
                <span className="text-lg">{tab.icon}</span>
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
                <span className="text-xl">{tab.icon}</span>
                <span className="text-sm xl:text-base">{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
