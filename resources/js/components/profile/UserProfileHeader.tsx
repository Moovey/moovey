import { User, UserProfile as UserProfileType } from '@/types/community';
import UserAvatar from '../community/shared/UserAvatar';

interface UserProfileHeaderProps {
    user: User;
    profile: UserProfileType;
    isOwnProfile: boolean;
    friendshipActionButton?: React.ReactNode;
}

export default function UserProfileHeader({
    user,
    profile,
    isOwnProfile,
    friendshipActionButton,
}: UserProfileHeaderProps) {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <UserAvatar 
                    userId={user.id}
                    userName={user.name}
                    avatar={user.avatar}
                    size="xlarge"
                    clickable={false}
                    className="shadow-lg"
                />

                {/* Profile Info */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1A237E] mb-2">{user.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                {profile.location && (
                                    <span className="flex items-center space-x-1">
                                        <span>📍</span>
                                        <span>{profile.location}</span>
                                    </span>
                                )}
                                <span className="flex items-center space-x-1">
                                    <span>📅</span>
                                    <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </span>
                                {profile.last_active && (
                                    <span className="flex items-center space-x-1">
                                        <span>🕒</span>
                                        <span>Active {new Date(profile.last_active).toLocaleDateString()}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            {friendshipActionButton}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="text-gray-700 mb-4 leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Website */}
                    {profile.website && (
                        <div className="mb-4">
                            <a 
                                href={profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#17B7C7] hover:text-[#139AAA] transition-colors flex items-center space-x-1"
                            >
                                <span>🔗</span>
                                <span>{profile.website}</span>
                            </a>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex space-x-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1A237E]">{profile.post_count}</div>
                            <div className="text-sm text-gray-600">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1A237E]">{profile.friend_count}</div>
                            <div className="text-sm text-gray-600">Friends</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}