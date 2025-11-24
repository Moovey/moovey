import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

// Professional SVG icons for System Settings
const getSystemIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        settings: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
        ),
        security: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0020.402 6 11.959 11.959 0 0112 2.753z" />
            </svg>
        ),
        email: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
        payment: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
        ),
        analytics: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        backup: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        ),
        api: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        )
    };
    
    return icons[name] || icons.settings;
};

interface AdminSystemProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function AdminSystem({ auth }: AdminSystemProps) {
    return (
        <DashboardLayout>
            <Head title="Admin System - System Settings" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="system" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-gradient-to-br from-white via-gray-50/30 to-[#17B7C7]/5 min-h-screen py-4 sm:py-6 md:py-8">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 space-y-4 sm:space-y-6">
                    
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A237E] mb-4 sm:mb-6 flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 md:mr-4 flex-shrink-0">
                                {getSystemIcon('settings', 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white')}
                            </div>
                            <span className="leading-tight">System Settings</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                            {[
                                { 
                                    icon: "security", 
                                    title: "Security Settings", 
                                    desc: "Manage security policies and access controls", 
                                    gradient: "from-red-500 to-red-600",
                                    hoverGradient: "hover:from-red-600 hover:to-red-700"
                                },
                                { 
                                    icon: "email", 
                                    title: "Email Settings", 
                                    desc: "Configure email templates and notifications", 
                                    gradient: "from-[#17B7C7] to-[#00BCD4]",
                                    hoverGradient: "hover:from-[#139AAA] hover:to-[#0097A7]"
                                },
                                { 
                                    icon: "payment", 
                                    title: "Payment Settings", 
                                    desc: "Manage payment methods and billing", 
                                    gradient: "from-green-500 to-green-600",
                                    hoverGradient: "hover:from-green-600 hover:to-green-700"
                                },
                                { 
                                    icon: "analytics", 
                                    title: "Analytics Config", 
                                    desc: "Set up tracking and performance metrics", 
                                    gradient: "from-purple-500 to-purple-600",
                                    hoverGradient: "hover:from-purple-600 hover:to-purple-700"
                                },
                                { 
                                    icon: "backup", 
                                    title: "Backup Settings", 
                                    desc: "Configure automated backup schedules", 
                                    gradient: "from-orange-500 to-orange-600",
                                    hoverGradient: "hover:from-orange-600 hover:to-orange-700"
                                },
                                { 
                                    icon: "api", 
                                    title: "API Settings", 
                                    desc: "Manage API access keys and endpoints", 
                                    gradient: "from-indigo-500 to-indigo-600",
                                    hoverGradient: "hover:from-indigo-600 hover:to-indigo-700"
                                }
                            ].map((setting, index) => (
                                <div 
                                    key={index} 
                                    className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group transform hover:scale-[1.02]"
                                >
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${setting.gradient} ${setting.hoverGradient} rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                                        {getSystemIcon(setting.icon, 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7')}
                                    </div>
                                    <h3 className="font-semibold text-[#1A237E] mb-2 text-sm sm:text-base md:text-lg group-hover:text-[#17B7C7] transition-colors duration-300">
                                        {setting.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                        {setting.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}