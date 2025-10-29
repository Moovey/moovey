import { useState, useEffect, memo } from 'react';
import axios from 'axios';

// Extend window interface to include mooveyConfig
declare global {
    interface Window {
        mooveyConfig?: {
            isAuthenticated: boolean;
            currentLessonId: number | null;
            csrfToken: string;
        };
    }
}

// Configure axios defaults - use relative URLs to work with any base URL
const api = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Add CSRF token if available
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    api.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

interface CommunityPost {
    id: number;
    userName: string;
    userAvatar: string | null;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    location?: string;
    images?: string[];
    video?: string;
}

interface CommunityStats {
    activeMembers: string;
    dailyPosts: string;
    helpRate: string;
}

interface CommunityFeedSectionProps {
    stats?: CommunityStats;
}

const CommunityFeedSection = memo(({ stats }: CommunityFeedSectionProps) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fallback posts in case API fails
    const fallbackPosts: CommunityPost[] = [
        {
            id: 1,
            userName: 'Sarah J.',
            userAvatar: null,
            timestamp: '2 hours ago',
            content: 'Just moved to London—tips on utilities? Need to set up gas and electric ASAP!',
            likes: 5,
            comments: 8,
        },
        {
            id: 2,
            userName: 'Mike R.',
            userAvatar: null,
            timestamp: '4 hours ago',
            content: 'Need removal quotes? I found some great companies through Moovey\'s directory. Happy to share recommendations!',
            likes: 12,
            comments: 13,
        }
    ];

    useEffect(() => {
        // Check authentication status from global config
        const checkAuth = () => {
            if (window.mooveyConfig?.isAuthenticated) {
                setIsAuthenticated(true);
            }
        };
        
        checkAuth();
        
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await api.get('/api/community/posts?page=1');
                
                if (response.data.success && response.data.posts && response.data.posts.length > 0) {
                    // Take only the 2 latest posts for the welcome section
                    const livePosts = response.data.posts.slice(0, 2);
                    setPosts(livePosts);
                } else {
                    // Use fallback posts if no posts available (also limit to 2)
                    setPosts(fallbackPosts.slice(0, 2));
                }
            } catch (err) {
                console.error('Failed to fetch community posts:', err);
                console.error('Error details:', {
                    message: err instanceof Error ? err.message : 'Unknown error',
                    status: (err as any)?.response?.status,
                    data: (err as any)?.response?.data
                });
                setError('Failed to load community posts');
                setPosts(fallbackPosts.slice(0, 2));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const defaultStats = {
        activeMembers: '10,000+',
        dailyPosts: '2,500+',
        helpRate: '98%'
    };

    const currentStats = stats || defaultStats;

    if (isLoading) {
        return (
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="text-center">
                            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-6 shadow-lg">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                                    <div className="h-20 bg-gray-300 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        Join the <span className="text-[#17B7C7]">Conversation</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Connect with thousands of movers sharing tips, asking questions, and supporting each other through their moving journey.
                    </p>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Community Feed Preview */}
                    <div className="space-y-4">
                        {posts.map((post, index) => {
                            // Generate initials and colors for display
                            const initials = post.userName.split(' ').map(name => name[0]).join('').toUpperCase();
                            const colors = ['bg-[#17B7C7]', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-orange-500'];
                            const avatarColor = colors[index % colors.length];

                            return (
                                <div key={post.id} className="bg-white rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]">
                                    <div className="flex items-center space-x-3 mb-4">
                                        {post.userAvatar ? (
                                            <img 
                                                src={post.userAvatar} 
                                                alt={post.userName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center`}>
                                                <span className="text-white text-sm font-bold">{initials}</span>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{post.userName}</h4>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-500">{post.timestamp}</span>
                                                {post.location && (
                                                    <>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-500">{post.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 mb-4">{post.content}</p>
                                    
                                    {/* Show images if available */}
                                    {post.images && post.images.length > 0 && (
                                        <div className="mb-4">
                                            <img 
                                                src={post.images[0]} 
                                                alt="Post content"
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            {post.images.length > 1 && (
                                                <p className="text-sm text-gray-500 mt-1">+{post.images.length - 1} more images</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span>{post.likes} likes</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span>{post.comments} {post.comments === 1 ? 'comment' : 'comments'}</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Community Stats */}
                        <div className="bg-[#17B7C7] rounded-xl p-6 text-white text-center">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-2xl font-bold">{currentStats.activeMembers}</div>
                                    <div className="text-sm opacity-90">Active Members</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{currentStats.dailyPosts}</div>
                                    <div className="text-sm opacity-90">Daily Posts</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{currentStats.helpRate}</div>
                                    <div className="text-sm opacity-90">Help Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - CTA */}
                    <div className="text-center lg:text-left space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                            Get instant answers from people who've been there
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Our community is here to help 24/7. Whether you need quick advice, local recommendations, or just someone to share your moving stress with, you'll find support from thousands of experienced movers.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                <span className="text-gray-700">Real experiences from real movers</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                <span className="text-gray-700">Local insights and recommendations</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-[#17B7C7] rounded-full"></div>
                                <span className="text-gray-700">24/7 community support</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <a 
                                href={isAuthenticated ? "/community" : "/register"}
                                className="bg-[#17B7C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                            >
                                Join the Conversation
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

CommunityFeedSection.displayName = 'CommunityFeedSection';

export default CommunityFeedSection;