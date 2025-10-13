import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface Voucher {
    id: number;
    title: string;
    description: string;
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    category: string;
    provider: string;
    expiryDate: string;
    minSpend?: number;
    maxDiscount?: number;
    isUsed: boolean;
    isExpired: boolean;
}

interface Reward {
    id: number;
    title: string;
    description: string;
    points: number;
    category: string;
    isUnlocked: boolean;
    isRedeemed: boolean;
    icon: string;
    type: 'voucher' | 'service' | 'merchandise' | 'experience';
}

interface UserStats {
    totalPoints: number;
    pointsEarned: number;
    pointsRedeemed: number;
    vouchersUsed: number;
    savingsTotal: number;
}

interface VouchersRewardsProps {
    vouchers?: Voucher[];
    rewards?: Reward[];
    userStats?: UserStats;
    onVoucherRedeem?: (voucherId: number) => void;
    onRewardClaim?: (rewardId: number) => void;
}

export default function VouchersRewards({
    vouchers = [],
    rewards = [],
    userStats = {
        totalPoints: 0,
        pointsEarned: 0,
        pointsRedeemed: 0,
        vouchersUsed: 0,
        savingsTotal: 0
    },
    onVoucherRedeem,
    onRewardClaim
}: VouchersRewardsProps) {
    const [activeTab, setActiveTab] = useState<'vouchers' | 'rewards'>('vouchers');
    const [showVoucherCode, setShowVoucherCode] = useState<number | null>(null);

    const formatDiscount = (voucher: Voucher): string => {
        if (voucher.discountType === 'percentage') {
            return `${voucher.discount}% OFF`;
        } else {
            return `$${voucher.discount} OFF`;
        }
    };

    const formatExpiryDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Expires today';
        if (diffDays === 1) return 'Expires tomorrow';
        if (diffDays <= 7) return `Expires in ${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getVoucherStatusColor = (voucher: Voucher): string => {
        if (voucher.isUsed) return 'bg-gray-100 text-gray-600 border-gray-200';
        if (voucher.isExpired) return 'bg-red-100 text-red-600 border-red-200';
        
        const expiryDate = new Date(voucher.expiryDate);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) return 'bg-orange-100 text-orange-600 border-orange-200';
        if (diffDays <= 7) return 'bg-yellow-100 text-yellow-600 border-yellow-200';
        return 'bg-green-100 text-green-600 border-green-200';
    };

    const getCategoryIcon = (category: string): string => {
        const icons: Record<string, string> = {
            'moving': '🚛',
            'packing': '📦',
            'storage': '🏬',
            'utilities': '⚡',
            'insurance': '🛡️',
            'cleaning': '🧹',
            'food': '🍕',
            'shopping': '🛒',
            'transport': '🚗',
            'home': '🏠'
        };
        return icons[category.toLowerCase()] || '🎁';
    };

    const availableVouchers = vouchers.filter(v => !v.isUsed && !v.isExpired);
    const usedVouchers = vouchers.filter(v => v.isUsed);
    const expiredVouchers = vouchers.filter(v => v.isExpired && !v.isUsed);

    const availableRewards = rewards.filter(r => r.isUnlocked && !r.isRedeemed);
    const lockedRewards = rewards.filter(r => !r.isUnlocked);
    const redeemedRewards = rewards.filter(r => r.isRedeemed);

    return (
        <section className="bg-white rounded-xl shadow-lg p-6">
            {/* Vouchers & Rewards Section - Teal Container */}
            <div className="bg-[#E0F2F1] rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                        <span className="text-3xl mr-3">🎁</span>
                        Vouchers & Rewards
                    </h2>
                    <p className="text-lg font-medium text-gray-700">
                        Save money and earn rewards throughout your moving journey
                    </p>
                </div>

                {/* User Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="text-sm text-gray-600">Total Savings</div>
                        <div className="text-xl font-bold text-[#00695C]">
                            ${userStats.savingsTotal.toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                        <div className="text-xl font-bold text-[#1A237E]">
                            {userStats.totalPoints.toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">🎫</div>
                        <div className="text-sm text-gray-600">Vouchers Used</div>
                        <div className="text-xl font-bold text-[#00695C]">
                            {userStats.vouchersUsed}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">⭐</div>
                        <div className="text-sm text-gray-600">Points Earned</div>
                        <div className="text-xl font-bold text-[#1A237E]">
                            {userStats.pointsEarned.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-white rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('vouchers')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === 'vouchers'
                                ? 'bg-[#00695C] text-white shadow-sm'
                                : 'text-[#00695C] hover:bg-[#E0F2F1]'
                        }`}
                    >
                        🎫 Vouchers ({availableVouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                            activeTab === 'rewards'
                                ? 'bg-[#00695C] text-white shadow-sm'
                                : 'text-[#00695C] hover:bg-[#E0F2F1]'
                        }`}
                    >
                        🏆 Rewards ({availableRewards.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'vouchers' ? (
                    <div className="space-y-6">
                        {/* Available Vouchers */}
                        {availableVouchers.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                                    <span className="text-xl mr-2">✨</span>
                                    Available Vouchers
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableVouchers.map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className={`border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${getVoucherStatusColor(voucher)}`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">
                                                        {getCategoryIcon(voucher.category)}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-bold text-[#1A237E]">{voucher.title}</h4>
                                                        <p className="text-sm text-gray-600">{voucher.provider}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-[#00695C]">
                                                        {formatDiscount(voucher)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatExpiryDate(voucher.expiryDate)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-700 mb-4">{voucher.description}</p>
                                            
                                            {voucher.minSpend && (
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Min spend: ${voucher.minSpend}
                                                    {voucher.maxDiscount && ` • Max discount: $${voucher.maxDiscount}`}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="bg-white px-2 py-1 rounded text-xs font-medium text-[#00695C]">
                                                    {voucher.category}
                                                </span>
                                                
                                                {showVoucherCode === voucher.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm font-bold">
                                                            {voucher.code}
                                                        </code>
                                                        <button
                                                            onClick={() => setShowVoucherCode(null)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowVoucherCode(voucher.id)}
                                                        className="px-4 py-2 bg-[#00695C] text-white rounded-lg hover:bg-[#004D40] transition-all duration-200 font-semibold text-sm"
                                                    >
                                                        Show Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Used/Expired Vouchers */}
                        {(usedVouchers.length > 0 || expiredVouchers.length > 0) && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-600 mb-4 flex items-center">
                                    <span className="text-xl mr-2">📋</span>
                                    Used & Expired
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...usedVouchers, ...expiredVouchers].map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 opacity-75"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl opacity-50">
                                                        {getCategoryIcon(voucher.category)}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-bold text-gray-600 line-through">
                                                            {voucher.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{voucher.provider}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-500 line-through">
                                                        {formatDiscount(voucher)}
                                                    </div>
                                                    <div className="text-xs text-red-500">
                                                        {voucher.isUsed ? 'Used' : 'Expired'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {availableVouchers.length === 0 && usedVouchers.length === 0 && expiredVouchers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-8xl mb-4">🎫</div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Vouchers Yet</h3>
                                <p className="text-gray-500 mb-6">Complete tasks and engage with the community to earn vouchers</p>
                                <Link
                                    href="/rewards/earn"
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00695C] text-white rounded-lg hover:bg-[#004D40] transition-all duration-200 font-semibold"
                                >
                                    <span>Start Earning</span>
                                    <span>🚀</span>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Available Rewards */}
                        {availableRewards.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                                    <span className="text-xl mr-2">🏆</span>
                                    Available Rewards
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableRewards.map((reward) => (
                                        <div
                                            key={reward.id}
                                            className="bg-white border-2 border-[#00695C] rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="text-center mb-4">
                                                <div className="text-4xl mb-2">{reward.icon}</div>
                                                <h4 className="font-bold text-[#1A237E] mb-1">{reward.title}</h4>
                                                <p className="text-sm text-gray-600">{reward.description}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="bg-[#E0F2F1] text-[#00695C] px-2 py-1 rounded text-xs font-medium">
                                                    {reward.category}
                                                </span>
                                                <span className="text-[#1A237E] font-bold">
                                                    {reward.points} pts
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => onRewardClaim && onRewardClaim(reward.id)}
                                                disabled={userStats.totalPoints < reward.points}
                                                className={`w-full py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    userStats.totalPoints >= reward.points
                                                        ? 'bg-[#00695C] text-white hover:bg-[#004D40]'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {userStats.totalPoints >= reward.points ? 'Claim Reward' : 'Not Enough Points'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Locked Rewards */}
                        {lockedRewards.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-600 mb-4 flex items-center">
                                    <span className="text-xl mr-2">🔒</span>
                                    Locked Rewards
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lockedRewards.map((reward) => (
                                        <div
                                            key={reward.id}
                                            className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6 opacity-75"
                                        >
                                            <div className="text-center mb-4">
                                                <div className="text-4xl mb-2 opacity-50">{reward.icon}</div>
                                                <h4 className="font-bold text-gray-600 mb-1">{reward.title}</h4>
                                                <p className="text-sm text-gray-500">{reward.description}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                                    {reward.category}
                                                </span>
                                                <span className="text-gray-600 font-bold">
                                                    {reward.points} pts
                                                </span>
                                            </div>
                                            
                                            <div className="w-full py-2 rounded-lg font-semibold text-sm bg-gray-300 text-gray-500 text-center">
                                                🔒 Locked
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {availableRewards.length === 0 && lockedRewards.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-8xl mb-4">🏆</div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Rewards Available</h3>
                                <p className="text-gray-500 mb-6">Keep earning points to unlock amazing rewards</p>
                                <Link
                                    href="/rewards/catalog"
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold"
                                >
                                    <span>Browse Rewards</span>
                                    <span>👀</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/rewards/earn"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#00695C] text-white rounded-lg hover:bg-[#004D40] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">⭐</span>
                        <span>Earn More Points</span>
                    </Link>
                    
                    <Link
                        href="/vouchers/browse"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">🎫</span>
                        <span>Browse Vouchers</span>
                    </Link>
                    
                    <Link
                        href="/rewards/history"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">📊</span>
                        <span>View History</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}