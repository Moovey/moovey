import { Head } from '@inertiajs/react';
import { useState } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import UserProfileHeader from '@/components/profile/UserProfileHeader';
import FriendshipActions from '@/components/profile/FriendshipActions';
import PostCard from '@/components/community/shared/PostCard';
import { User, UserProfile as UserProfileType, CommunityPost, FriendshipStatus } from '@/types/community';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface UserProfileProps {
    user: User;
    profile: UserProfileType;
    posts: CommunityPost[];
    friendshipStatus: FriendshipStatus;
    isOwnProfile: boolean;
}

export default function UserProfile({ 
    user, 
    profile, 
    posts, 
    friendshipStatus, 
    isOwnProfile 
}: UserProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const [userPosts, setUserPosts] = useState<CommunityPost[]>(posts);

    const handlePostChange = (updatedPost: CommunityPost) => {
        setUserPosts(posts => 
            posts.map(post => 
                String(post.id) === String(updatedPost.id) ? updatedPost : post
            )
        );
    };

    return (
        <>
            <Head title={`${user.name} - Profile`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="community" />

                <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Profile Header */}
                        <UserProfileHeader
                            user={user}
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            friendshipActionButton={
                                <FriendshipActions
                                    userId={user.id}
                                    initialFriendshipStatus={friendshipStatus}
                                    isOwnProfile={isOwnProfile}
                                    isAuthenticated={!!auth?.user}
                                />
                            }
                        />

                        {/* Posts Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-[#1A237E] mb-6">
                                {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
                            </h2>
                            
                            {userPosts.length > 0 ? (
                                <div className="space-y-6">
                                    {userPosts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            isAuthenticated={!!auth?.user}
                                            onPostChange={handlePostChange}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        {isOwnProfile ? 'No posts yet' : `${user.name} hasn't posted anything yet`}
                                    </h3>
                                    <p className="text-gray-500">
                                        {isOwnProfile 
                                            ? 'Share your moving journey with the community!' 
                                            : 'Check back later for updates from this user.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <WelcomeFooter />
            </div>
        </>
    );
}