import { Head, Link } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import UserProfileHeader from '@/components/profile/UserProfileHeader';
import FriendshipActions from '@/components/profile/FriendshipActions';
import PostCard from '@/components/community/shared/PostCard';
import PostCreationForm from '@/components/community/shared/PostCreationForm';
import CommunitySidebar from '@/components/community/shared/CommunitySidebar';
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
    const [userProfile, setUserProfile] = useState<UserProfileType>(profile);

    const handlePostChange = (updatedPost: CommunityPost) => {
        setUserPosts(posts => 
            posts.map(post => 
                String(post.id) === String(updatedPost.id) ? updatedPost : post
            )
        );
    };

    const handlePostCreated = useCallback((newPost: CommunityPost) => {
        // Add new post to the beginning of the posts array
        setUserPosts(prevPosts => [newPost, ...prevPosts]);
        
        // Update the post count in the profile
        setUserProfile(prevProfile => ({
            ...prevProfile,
            post_count: prevProfile.post_count + 1
        }));
    }, []);

    return (
        <>
            <Head title={`${user.name} - Profile`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <GlobalHeader currentPage="community" />

                <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="lg:flex lg:gap-6 xl:gap-8 lg:items-start">
                            {/* Sidebar */}
                            <CommunitySidebar 
                                userStats={{
                                    postCount: userProfile.post_count,
                                    friendCount: userProfile.friend_count,
                                    memberSince: new Date(user.created_at).getFullYear()
                                }}
                                showCommunityLink={true}
                            />

                            {/* Main Content Area */}
                            <div className="flex-1 w-full lg:max-w-none">
                                {/* Profile Header */}
                                <UserProfileHeader
                                    user={user}
                                    profile={userProfile}
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

                                {/* Post Creation Form - Only show on own profile */}
                                {isOwnProfile && (
                                    <div className="mb-8">
                                        <PostCreationForm
                                            onPostCreated={handlePostCreated}
                                            isAuthenticated={!!auth?.user}
                                            placeholder="Share an update about your moving journey, ask for advice, or connect with the community..."
                                            className="bg-white rounded-3xl p-6 shadow-lg"
                                        />
                                    </div>
                                )}

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
                    </div>
                </section>

                <WelcomeFooter />
            </div>
        </>
    );
}