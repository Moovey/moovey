export default function CommunitySection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Mobile App Mockup and House */}
                    <div className="relative">
                        <div className="flex items-center justify-center space-x-8">
                            {/* Mobile Phone Mockup */}
                            <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                                <div className="bg-white rounded-2xl overflow-hidden w-64">
                                    {/* Phone Header */}
                                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-center">
                                        <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                    
                                    {/* App Content */}
                                    <div className="bg-gradient-to-b from-blue-50 to-white p-4 h-96">
                                        <div className="space-y-3">
                                            {/* App Header */}
                                            <div className="text-center mb-4">
                                                <h4 className="font-bold text-gray-900">Community Chat</h4>
                                                <div className="flex justify-center space-x-1 mt-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">1,247 online</span>
                                                </div>
                                            </div>
                                            
                                            {/* Chat Messages */}
                                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">JS</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm">Jane S.</span>
                                                </div>
                                                <p className="text-xs text-gray-700">Just used the Moovey packing tips - saved me hours!</p>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">MK</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm">Mike K.</span>
                                                </div>
                                                <p className="text-xs text-gray-700">Great recommendation on the moving company!</p>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">AL</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-sm">Anna L.</span>
                                                </div>
                                                <p className="text-xs text-gray-700">Moving with pets guide was incredibly helpful!</p>
                                            </div>
                                            
                                            {/* Community Stats */}
                                            <div className="mt-4 bg-[#17B7C7] rounded-lg p-3 text-white text-center">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-lg font-bold">2.5K</div>
                                                        <div className="text-xs opacity-90">Members</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-bold">1.2K</div>
                                                        <div className="text-xs opacity-90">Active</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* House Illustration */}
                            <div className="hidden lg:block">
                                <div className="w-32 h-32 relative">
                                    {/* House Structure */}
                                    <div className="absolute bottom-0 w-24 h-20 bg-yellow-100 border-2 border-yellow-200 rounded-lg"></div>
                                    {/* Roof */}
                                    <div className="absolute bottom-16 left-2 w-0 h-0 border-l-12 border-r-12 border-b-12 border-l-transparent border-r-transparent border-b-red-400"></div>
                                    {/* Door */}
                                    <div className="absolute bottom-0 left-8 w-6 h-12 bg-brown-600 rounded-t-lg"></div>
                                    {/* Windows */}
                                    <div className="absolute bottom-8 left-2 w-4 h-4 bg-blue-200 border border-blue-300"></div>
                                    <div className="absolute bottom-8 right-2 w-4 h-4 bg-blue-200 border border-blue-300"></div>
                                    {/* Chimney */}
                                    <div className="absolute top-4 right-4 w-3 h-8 bg-gray-600"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Join the House Moving Community
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-700 mb-6">
                                Connect with other movers and service providers to make your move awesome
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-gray-600 leading-relaxed">
                                Our vibrant community brings together experienced movers, professional service providers, and helpful neighbors all working together to make your relocation seamless and stress-free.
                            </p>
                            
                            <p className="text-gray-600 leading-relaxed">
                                Whether you're looking for practical advice, emotional support, or professional recommendations, you'll find everything you need within our supportive network of house moving experts.
                            </p>
                            
                            <div className="space-y-3 pt-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                    <span className="text-gray-700">Finding trusted suppliers and service providers</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                    <span className="text-gray-700">Connecting with other movers in your area</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                    <span className="text-gray-700">Getting advice from those who've been there</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                    <span className="text-gray-700">Sharing experiences and learning from others</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                    <span className="text-gray-700">Join thousands of other house movers in our supportive community</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                            >
                                Join The Community
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
