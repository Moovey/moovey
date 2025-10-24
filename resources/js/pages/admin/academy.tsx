import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import AcademyManager from '@/components/admin/academy-manager';

interface AdminAcademyProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
  lessons?: any[];
}

export default function AdminAcademy({ auth, lessons = [] }: AdminAcademyProps) {
    return (
        <DashboardLayout>
            <Head title="Admin Academy - Lesson Management" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="academy" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <AcademyManager />

                </div>
            </div>
        </DashboardLayout>
    );
}