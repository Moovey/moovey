import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function BusinessDashboard() {
  // Redirect old dashboard tabbed page to the new overview route
  useEffect(() => {
    router.visit('/business/dashboard', { replace: true });
  }, []);
  return (
    <DashboardLayout>
      <Head title="Business Dashboard" />
      <div className="p-8 text-center text-gray-600">Redirecting to overview…</div>
    </DashboardLayout>
  );
}
