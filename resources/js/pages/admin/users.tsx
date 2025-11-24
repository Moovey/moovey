import { Head } from '@inertiajs/react';
import { Suspense, lazy } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import OptimizedUserManager from '@/components/admin/optimized-user-manager';

// For performance, we can still use Suspense even with direct import

// Loading skeleton for the entire user management section
const UserManagementSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex-1">
                <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 sm:h-4 w-64 sm:w-96 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="h-10 w-full sm:w-64 lg:w-80 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-full sm:w-24 lg:w-32 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-full sm:w-32 lg:w-40 bg-gray-300 rounded-lg"></div>
            </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg mr-2 sm:mr-3 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            <div className="h-5 sm:h-6 w-6 sm:w-8 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 w-10 sm:w-12 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Users table skeleton */}
        <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <div className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 sm:h-4 w-40 sm:w-64 bg-gray-300 rounded mb-2 sm:mb-1"></div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-300 rounded"></div>
                                    <div className="h-3 sm:h-4 w-18 sm:w-24 bg-gray-300 rounded"></div>
                                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row sm:flex-col lg:flex-row gap-2 sm:ml-4">
                            <div className="h-6 w-12 sm:w-16 bg-gray-300 rounded flex-1 sm:flex-none"></div>
                            <div className="h-6 w-10 sm:w-12 bg-gray-300 rounded flex-1 sm:flex-none"></div>
                            <div className="h-6 w-12 sm:w-16 bg-gray-300 rounded flex-1 sm:flex-none"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'housemover' | 'business';
    avatar?: string;
    avatar_url?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    sent_messages_count?: number;
    friends_count?: number;
    completed_lessons_count?: number;
    profile?: {
        id: number;
        post_count: number;
        friend_count: number;
    };
}

interface Stats {
    total_users: number;
    admins: number;
    housemovers: number;
    businesses: number;
    verified_users: number;
    recent_registrations: number;
}

interface InitialFilters {
    search: string;
    role: string;
    sort: string;
    order: string;
    page: number;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url?: string;
    next_page_url?: string;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface AdminUsersProps {
    auth: {
        user: {
            name: string;
            email: string;
            role: string;
        };
    };
    users?: PaginatedUsers;
    stats?: Stats;
    initialFilters: InitialFilters;
}

export default function AdminUsers({ auth, users, stats, initialFilters }: AdminUsersProps) {

    return (
        <DashboardLayout>
            <Head title="Admin Users - User Management" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="users" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6">
                    
                    {/* User Manager */}
                    <OptimizedUserManager 
                        users={users || { data: [], current_page: 1, last_page: 1, per_page: 5, total: 0, from: 0, to: 0, links: [] }}
                        stats={stats}
                        initialFilters={initialFilters}
                    />

                </div>
            </div>
        </DashboardLayout>
    );
}