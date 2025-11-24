import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';

interface AdminBusinessesProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

// Professional SVG icons for business management with Moovey branding
const getBusinessIcon = (iconName: string, className: string = "w-6 h-6") => {
  const icons = {
    'business': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'filter': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    'approve': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'construction': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    'chevron-down': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  };
  return icons[iconName as keyof typeof icons] || icons['business'];
};

export default function AdminBusinesses({ auth }: AdminBusinessesProps) {
    return (
        <DashboardLayout>
            <Head title="Admin Businesses - Business Management" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="businesses" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        {/* Header Section */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 sm:mb-6 gap-4">
                            <div className="flex-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E] flex items-center">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0">
                                        {getBusinessIcon('business', "w-4 h-4 sm:w-5 sm:h-5 text-white")}
                                    </div>
                                    <span className="truncate">Business Management</span>
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 mt-1 ml-10 sm:ml-13">
                                    Manage and verify business registrations
                                </p>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                                {/* Filter Dropdown */}
                                <div className="relative flex-1 sm:flex-none sm:w-48">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {getBusinessIcon('filter', "w-4 h-4 text-gray-400")}
                                    </div>
                                    <select className="w-full pl-9 pr-8 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/20 focus:outline-none transition-all shadow-sm hover:shadow-md appearance-none">
                                        <option>All Businesses</option>
                                        <option>Verified</option>
                                        <option>Pending</option>
                                        <option>Suspended</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {getBusinessIcon('chevron-down', "w-4 h-4 text-gray-400")}
                                    </div>
                                </div>
                                
                                {/* Approve Button */}
                                <button className="bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:from-[#00ACC1] hover:to-[#00BCD4] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                                    {getBusinessIcon('approve', "w-4 h-4")}
                                    <span className="hidden sm:inline">Approve Pending</span>
                                    <span className="sm:hidden">Approve</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Coming Soon Section */}
                        <div className="text-center py-12 sm:py-16 lg:py-20 text-gray-500 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                <div className="text-gray-400">
                                    {getBusinessIcon('construction', "w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16")}
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4 text-[#1A237E]">Business Management Coming Soon!</h3>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                                Advanced business verification and management tools are being carefully crafted to help you efficiently manage the Moovey business network.
                            </p>
                            
                            {/* Feature Preview Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto">
                                <div className="bg-gradient-to-br from-[#00BCD4]/10 to-[#17B7C7]/10 rounded-xl p-4 sm:p-6 border border-[#00BCD4]/20">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                                        {getBusinessIcon('business', "w-6 h-6 text-white")}
                                    </div>
                                    <h4 className="font-semibold text-[#1A237E] mb-2">Business Verification</h4>
                                    <p className="text-sm text-gray-600">Streamlined verification process for new business registrations</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-[#00BCD4]/10 to-[#17B7C7]/10 rounded-xl p-4 sm:p-6 border border-[#00BCD4]/20">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                                        {getBusinessIcon('approve', "w-6 h-6 text-white")}
                                    </div>
                                    <h4 className="font-semibold text-[#1A237E] mb-2">Approval Management</h4>
                                    <p className="text-sm text-gray-600">Efficient approval workflows with bulk actions</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-[#00BCD4]/10 to-[#17B7C7]/10 rounded-xl p-4 sm:p-6 border border-[#00BCD4]/20 sm:col-span-2 lg:col-span-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                                        {getBusinessIcon('filter', "w-6 h-6 text-white")}
                                    </div>
                                    <h4 className="font-semibold text-[#1A237E] mb-2">Advanced Filtering</h4>
                                    <p className="text-sm text-gray-600">Powerful search and filtering capabilities</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}