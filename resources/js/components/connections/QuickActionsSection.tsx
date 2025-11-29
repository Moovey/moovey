import { Link } from '@inertiajs/react';

export default function QuickActionsSection() {
    return (
        <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                </h4>
                <div className="space-y-3">
                    <Link
                        href="/trade-directory"
                        className="w-full bg-[#00BCD4] text-white p-3 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors text-center flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find Providers
                    </Link>
                    <Link
                        href="/community"
                        className="w-full bg-[#1A237E] text-white p-3 rounded-lg text-sm font-medium hover:bg-[#303F9F] transition-colors text-center flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Join Community
                    </Link>
                    <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Referral
                    </button>
                </div>
            </div>
        </div>
    );
}
