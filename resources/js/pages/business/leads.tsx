import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';
import { toast } from 'react-toastify';

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

interface PaginatedLeads {
  data: Lead[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface LeadsProps {
  leads: PaginatedLeads;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Contacted' },
  quoted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Quoted' },
  converted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Converted' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
};

export default function BusinessLeads({ leads }: LeadsProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingLeadId, setUpdatingLeadId] = useState<number | null>(null);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    setUpdatingLeadId(leadId);
    
    try {
      const response = await fetch(`/business/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Lead status updated successfully');
      router.reload({ only: ['leads'] });
    } catch (error) {
      toast.error('Failed to update lead status');
      console.error('Error updating lead status:', error);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const filteredLeads = statusFilter === 'all' 
    ? leads.data 
    : leads.data.filter(lead => lead.status === statusFilter);

  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, { preserveState: true, preserveScroll: true });
    }
  };

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
            <svg className="w-8 h-8 mr-3 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Customer Leads Management
          </h2>
          <div className="flex space-x-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCD4] focus:ring-[#00BCD4]/20 text-gray-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">
              {statusFilter === 'all' ? 'No Customer Leads Yet' : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Leads`}
            </h3>
            <p>
              {statusFilter === 'all' 
                ? 'When customers connect with you from the trade directory, they will appear here.'
                : 'No leads match this status filter.'}
            </p>
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
                {filteredLeads.map((lead) => {
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
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={updatingLeadId === lead.id}
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} border-0 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
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

            {/* Pagination Controls */}
            {leads.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{leads.from || 0}</span> to{' '}
                  <span className="font-semibold">{leads.to || 0}</span> of{' '}
                  <span className="font-semibold">{leads.total}</span> leads
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(leads.current_page > 1 ? `/business/leads?page=${leads.current_page - 1}` : null)}
                    disabled={leads.current_page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: leads.last_page }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(`/business/leads?page=${page}`)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === leads.current_page
                            ? 'bg-[#17B7C7] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(leads.current_page < leads.last_page ? `/business/leads?page=${leads.current_page + 1}` : null)}
                    disabled={leads.current_page === leads.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
