import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

interface AdminBusinessesProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function AdminBusinesses({ auth }: AdminBusinessesProps) {
    return (
        <DashboardLayout>
            <Head title="Admin Businesses - Business Management" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="businesses" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-red-600 flex items-center">
                                <span className="text-3xl mr-3">🏢</span>
                                Business Management
                            </h2>
                            <div className="flex space-x-3">
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500/20">
                                    <option>All Businesses</option>
                                    <option>Verified</option>
                                    <option>Pending</option>
                                    <option>Suspended</option>
                                </select>
                                <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                                    Approve Pending
                                </button>
                            </div>
                        </div>
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">🏢</div>
                            <h3 className="text-xl font-semibold mb-2">Business Management Coming Soon!</h3>
                            <p>Business verification and management tools are being prepared.</p>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}