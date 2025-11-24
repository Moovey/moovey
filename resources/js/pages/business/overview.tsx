import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';

// Professional SVG icons for Business Overview
const getBusinessOverviewIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        leads: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
        revenue: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        ),
        rating: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        bookings: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        users: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
        lightning: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        document: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        chart: (
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
        arrow: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        )
    };
    
    return icons[name] || icons.chart;
};

export default function BusinessOverview() {
  return (
    <DashboardLayout>
      <Head title="Business Dashboard" />

      {/* Business Header */}
      <BusinessHeader 
        title="Welcome back"
        subtitle="Your Business Overview"
        showAvatar={true}
      />

      <BusinessNavTabs active="overview" />

      {/* Overview Content (moved from dashboard.tsx) */}
      <div className="bg-[#F5F5F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: 'leads', label: 'New Leads', value: '23', change: '+12%', color: 'bg-[#00BCD4]' },
              { icon: 'revenue', label: 'Revenue', value: '£2,450', change: '+8%', color: 'bg-green-500' },
              { icon: 'rating', label: 'Rating', value: '4.8', change: '+0.2', color: 'bg-yellow-500' },
              { icon: 'bookings', label: 'Bookings', value: '15', change: '+5', color: 'bg-[#1A237E]' },
            ].map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {getBusinessOverviewIcon(metric.icon, 'w-6 h-6')}
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
                <div className="w-8 h-8 bg-[#17B7C7] rounded-lg flex items-center justify-center mr-3">
                  {getBusinessOverviewIcon('users', 'w-5 h-5 text-white')}
                </div>
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
                className="mt-4 w-full bg-[#1A237E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#303F9F] transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>View All Leads</span>
                {getBusinessOverviewIcon('arrow', 'w-4 h-4')}
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                <div className="w-8 h-8 bg-[#17B7C7] rounded-lg flex items-center justify-center mr-3">
                  {getBusinessOverviewIcon('lightning', 'w-5 h-5 text-white')}
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'document', label: 'Add Service', href: '/business/services/create', color: 'bg-[#00BCD4]' },
                  { icon: 'revenue', label: 'Update Prices', href: '/business/pricing', color: 'bg-green-500' },
                  { icon: 'chart', label: 'View Reports', href: '/business/reports', color: 'bg-[#1A237E]' },
                  { icon: 'settings', label: 'Settings', href: '/business/settings', color: 'bg-gray-500' },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getBusinessOverviewIcon(action.icon, 'w-8 h-8')}
                    </div>
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
