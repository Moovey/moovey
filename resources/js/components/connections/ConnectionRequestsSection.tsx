interface ConnectionRequest {
    id: string;
    friendship_id: number;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    mutualConnections: number;
    requestMessage?: string;
}

interface ConnectionRequestsSectionProps {
    connectionRequests: ConnectionRequest[];
    onAcceptRequest: (requestId: string) => void;
    onDeclineRequest: (requestId: string) => void;
}

export default function ConnectionRequestsSection({ 
    connectionRequests, 
    onAcceptRequest, 
    onDeclineRequest 
}: ConnectionRequestsSectionProps) {
    return (
        <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    Connection Requests
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {connectionRequests.length}
                    </span>
                </h4>
                <div className="space-y-3">
                    {connectionRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-[#1A237E] text-sm truncate">
                                        {request.name.split(' - ')[0]}
                                    </h5>
                                    <p className="text-xs text-gray-600">{request.businessType}</p>
                                    <div className="flex items-center space-x-1 mt-1">
                                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        <span className="text-xs">{request.rating}</span>
                                        <span className="text-xs text-gray-500">({request.reviewCount})</span>
                                    </div>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => onAcceptRequest(request.id)}
                                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => onDeclineRequest(request.id)}
                                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
