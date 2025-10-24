import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

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
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
                            <span className="text-3xl mr-3">⚙️</span>
                            System Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: "🛡️", title: "Security Settings", desc: "Manage security policies", color: "bg-red-500" },
                                { icon: "📧", title: "Email Settings", desc: "Configure email templates", color: "bg-blue-500" },
                                { icon: "💰", title: "Payment Settings", desc: "Manage payment methods", color: "bg-green-500" },
                                { icon: "📊", title: "Analytics Config", desc: "Set up tracking", color: "bg-purple-500" },
                                { icon: "🔄", title: "Backup Settings", desc: "Configure backups", color: "bg-orange-500" },
                                { icon: "🌐", title: "API Settings", desc: "Manage API access", color: "bg-indigo-500" }
                            ].map((setting, index) => (
                                <div key={index} className="bg-[#F5F5F5] rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className={`w-12 h-12 ${setting.color} rounded-xl flex items-center justify-center text-white text-xl mb-4`}>
                                        {setting.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{setting.title}</h3>
                                    <p className="text-sm text-gray-600">{setting.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}