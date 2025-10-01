import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';

export default function BusinessOverview() {
  return (
    <DashboardLayout>
      <Head title="Business Dashboard" />

      {/* Business Header */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] text-white rounded-xl p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-lg opacity-90">Your Business Overview</p>
          </div>
          <div className="text-6xl">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">🏢</div>
          </div>
        </div>
      </div>

      <BusinessNavTabs active="overview" />

      {/* Overview Content (moved from dashboard.tsx) */}
      <div className="bg-[#F5F5F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: '👥', label: 'New Leads', value: '23', change: '+12%', color: 'bg-[#00BCD4]' },
              { icon: '💰', label: 'Revenue', value: '£2,450', change: '+8%', color: 'bg-green-500' },
              { icon: '⭐', label: 'Rating', value: '4.8', change: '+0.2', color: 'bg-yellow-500' },
              { icon: '📞', label: 'Bookings', value: '15', change: '+5', color: 'bg-[#1A237E]' },
            ].map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {metric.icon}
                  </div>
                  <div className="text-sm font-medium text-green-600">{metric.change}</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-500">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Leads */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                <span className="text-2xl mr-2">👥</span>
                Recent Customer Leads
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Johnson', service: 'House Move', location: 'Manchester to Leeds', time: '2 hours ago', status: 'new' },
                  { name: 'Mike Chen', service: 'Packing Service', location: 'London', time: '5 hours ago', status: 'contacted' },
                  { name: 'Emma Wilson', service: 'Storage', location: 'Birmingham', time: '1 day ago', status: 'quoted' },
                ].map((lead, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg hover:bg-[#E0F7FA] transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-[#1A237E]">{lead.name}</div>
                      <div className="text-sm text-gray-600">
                        {lead.service} • {lead.location}
                      </div>
                      <div className="text-xs text-gray-500">{lead.time}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'new'
                          ? 'bg-red-100 text-red-700'
                          : lead.status === 'contacted'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {lead.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/business/leads"
                className="mt-4 w-full bg-[#1A237E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#303F9F] transition-colors flex items-center justify-center space-x-2"
              >
                <span>View All Leads</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '📝', label: 'Add Service', href: '/business/services/create', color: 'bg-[#00BCD4]' },
                  { icon: '💰', label: 'Update Prices', href: '/business/pricing', color: 'bg-green-500' },
                  { icon: '📊', label: 'View Reports', href: '/business/reports', color: 'bg-[#1A237E]' },
                  { icon: '⚙️', label: 'Settings', href: '/business/settings', color: 'bg-gray-500' },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-sm font-medium">{action.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
