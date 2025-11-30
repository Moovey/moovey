interface RecommendedConnection {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    recommendationReason: string;
    matchScore: number;
}

interface RecommendedConnectionsSectionProps {
    recommendedConnections: RecommendedConnection[];
    onConnectRecommended: (connectionId: string) => void;
}

export default function RecommendedConnectionsSection({ 
    recommendedConnections, 
    onConnectRecommended 
}: RecommendedConnectionsSectionProps) {
    return (
        <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Recommended for You
                </h4>
                {recommendedConnections.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">No recommendations available at the moment</p>
                        <p className="text-xs text-gray-400 mt-1">Check back later for personalized suggestions</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recommendedConnections.slice(0, 3).map((connection) => (
                        <div key={connection.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-[#1A237E] text-sm">
                                            {connection.name.split(' - ')[0]}
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                            {connection.businessType} • {connection.location}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-xs">{connection.rating}</span>
                                            </div>
                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                                {connection.matchScore}% match
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onConnectRecommended(connection.id)}
                                    className="bg-[#00BCD4] text-white px-3 py-1 rounded text-xs hover:bg-[#00ACC1] transition-colors"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}
