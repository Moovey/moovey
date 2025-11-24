import React from 'react';

interface AdminHeaderProps {
    userName: string;
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A237E] to-[#00BCD4] text-white rounded-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm opacity-90">Welcome back,</p>
                    <p className="font-semibold text-base">{userName}</p>
                </div>
            </div>

            {/* Tablet & Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-4 lg:space-x-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                        <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 lg:mb-2">Admin Dashboard</h1>
                        <p className="text-base md:text-lg lg:text-xl opacity-90">Welcome back, <span className="font-semibold">{userName}</span></p>
                    </div>
                </div>
                
                {/* Professional Status Indicators */}
                <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">System Online</span>
                    </div>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                        <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16 hidden lg:block"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12 hidden lg:block"></div>
        </div>
    );
}