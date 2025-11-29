import { Link } from '@inertiajs/react';

interface CommunityMember {
    id: string;
    name: string;
    avatar: string;
    status: string;
    location: string;
    recentActivity: string;
    activityTime: string;
    businessType: string;
    isOnline: boolean;
    isFollowing?: boolean;
}

interface CommunityMembersSectionProps {
    communityMembers: CommunityMember[];
    onConnectMember: (memberId: string) => void;
    onChatMember: (memberId: string) => void;
}

export default function CommunityMembersSection({ 
    communityMembers, 
    onConnectMember, 
    onChatMember 
}: CommunityMembersSectionProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-[#1A237E] flex items-center">
                    <svg className="w-6 h-6 mr-3 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Community Members
                </h4>
                <Link
                    href="/community"
                    className="bg-[#1A237E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#303F9F] transition-colors text-sm"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {communityMembers.slice(0, 8).map((member) => (
                    <div key={member.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-semibold text-[#1A237E] text-sm truncate">{member.name}</h5>
                                    {member.isOnline && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{member.businessType}</p>
                                <p className="text-xs text-gray-500 mb-3">{member.location}</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onConnectMember(member.id)}
                                        className="bg-[#00BCD4] text-white px-3 py-1 rounded text-xs hover:bg-[#00ACC1] transition-colors"
                                    >
                                        Connect
                                    </button>
                                    <button
                                        onClick={() => onChatMember(member.id)}
                                        className="bg-white text-[#00BCD4] border border-[#00BCD4] px-3 py-1 rounded text-xs hover:bg-[#00BCD4] hover:text-white transition-colors"
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
