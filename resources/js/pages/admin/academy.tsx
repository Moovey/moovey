import { Head } from '@inertiajs/react';
import { Suspense, lazy } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

// Lazy load the academy manager for better performance
const OptimizedAcademyManager = lazy(() => import('@/components/admin/optimized-academy-manager'));

// Loading skeleton for the entire academy section
const AcademySkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-96 bg-gray-300 rounded"></div>
            </div>
            <div className="flex space-x-3">
                <div className="h-10 w-80 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-40 bg-gray-300 rounded-lg"></div>
            </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg mr-3"></div>
                        <div>
                            <div className="h-6 w-8 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 w-12 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Lessons skeleton */}
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="h-6 w-48 bg-gray-300 rounded"></div>
                                <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                                <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
                                <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="h-4 w-3/4 bg-gray-300 rounded mb-3"></div>
                            <div className="flex items-center space-x-4">
                                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                <div className="h-4 w-28 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                            <div className="h-6 w-12 bg-gray-300 rounded"></div>
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Draft' | 'Published' | 'Archived';
    content_file_path?: string;
    thumbnail_file_path?: string;
    content_file_url?: string;
    thumbnail_file_url?: string;
    created_at: string;
    updated_at: string;
}

interface InitialFilters {
    search: string;
    status: string;
    page: number;
}

interface AdminAcademyProps {
    auth: {
        user: {
            name: string;
            email: string;
            role: string;
        };
    };
    lessons?: Lesson[];
    initialFilters: InitialFilters;
}

export default function AdminAcademy({ auth, lessons = [], initialFilters }: AdminAcademyProps) {
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
                    
                    {/* Academy Manager with Suspense */}
                    <Suspense fallback={<AcademySkeleton />}>
                        <OptimizedAcademyManager />
                    </Suspense>

                </div>
            </div>
        </DashboardLayout>
    );
}