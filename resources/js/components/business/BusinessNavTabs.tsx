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
    <div className="bg-white rounded-xl p-2 mb-8 shadow-lg">
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
              active === tab.id ? 'bg-[#1A237E] text-white shadow-sm' : 'text-gray-600 hover:bg-[#F5F5F5]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
