import { memo } from 'react';

interface Stats {
  total_users: number;
  admins: number;
  housemovers: number;
  businesses: number;
  verified_users: number;
  recent_registrations: number;
}

interface UserStatsProps {
  stats: Stats;
}

// Professional SVG icons for admin stats
const getStatsIcon = (iconName: string, className: string = "w-5 h-5") => {
  const icons = {
    'users': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'admin': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'housemover': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    'business': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'verified': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'recent': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  return icons[iconName as keyof typeof icons] || icons['users'];
};

const UserStats = memo(({ stats }: UserStatsProps) => {
  const statItems = [
    {
      icon: 'users',
      value: stats.total_users,
      label: 'Total Users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'admin',
      value: stats.admins,
      label: 'Admins',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'housemover',
      value: stats.housemovers,
      label: 'Housemovers',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: 'business',
      value: stats.businesses,
      label: 'Businesses',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: 'verified',
      value: stats.verified_users,
      label: 'Verified',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: 'recent',
      value: stats.recent_registrations,
      label: 'Last 7 days',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {statItems.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1A237E] mt-1 sm:mt-2">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2`}>
              <div className="text-white">
                {getStatsIcon(stat.icon, "w-5 h-5 sm:w-6 sm:h-6")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

UserStats.displayName = 'UserStats';

export default UserStats;