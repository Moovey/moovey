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
    // Professional SVG icon mapping function
    const getAdminIcon = (iconName: string, className: string = "w-6 h-6") => {
        const iconProps = {
            className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            strokeWidth: 2
        };

        const iconMap: Record<string, React.ReactElement> = {
            'users': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
            'businesses': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 9h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
            ),
            'housemovers': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0m-11.25-9.375h11.25C18.621 11.625 19.125 11.121 19.125 10.5V9.15c0-.201-.075-.402-.225-.563L12.375 2.062a.75.75 0 00-1.061 0L4.8 8.587c-.15.161-.225.362-.225.563v.939c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
            'rating': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            'registrations': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
                </svg>
            ),
            'system': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
            ),
            'business': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 9h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
                </svg>
            ),
            'housemover': (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0" />
                </svg>
            )
        };
        return iconMap[iconName] || null;
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        {[
                            { icon: "users", label: "Total Users", value: "1,247", change: "+15%", color: "bg-gradient-to-br from-[#00BCD4] to-[#17B7C7]" },
                            { icon: "businesses", label: "Businesses", value: "89", change: "+12%", color: "bg-gradient-to-br from-[#1A237E] to-[#00BCD4]" },
                            { icon: "housemovers", label: "House Movers", value: "1,158", change: "+18%", color: "bg-gradient-to-br from-green-400 to-green-600" },
                            { icon: "rating", label: "Avg Rating", value: "4.7", change: "+0.1", color: "bg-gradient-to-br from-yellow-400 to-yellow-600" }
                        ].map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 ${metric.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                        {getAdminIcon(metric.icon, "w-6 h-6 md:w-7 md:h-7")}
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{metric.change}</div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                                <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity & System Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Registrations */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-[#1A237E] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mr-3">
                                    {getAdminIcon('registrations', "w-4 h-4 text-white")}
                                </div>
                                Recent Registrations
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: "MoveMaster Ltd", type: "Business", location: "London", time: "1 hour ago" },
                                    { name: "Sarah Johnson", type: "Housemover", location: "Manchester", time: "3 hours ago" },
                                    { name: "Quick Pack Services", type: "Business", location: "Leeds", time: "5 hours ago" }
                                ].map((user, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#E0F7FA] to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${
                                                user.type === 'Business' 
                                                    ? 'bg-gradient-to-br from-[#1A237E] to-[#00BCD4]' 
                                                    : 'bg-gradient-to-br from-[#00BCD4] to-[#17B7C7]'
                                            }`}>
                                                {getAdminIcon(user.type === 'Business' ? 'business' : 'housemover', "w-6 h-6")}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-600 flex items-center">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                                        user.type === 'Business' ? 'bg-[#1A237E]' : 'bg-[#00BCD4]'
                                                    }`}></span>
                                                    {user.type} • {user.location}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">{user.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-[#1A237E] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mr-3">
                                    {getAdminIcon('system', "w-4 h-4 text-white")}
                                </div>
                                System Health
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { metric: "Server Uptime", value: "99.9%", status: "excellent" },
                                    { metric: "Response Time", value: "245ms", status: "good" },
                                    { metric: "Database", value: "Optimal", status: "excellent" },
                                    { metric: "Active Sessions", value: "342", status: "normal" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
                                        <div className="font-semibold text-gray-900">{item.metric}</div>
                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-[#1A237E]">{item.value}</span>
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-3 h-3 rounded-full shadow-sm ${
                                                    item.status === 'excellent' ? 'bg-green-500' :
                                                    item.status === 'good' ? 'bg-[#00BCD4]' :
                                                    'bg-yellow-500'
                                                }`}></div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    item.status === 'excellent' ? 'bg-green-50 text-green-700' :
                                                    item.status === 'good' ? 'bg-blue-50 text-[#00BCD4]' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
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