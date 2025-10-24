import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

interface AdminOverviewProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function AdminOverview({ auth }: AdminOverviewProps) {
    return (
        <DashboardLayout>
            <Head title="Admin Overview - Dashboard" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="overview" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* System Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { icon: "👥", label: "Total Users", value: "1,247", change: "+15%", color: "bg-[#00BCD4]" },
                            { icon: "🏢", label: "Businesses", value: "89", change: "+12%", color: "bg-[#1A237E]" },
                            { icon: "🏠", label: "House Movers", value: "1,158", change: "+18%", color: "bg-green-500" },
                            { icon: "⭐", label: "Avg Rating", value: "4.7", change: "+0.1", color: "bg-yellow-500" }
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

                    {/* Recent Activity & System Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Registrations */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                <span className="text-2xl mr-2">📝</span>
                                Recent Registrations
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: "MoveMaster Ltd", type: "Business", location: "London", time: "1 hour ago" },
                                    { name: "Sarah Johnson", type: "Housemover", location: "Manchester", time: "3 hours ago" },
                                    { name: "Quick Pack Services", type: "Business", location: "Leeds", time: "5 hours ago" }
                                ].map((user, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                                user.type === 'Business' ? 'bg-[#1A237E]' : 'bg-[#00BCD4]'
                                            }`}>
                                                {user.type === 'Business' ? '🏢' : '🏠'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-600">{user.type} • {user.location}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">{user.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                <span className="text-2xl mr-2">🔧</span>
                                System Health
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { metric: "Server Uptime", value: "99.9%", status: "excellent" },
                                    { metric: "Response Time", value: "245ms", status: "good" },
                                    { metric: "Database", value: "Optimal", status: "excellent" },
                                    { metric: "Active Sessions", value: "342", status: "normal" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                                        <div className="font-medium text-gray-900">{item.metric}</div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold">{item.value}</span>
                                            <div className={`w-3 h-3 rounded-full ${
                                                item.status === 'excellent' ? 'bg-green-500' :
                                                item.status === 'good' ? 'bg-blue-500' :
                                                'bg-yellow-500'
                                            }`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}