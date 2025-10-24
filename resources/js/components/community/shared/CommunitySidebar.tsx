import { Link } from '@inertiajs/react';

interface CommunitySidebarProps {
    userStats?: {
        postCount?: number;
        friendCount?: number;
        memberSince?: number;
    };
    showCommunityLink?: boolean;
}

export default function CommunitySidebar({ 
    userStats, 
    showCommunityLink = false 
}: CommunitySidebarProps) {
    return (
        <>
            {/* Mobile sidebar - shown as horizontal cards on mobile/tablet */}
            <div className="lg:hidden mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                    <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#17B7C7] to-[#1A237E] rounded-xl sm:rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8-9M7 13l-1.8-9m0 0h15.75M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6M9 9h6" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Marketplace</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Find great deals</p>
                        <Link
                            href="/marketplace"
                            className="w-full bg-gradient-to-r from-[#17B7C7] to-[#1A237E] text-white px-3 py-2 text-xs sm:text-sm rounded-lg font-medium hover:from-[#139AAA] hover:to-[#0D1957] transition-all duration-200 transform hover:scale-105 shadow-md inline-block text-center"
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
                                {userStats ? userStats.postCount || 0 : '1,247+'}
                            </div>
                            <div className="text-xs text-gray-600">
                                {userStats ? 'Posts' : 'Members'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-[#17B7C7] text-sm sm:text-base">
                                {userStats ? userStats.friendCount || 0 : '42'}
                            </div>
                            <div className="text-xs text-gray-600">
                                {userStats ? 'Friends' : 'Today'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Sidebar - Desktop only */}
            <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#17B7C7] to-[#1A237E] rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8-9M7 13l-1.8-9m0 0h15.75M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6M9 9h6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Moovey Marketplace</h3>
                        <p className="text-gray-600 text-sm mb-4">Find great deals on items others are decluttering</p>
                        <Link
                            href="/marketplace"
                            className="w-full bg-gradient-to-r from-[#17B7C7] to-[#1A237E] text-white px-4 py-2 rounded-lg font-medium hover:from-[#139AAA] hover:to-[#0D1957] transition-all duration-200 transform hover:scale-105 shadow-md inline-block text-center"
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
                                    <span className="font-semibold text-[#17B7C7]">1,247+</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Posts Today</span>
                                    <span className="font-semibold text-[#17B7C7]">42</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Items Listed</span>
                                    <span className="font-semibold text-[#17B7C7]">156</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Tools</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.href = '/tools?tool=4'}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Declutter List
                        </button>
                        <button
                            onClick={() => window.location.href = '/tools?tool=0'}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                            </svg>
                            Mortgage Calculator
                        </button>
                        <button
                            onClick={() => window.location.href = '/tools?tool=3'}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            Volume Calculator
                        </button>
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