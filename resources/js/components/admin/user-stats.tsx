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

const UserStats = memo(({ stats }: UserStatsProps) => {
  const statItems = [
    {
      icon: '👥',
      value: stats.total_users,
      label: 'Total Users',
      color: 'bg-blue-500'
    },
    {
      icon: '👑',
      value: stats.admins,
      label: 'Admins',
      color: 'bg-red-500'
    },
    {
      icon: '🏠',
      value: stats.housemovers,
      label: 'Housemovers',
      color: 'bg-green-500'
    },
    {
      icon: '🏢',
      value: stats.businesses,
      label: 'Businesses',
      color: 'bg-indigo-500'
    },
    {
      icon: '✓',
      value: stats.verified_users,
      label: 'Verified',
      color: 'bg-green-600'
    },
    {
      icon: '📅',
      value: stats.recent_registrations,
      label: 'Last 7 days',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg mr-3`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

UserStats.displayName = 'UserStats';

export default UserStats;