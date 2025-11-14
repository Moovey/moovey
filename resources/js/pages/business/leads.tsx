import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';

export default function BusinessLeads() {
  return (
    <DashboardLayout>
      <Head title="Business Leads" />

      <BusinessHeader 
        title="Customer Leads"
        subtitle="Manage your leads"
        showAvatar={true}
      />

      <BusinessNavTabs active="leads" />

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1A237E] flex items-center">
            <span className="text-3xl mr-3">👥</span>
            Customer Leads Management
          </h2>
          <div className="flex space-x-3">
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCD4] focus:ring-[#00BCD4]/20">
              <option>All Status</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Quoted</option>
              <option>Converted</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCD4] focus:ring-[#00BCD4]/20">
              <option>All Services</option>
              <option>House Move</option>
              <option>Packing</option>
              <option>Storage</option>
            </select>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Customer Leads Coming Soon!</h3>
          <p>Your customer lead management system is being prepared.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
