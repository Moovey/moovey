import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface CommunityStats {
    activeMembers: number;
    postsToday: number;
    itemsListed: number;
}

interface CommunitySidebarProps {
    userStats?: {
        postCount?: number;
        friendCount?: number;
        memberSince?: number;
    };
    communityStats?: CommunityStats;
    showCommunityLink?: boolean;
}

export default function CommunitySidebar({ 
    userStats,
    communityStats,
    showCommunityLink = false 
}: CommunitySidebarProps) {
    const [loadedStats, setLoadedStats] = useState<CommunityStats | null>(communityStats ?? null);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch community stats if not provided and not in user stats mode
    useEffect(() => {
        if (!userStats && !communityStats && !loadedStats && !loading) {
            setLoading(true);
            fetch('/api/community/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (data?.success && data?.stats) {
                        setLoadedStats(data.stats as CommunityStats);
                    }
                })
                .catch(() => {
                    // leave as null; UI will show placeholders
                })
                .finally(() => setLoading(false));
        }
    }, [userStats, communityStats, loadedStats, loading]);

    const statsToShow = loadedStats ?? communityStats ?? null;

    return (
        <>
            {/* Mobile sidebar - shown as horizontal cards on mobile/tablet */}
            <div className="lg:hidden mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-100">
                            <img 
                                src="/images/marketplace_logo.webp" 
                                alt="Marketplace" 
                                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                                onError={(e) => {
                                    // Fallback if WebP doesn't exist, try other formats
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('.webp')) {
                                        target.src = '/images/marketplace_logo.png';
                                    } else if (target.src.includes('.png')) {
                                        target.src = '/images/marketplace_logo.jpg';
                                    } else if (target.src.includes('.jpg')) {
                                        target.src = '/images/marketplace_logo.svg';
                                    } else {
                                        target.style.display = 'none';
                                    }
                                }}
                            />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Marketplace</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Find great deals</p>
                        <Link
                            href="/marketplace"
                            className="w-full bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white px-3 py-2 text-xs sm:text-sm rounded-lg font-medium hover:from-[#00ACC1] hover:to-[#139AAA] transition-all duration-200 transform hover:scale-105 shadow-md inline-block text-center"
                        >
                            Browse
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                        {userStats ? 'Profile Stats' : 'Community Stats'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="text-center">
                            <div className="font-semibold text-[#17B7C7] text-sm sm:text-base">
                                {userStats ? (userStats.postCount || 0) : (statsToShow?.activeMembers ?? (loading ? '...' : '—'))}
                            </div>
                            <div className="text-xs text-gray-600">
                                {userStats ? 'Posts' : 'Active Members'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-[#17B7C7] text-sm sm:text-base">
                                {userStats ? (userStats.friendCount || 0) : (statsToShow?.postsToday ?? (loading ? '...' : '—'))}
                            </div>
                            <div className="text-xs text-gray-600">
                                {userStats ? 'Friends' : 'Posts Today'}
                            </div>
                        </div>
                        {!userStats && (
                            <div className="text-center col-span-2">
                                <div className="font-semibold text-[#17B7C7] text-sm sm:text-base">
                                    {statsToShow?.itemsListed ?? (loading ? '...' : '—')}
                                </div>
                                <div className="text-xs text-gray-600">Items Listed</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Left Sidebar - Desktop only */}
            <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-100">
                            <img 
                                src="/images/marketplace_logo.webp" 
                                alt="Marketplace" 
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                    // Fallback if WebP doesn't exist, try other formats
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('.webp')) {
                                        target.src = '/images/marketplace_logo.png';
                                    } else if (target.src.includes('.png')) {
                                        target.src = '/images/marketplace_logo.jpg';
                                    } else if (target.src.includes('.jpg')) {
                                        target.src = '/images/marketplace_logo.svg';
                                    } else {
                                        target.style.display = 'none';
                                    }
                                }}
                            />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Moovey Marketplace</h3>
                        <p className="text-gray-600 text-sm mb-4">Find great deals on items others are decluttering</p>
                        <Link
                            href="/marketplace"
                            className="w-full bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:from-[#00ACC1] hover:to-[#139AAA] transition-all duration-200 transform hover:scale-105 shadow-md inline-block text-center"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {userStats ? 'Profile Stats' : 'Community Stats'}
                    </h4>
                    <div className="space-y-3">
                        {userStats ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Total Posts</span>
                                    <span className="font-semibold text-[#17B7C7]">{userStats.postCount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Friends</span>
                                    <span className="font-semibold text-[#17B7C7]">{userStats.friendCount || 0}</span>
                                </div>
                                {userStats.memberSince && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">Member Since</span>
                                        <span className="font-semibold text-[#17B7C7]">{userStats.memberSince}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Active Members</span>
                                    <span className="font-semibold text-[#17B7C7]">{statsToShow?.activeMembers ?? (loading ? '...' : '—')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Posts Today</span>
                                    <span className="font-semibold text-[#17B7C7]">{statsToShow?.postsToday ?? (loading ? '...' : '—')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Items Listed</span>
                                    <span className="font-semibold text-[#17B7C7]">{statsToShow?.itemsListed ?? (loading ? '...' : '—')}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Tools</h4>
                    <div className="space-y-2">
                        <Link
                            href="/tools/declutter-list"
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Declutter List
                        </Link>
                        <Link
                            href="/tools/mortgage-calculator"
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                            </svg>
                            Mortgage Calculator
                        </Link>
                        <Link
                            href="/tools/volume-calculator"
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            Volume Calculator
                        </Link>
                        <Link
                            href="/tools/affordability-calculator"
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Affordability Calculator
                        </Link>
                        <Link
                            href="/tools/school-catchment-map"
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            School Catchment Map
                        </Link>
                        {showCommunityLink && (
                            <Link
                                href="/community"
                                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                                </svg>
                                Community Feed
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}