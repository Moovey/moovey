interface NetworkStatsSectionProps {
    totalConnections: number;
    savedProvidersCount: number;
    activeChats: number;
    pendingRequests: number;
}

export default function NetworkStatsSection({ 
    totalConnections, 
    savedProvidersCount, 
    activeChats, 
    pendingRequests 
}: NetworkStatsSectionProps) {
    return (
        <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Your Network
                </h4>
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#00BCD4]">{totalConnections}</div>
                        <p className="text-xs text-gray-600">Total Connections</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#1A237E]">{savedProvidersCount}</div>
                        <p className="text-xs text-gray-600">Saved Providers</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{activeChats}</div>
                        <p className="text-xs text-gray-600">Active Chats</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{pendingRequests}</div>
                        <p className="text-xs text-gray-600">Pending Requests</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
