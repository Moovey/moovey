export default function FeaturedLessons() {
    return (
        <section className="py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                        Featured Lessons
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Explore our most popular moving guides and tutorials.
                    </p>
                    
                    {/* Your Learning Progress */}
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-auto mb-12 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Progress</h3>
                        
                        {/* Progress Circle */}
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                                {/* Background circle */}
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#17B7C7"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray="351.86"
                                    strokeDashoffset="348.46"
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">3</div>
                                    <div className="text-sm text-gray-600">of 372</div>
                                </div>
                            </div>
                        </div>
                        
                        <button className="w-full bg-[#17B7C7] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl">
                            Continue
                        </button>
                    </div>
                </div>

                {/* Lessons Grid - 2 rows, 3 columns */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Top Row */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3c0-.265.105-.52.293-.707L10.586 9.293a6 6 0 115.657 5.657z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">First-Time Buyer's Guide</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">Essential tips and advice for purchasing your first home successfully.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Packing 101</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">Master the art of efficient packing for best value and protection.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Moving Day Survival</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">Everything you need to know to survive the big day and stay organised.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>

                    {/* Bottom Row */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">New Home Setup</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">How to get settled, from utilities to finding local services.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Moving with Pets</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">Tips to help your furry friends move house comfortably.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Downsizing Tips</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">Strategic approaches to make decluttering and moving easier.</p>
                        <a href="#" className="text-[#17B7C7] font-semibold hover:text-[#139AAA] transition-colors">Start Guide →</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
