import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';

interface Customer {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface Lead {
  id: number;
  customer: Customer;
  status: string;
  conversation_id: number | null;
  contacted_at: string | null;
  created_at: string;
  notes: string | null;
}

interface LeadsProps {
  leads?: Lead[];
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Contacted' },
  quoted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Quoted' },
  converted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Converted' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
};

export default function BusinessLeads({ leads = [] }: LeadsProps) {
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
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">No Customer Leads Yet</h3>
            <p>When customers connect with you from the trade directory, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Received</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Contact</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const statusInfo = statusColors[lead.status] || statusColors.new;
                  return (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] flex items-center justify-center text-white font-semibold overflow-hidden">
                            {lead.customer.avatar ? (
                              <img src={lead.customer.avatar} alt={lead.customer.name} className="w-full h-full object-cover" />
                            ) : (
                              lead.customer.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{lead.customer.name}</div>
                            <div className="text-sm text-gray-500">{lead.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{lead.created_at}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {lead.contacted_at || 'Not contacted'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          {lead.conversation_id && (
                            <Link
                              href={`/messages/${lead.conversation_id}`}
                              className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors"
                            >
                              Message
                            </Link>
                          )}
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
