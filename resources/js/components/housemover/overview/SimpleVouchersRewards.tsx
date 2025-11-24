export default function SimpleVouchersRewards() {
    return (
        <section className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Coins & Voucher Rewards Section - Responsive */}
            <div className="mb-6 sm:mb-8 lg:mb-10">
                <div className="bg-[#00BCD4] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-lg">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        {/* Left Side - Current Coins - Responsive */}
                        <div className="mb-4 sm:mb-6 lg:mb-0">
                            {/* Mobile Layout */}
                            <div className="block sm:hidden text-center">
                                <div className="bg-white bg-opacity-20 rounded-full p-2 inline-block mb-3">
                                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.89-.01-2.2-1.9-2.96-3.65-3.3z"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs text-black opacity-80 mb-1">Coins Earned</div>
                                    <div className="text-2xl font-bold text-black">2,459</div>
                                    <div className="text-xs text-black opacity-90">Keep earning to unlock vouchers!</div>
                                </div>
                            </div>
                            
                            {/* Desktop Layout */}
                            <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.89-.01-2.2-1.9-2.96-3.65-3.3z"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-black opacity-80 mb-1">Coins Earned</div>
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">2,459</div>
                                    <div className="text-xs sm:text-sm text-black opacity-90">Keep earning to unlock vouchers!</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side - Next Voucher Progress - Responsive */}
                        <div className="w-full lg:w-auto lg:min-w-80">
                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="text-xs sm:text-sm font-medium mb-2 text-gray-800">Next Voucher Progress</div>
                                
                                {/* Mobile Title */}
                                <div className="block sm:hidden text-base font-bold mb-3 text-[#1A237E]">
                                    41 more coins for £25 Discount
                                </div>
                                
                                {/* Desktop Title */}
                                <div className="hidden sm:block text-sm sm:text-base lg:text-lg font-bold mb-3 text-[#1A237E]">
                                    41 more coins for £25 Moving Services Discount
                                </div>
                                
                                {/* Progress Bar - Responsive */}
                                <div className="bg-[#F5F5F5] rounded-full h-2 sm:h-3 mb-3 overflow-hidden">
                                    <div 
                                        className="bg-[#00BCD4] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                                        style={{ width: '98.4%' }}
                                    ></div>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-gray-700">98.4% complete</span>
                                    <span className="font-medium text-[#00BCD4]">Gold Tier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Available Vouchers - Responsive */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white border-opacity-20">
                        {/* Mobile Header */}
                        <div className="block sm:hidden text-center mb-4">
                            <h3 className="text-base font-semibold mb-2 text-black">Available Vouchers</h3>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium">
                                View All
                            </button>
                        </div>
                        
                        {/* Desktop Header */}
                        <div className="hidden sm:flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-black">Available Vouchers</h3>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 sm:py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium">
                                View All
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Bronze Voucher - Responsive */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-600"></div>
                                        <span className="font-medium text-sm sm:text-base">Bronze</span>
                                    </div>
                                    <span className="text-xs text-gray-500">500 coins</span>
                                </div>
                                <div className="text-base sm:text-lg font-bold text-amber-600 mb-2 sm:mb-3">£5 Discount</div>
                                <button className="w-full bg-[#00BCD4] text-white py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                    Redeem Now
                                </button>
                            </div>
                            
                            {/* Silver Voucher - Responsive */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-400"></div>
                                        <span className="font-medium text-sm sm:text-base">Silver</span>
                                    </div>
                                    <span className="text-xs text-gray-500">1000 coins</span>
                                </div>
                                <div className="text-base sm:text-lg font-bold text-gray-600 mb-2 sm:mb-3">£10 Discount</div>
                                <button className="w-full bg-[#00BCD4] text-white py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                    Redeem Now
                                </button>
                            </div>
                            
                            {/* Next Tier Preview - Responsive */}
                            <div className="bg-[#F5F5F5] rounded-lg p-3 sm:p-4 text-gray-900 border-2 border-dashed border-gray-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 opacity-50"></div>
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">Gold</span>
                                    </div>
                                    <span className="text-xs text-gray-500">2500 coins</span>
                                </div>
                                <div className="text-base sm:text-lg font-bold text-gray-500 mb-2 sm:mb-3">£25 Discount</div>
                                <div className="w-full bg-[#F5F5F5] text-gray-600 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium text-center">
                                    41 more coins
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Earn Actions - Responsive */}
                        <div className="mt-3 sm:mt-4">
                            {/* Mobile Layout - Stacked */}
                            <div className="block sm:hidden space-y-2">
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span>+10 Daily Login</span>
                                </button>
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span>+25 Achievement</span>
                                </button>
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>+50 Profile Complete</span>
                                </button>
                            </div>
                            
                            {/* Desktop Layout - Inline */}
                            <div className="hidden sm:flex flex-wrap gap-2">
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span>+10 Daily Login</span>
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span>+25 Achievement</span>
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>+50 Profile Complete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}