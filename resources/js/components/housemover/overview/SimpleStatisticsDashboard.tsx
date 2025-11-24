export default function SimpleStatisticsDashboard() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[
                { icon: "trophy", label: "Total Points", value: "2150", color: "#00BCD4", bgColor: "bg-[#E0F7FA]" },
                { icon: "users", label: "Connections", value: "12", color: "#1A237E", bgColor: "bg-white" },
                { icon: "star", label: "Achievements", value: "3", color: "#00BCD4", bgColor: "bg-[#F5F5F5]" }
            ].map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                {stat.icon === 'trophy' && (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                )}
                                {stat.icon === 'users' && (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                )}
                                {stat.icon === 'star' && (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-xl font-bold text-[#1A237E] mb-1">{stat.value}</div>
                                <div className="text-xs font-medium text-gray-600">{stat.label.toUpperCase()}</div>
                            </div>
                        </div>
                        <div className="h-1.5 bg-[#00BCD4] rounded-full"></div>
                    </div>

                    {/* Tablet Layout */}
                    <div className="hidden sm:block lg:hidden">
                        <div className="text-center mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md mx-auto mb-2">
                                {stat.icon === 'trophy' && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                )}
                                {stat.icon === 'users' && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                )}
                                {stat.icon === 'star' && (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-[#1A237E] mb-1">{stat.value}</div>
                            <div className="text-xs font-medium text-gray-600">{stat.label.toUpperCase()}</div>
                        </div>
                        <div className="h-1.5 bg-[#00BCD4] rounded-full"></div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-2">
                                {stat.icon === 'trophy' && (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                )}
                                {stat.icon === 'users' && (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                )}
                                {stat.icon === 'star' && (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-[#1A237E] mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-gray-600">{stat.label.toUpperCase()}</div>
                        </div>
                        <div className="h-2 bg-[#00BCD4] rounded-full"></div>
                    </div>
                </div>
            ))}
        </section>
    );
}