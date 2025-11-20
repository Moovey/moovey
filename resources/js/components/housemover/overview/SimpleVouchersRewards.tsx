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
                                    <span className="text-2xl">🪙</span>
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
                                    <span className="text-2xl sm:text-3xl lg:text-4xl">🪙</span>
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
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium">
                                    🎯 +10 Daily Login
                                </button>
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium">
                                    🏆 +25 Achievement
                                </button>
                                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs font-medium">
                                    ✅ +50 Profile Complete
                                </button>
                            </div>
                            
                            {/* Desktop Layout - Inline */}
                            <div className="hidden sm:flex flex-wrap gap-2">
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium">
                                    +10 Daily Login
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium">
                                    +25 Achievement
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors text-black text-xs sm:text-sm font-medium">
                                    +50 Profile Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}