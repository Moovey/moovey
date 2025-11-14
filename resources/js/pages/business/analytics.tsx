import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';

export default function BusinessAnalytics() {
  return (
    <DashboardLayout>
      <Head title="Business Analytics" />

      <BusinessHeader 
        title="Business Analytics"
        subtitle="Track your performance"
        showAvatar={true}
      />

      <BusinessNavTabs active="analytics" />

      <div className="bg-white rounded-xl shadow-lg p-8 text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold mb-2">Analytics Dashboard Coming Soon!</h3>
        <p>Track your business performance and growth metrics here.</p>
      </div>
    </DashboardLayout>
  );
}
