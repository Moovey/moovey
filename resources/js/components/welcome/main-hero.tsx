export default function MainHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0]"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#0cc0df]/10 to-[#0aa5c0]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#f4c542]/10 to-[#0cc0df]/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Column - Main Content */}
                <div className="text-center lg:text-left space-y-8">
                    <div className="space-y-6">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            AI-Powered Moving Plan,
                            <br />
                            <span className="italic text-[#0cc0df] font-light">Tuned for Success</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            From planning to moving, you'll be able to do it all in minutes.
                        </p>
                    </div>
                </div>

                {/* Right Column - Floating Cards */}
                <div className="relative">
                    {/* Main Planning Card */}
                    <div className="relative z-20 bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-[#0cc0df]/10 border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Give your house a start from</h3>
                        </div>
                        <div className="text-4xl font-bold text-[#f4c542] mb-4">MOOVEY</div>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Current Moving Strategy</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-[#0cc0df]/10 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">📋</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Checklist Intent</div>
                                        <select className="text-sm text-gray-600 border-none bg-transparent">
                                            <option>Comprehensive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-[#f4c542]/10 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">📅</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Timeline</div>
                                        <select className="text-sm text-gray-600 border-none bg-transparent">
                                            <option>Professional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">Moving Timeline</span>
                            <div className="flex space-x-2">
                                <div className="w-8 h-8 bg-[#0cc0df] rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">📍</span>
                                </div>
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">🚚</span>
                                </div>
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">📦</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900 font-semibold">32 <span className="text-sm text-gray-500">/ 100</span></span>
                        </div>
                        <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2">
                            <span>⚡</span>
                            <span>Generate Plan</span>
                        </button>
                    </div>

                    {/* Stats Card - Top Right */}
                    <div className="absolute -top-8 -right-4 z-30 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">The top 1% of</div>
                            <div className="text-lg font-bold text-gray-900 mb-2">movers complete</div>
                            <div className="text-3xl font-bold text-white bg-gradient-to-r from-[#0cc0df] to-[#f4c542] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                                11x
                            </div>
                            <div className="text-xs text-gray-600">11x more tasks on time<br />in 60 days with moovey ai.</div>
                        </div>
                    </div>

                    {/* Team Card - Bottom Right */}
                    <div className="absolute -bottom-12 -right-8 z-30 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div>
                            <div className="flex -space-x-2 mb-4">
                                <div className="w-8 h-8 bg-[#0cc0df] rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">👤</span>
                                </div>
                                <div className="w-8 h-8 bg-[#f4c542] rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">👤</span>
                                </div>
                                <div className="w-8 h-8 bg-[#0aa5c0] rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">👤</span>
                                </div>
                                <div className="w-8 h-8 bg-pink-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">👤</span>
                                </div>
                                <div className="w-8 h-8 bg-purple-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">👥</span>
                                </div>
                            </div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Supercharge Your Team's</div>
                            <div className="text-sm font-semibold text-gray-900 mb-3">Moving with Moovey Enterprise</div>
                            <div className="text-xs text-gray-600 mb-4">Invite your team and start high-performing<br />moves faster, together.</div>
                            <div className="flex items-center space-x-2">
                                <input type="email" placeholder="Email" className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0cc0df]" />
                                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Style Preference Card - Left */}
                    <div className="absolute top-20 -left-16 z-20 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 transform -rotate-6 hover:-rotate-3 transition-transform duration-500">
                        <div className="text-center">
                            <div className="text-xs text-gray-600 mb-2">Where Organization</div>
                            <div className="text-xs font-semibold text-gray-900 mb-3">Meets Moving Style</div>
                            <div className="flex justify-center space-x-2 mb-2">
                                <div className="w-8 h-8 bg-[#f4c542] rounded-full"></div>
                                <div className="w-8 h-8 bg-[#f4c542] rounded-full"></div>
                                <div className="w-8 h-8 bg-[#f4c542] rounded-full"></div>
                            </div>
                            <div className="text-xs text-gray-600">Plan into Style</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
