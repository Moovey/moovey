export default function SimpleVouchersRewards() {
    return (
        <section className="bg-white rounded-xl shadow-lg p-8">
            {/* Coins & Voucher Rewards Section */}
            <div className="mb-10">
                <div className="bg-[#00BCD4] rounded-xl p-6 text-white shadow-lg">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        {/* Left Side - Current Coins */}
                        <div className="mb-6 lg:mb-0">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-3">
                                    <span className="text-3xl">🪙</span>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80 mb-1">Coins Earned</div>
                                    <div className="text-4xl font-bold">2,459</div>
                                    <div className="text-sm opacity-90">Keep earning to unlock vouchers!</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side - Next Voucher Progress */}
                        <div className="w-full lg:w-auto lg:min-w-80">
                            <div className="bg-white rounded-xl p-4">
                                <div className="text-sm font-medium mb-2 text-gray-800">Next Voucher Progress</div>
                                <div className="text-lg font-bold mb-3 text-[#1A237E]">
                                    41 more coins for £25 Moving Services Discount
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="bg-[#F5F5F5] rounded-full h-3 mb-3 overflow-hidden">
                                    <div 
                                        className="bg-[#00BCD4] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                                        style={{ width: '98.4%' }}
                                    ></div>
                                </div>
                                
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">98.4% complete</span>
                                    <span className="font-medium text-[#00BCD4]">Gold Tier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Available Vouchers */}
                    <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Available Vouchers</h3>
                            <button className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg transition-colors">
                                View All
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Bronze Voucher */}
                            <div className="bg-white rounded-lg p-4 text-gray-900">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                        <span className="font-medium">Bronze</span>
                                    </div>
                                    <span className="text-xs text-gray-500">500 coins</span>
                                </div>
                                <div className="text-lg font-bold text-amber-600 mb-2">£5 Discount</div>
                                <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                    Redeem Now
                                </button>
                            </div>
                            
                            {/* Silver Voucher */}
                            <div className="bg-white rounded-lg p-4 text-gray-900">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                        <span className="font-medium">Silver</span>
                                    </div>
                                    <span className="text-xs text-gray-500">1000 coins</span>
                                </div>
                                <div className="text-lg font-bold text-gray-600 mb-2">£10 Discount</div>
                                <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors">
                                    Redeem Now
                                </button>
                            </div>
                            
                            {/* Next Tier Preview */}
                            <div className="bg-[#F5F5F5] rounded-lg p-4 text-gray-900 border-2 border-dashed border-gray-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
                                        <span className="font-medium text-gray-600">Gold</span>
                                    </div>
                                    <span className="text-xs text-gray-500">2500 coins</span>
                                </div>
                                <div className="text-lg font-bold text-gray-500 mb-2">£25 Discount</div>
                                <div className="w-full bg-[#F5F5F5] text-gray-600 py-2 px-4 rounded-lg text-sm font-medium text-center">
                                    41 more coins
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Earn Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                +10 Daily Login
                            </button>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                +25 Achievement
                            </button>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                +50 Profile Complete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}