interface RecommendedService {
    name: string;
    status: string;
    icon: string;
    priority: string;
}

interface RecommendedServicesProps {
    recommendedServices: RecommendedService[];
}

export default function RecommendedServices({ recommendedServices }: RecommendedServicesProps) {
    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">Recommended for You</h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 text-center sm:text-left">Based on your moving timeline and location</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                            <span className="text-sm font-medium text-gray-700 text-center sm:text-left">Your Moving Services Progress</span>
                            <span className="text-sm font-medium text-[#17B7C7] text-center sm:text-right">2 of 5 services booked</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                            <div className="bg-[#17B7C7] h-full rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">We've identified services you may still need:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                            {recommendedServices.map((service, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                                    <span className="text-xl sm:text-2xl flex-shrink-0">{service.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 text-sm truncate">{service.name}</div>
                                        <div className={`text-xs ${
                                            service.status === 'completed' ? 'text-green-600' :
                                            service.status === 'recommended' ? 'text-orange-600' :
                                            'text-red-600'
                                        } truncate`}>
                                            {service.priority}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}