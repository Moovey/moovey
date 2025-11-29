interface BusinessConnection {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    rating: number;
}

interface BusinessConnectionsGridProps {
    businessConnections: BusinessConnection[];
    onChatRequest: (connectionId: string) => void;
}

export default function BusinessConnectionsGrid({ 
    businessConnections, 
    onChatRequest 
}: BusinessConnectionsGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {businessConnections.map((connection) => (
                <div 
                    key={connection.id} 
                    className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#E0F7FA] hover:border-[#00BCD4] transition-colors"
                >
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h5 className="font-semibold text-[#1A237E] text-sm mb-1">
                            {connection.name.split(' - ')[0]}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">{connection.businessType}</p>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-xs">{connection.rating}</span>
                        </div>
                        <button
                            onClick={() => onChatRequest(connection.id)}
                            className="w-full bg-[#00BCD4] text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-[#00ACC1] transition-colors"
                        >
                            Chat
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
