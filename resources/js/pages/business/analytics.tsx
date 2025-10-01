import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';

export default function BusinessAnalytics() {
  return (
    <DashboardLayout>
      <Head title="Business Analytics" />

      <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] text-white rounded-xl p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Business Analytics</h1>
            <p className="text-lg opacity-90">Track your performance</p>
          </div>
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">📈</div>
        </div>
      </div>

      <BusinessNavTabs active="analytics" />

      <div className="bg-white rounded-xl shadow-lg p-8 text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold mb-2">Analytics Dashboard Coming Soon!</h3>
        <p>Track your business performance and growth metrics here.</p>
      </div>
    </DashboardLayout>
  );
}
