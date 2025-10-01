export default function DashboardPreview() {
    return (
        <section className="py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Laptop Mockup */}
                    <div className="relative">
                        {/* Laptop Base */}
                        <div className="bg-gray-300 rounded-b-3xl h-8 w-full max-w-lg mx-auto"></div>
                        
                        {/* Laptop Screen */}
                        <div className="bg-gray-800 rounded-t-2xl p-1 max-w-lg mx-auto -mb-8 relative z-10">
                            <div className="bg-white rounded-t-xl overflow-hidden">
                                {/* Browser Header */}
                                <div className="bg-gray-100 px-4 py-2 flex items-center space-x-2 border-b">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div className="flex-1 bg-white rounded mx-4 px-3 py-1 text-gray-600 text-xs border">
                                        moovey.com/dashboard
                                    </div>
                                </div>
                                
                                {/* Dashboard Content */}
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-white h-80">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900">Your Moving Dashboard</h3>
                                            <span className="bg-[#17B7C7] text-white text-xs font-medium px-2 py-1 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                        
                                        {/* Progress Section */}
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Moving Progress</span>
                                                <span className="text-gray-900 font-medium">68%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-[#17B7C7] h-2 rounded-full" style={{width: '68%'}}></div>
                                            </div>
                                        </div>
                                        
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                                                <div className="text-xl font-bold text-[#17B7C7]">28</div>
                                                <div className="text-xs text-gray-600">Completed</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                                                <div className="text-xl font-bold text-yellow-600">12</div>
                                                <div className="text-xs text-gray-600">In Progress</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                                                <div className="text-xl font-bold text-gray-600">15</div>
                                                <div className="text-xs text-gray-600">Days Left</div>
                                            </div>
                                        </div>
                                        
                                        {/* Task List */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Recent Tasks</h4>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-gray-700">Book moving company</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                                    <span className="text-gray-700">Pack bedroom items</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                    <span className="text-gray-500">Update address</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Personalise your move with an intuitive dashboard
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-700 mb-6">
                                Track your progress, every step of the way
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">
                            Our comprehensive dashboard gives you complete control over your moving process. 
                            Monitor progress, manage tasks, and stay organized throughout your entire journey.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700">Stay on top of moving goals and important deadlines</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700">Keep track of ongoing tasks and targets</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700">Find quick wins from the very first day</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700">Build confidence until you no longer need guidance</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                            >
                                Access My Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
