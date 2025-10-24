import { useEffect } from 'react';
import { router } from '@inertiajs/react';

interface AdminDashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function AdminDashboard({ auth }: AdminDashboardProps) {
    // Immediately redirect to overview page
    useEffect(() => {
        router.visit(route('admin.overview'));
    }, []);

    // Return a simple loading state while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">Redirecting to admin overview...</p>
            </div>
        </div>
    );
}