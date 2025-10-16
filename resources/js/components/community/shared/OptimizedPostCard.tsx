import { useState, useCallback, memo, useMemo } from 'react';
import { CommunityPost } from '@/types/community';
import UserAvatar from './UserAvatar';
import PostInteractions from './PostInteractions';
import CommentSection from './CommentSection';

interface PostCardProps {
    post: CommunityPost;
    isAuthenticated?: boolean;
    onPostChange: (updatedPost: CommunityPost) => void;
}

// Memoized image component to prevent unnecessary re-renders
const PostImage = memo(({ image, index, totalImages }: { 
    image: string; 
    index: number; 
    totalImages: number; 
}) => {
    const getImageUrl = useCallback((imagePath: string) => {
        if (imagePath.startsWith('/storage/')) {
            const pathWithoutStorage = imagePath.replace('/storage/', '');
            return `/storage-file/${pathWithoutStorage}`;
        }
        return `/storage-file/${imagePath}`;
    }, []);

    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => {
        const target = e.target as HTMLImageElement;
        
        const cleanPath = imagePath.startsWith('/storage/') 
            ? imagePath.replace('/storage/', '') 
            : imagePath;
        
        const alternativePaths = [
            imagePath.startsWith('/storage/') ? imagePath : `/storage/${imagePath}`,
            `/public/storage/${cleanPath}`,
            `/${cleanPath}`
        ];
        
        const currentAttempt = parseInt(target.dataset.attempt || '0');
        
        if (currentAttempt < alternativePaths.length - 1) {
            target.dataset.attempt = String(currentAttempt + 1);
            target.src = alternativePaths[currentAttempt + 1];
        }
    }, []);

    const imageUrl = useMemo(() => getImageUrl(image), [image, getImageUrl]);

    return (
        <div className={`relative ${
            totalImages === 3 && index === 0 ? 'row-span-2' : ''
        }`}>
            <img
                src={imageUrl}
                alt={`Post image ${index + 1}`}
                className="w-full h-40 sm:h-48 lg:h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer rounded-lg"
                onError={(e) => handleImageError(e, image)}
                data-attempt="0"
                onClick={() => window.open(imageUrl, '_blank')}
                loading={index > 1 ? 'lazy' : 'eager'} // Lazy load images after the first two
            />
        </div>
    );
});

PostImage.displayName = 'PostImage';

// Memoized video component
const PostVideo = memo(({ video }: { video: string }) => (
    <div className="mb-3 sm:mb-4">
        <video
            src={video}
            controls
            className="w-full max-h-64 sm:max-h-80 lg:max-h-96 rounded-lg"
            preload="metadata"
        >
            Your browser does not support the video tag.
        </video>
    </div>
));

PostVideo.displayName = 'PostVideo';

const OptimizedPostCard = memo(({ 
    post, 
    isAuthenticated = false, 
    onPostChange 
}: PostCardProps) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    // Memoize computed values
    const isSharedPost = useMemo(() => post.post_type === 'shared' && post.original_post, [post]);
    const displayPost = useMemo(() => isSharedPost ? post.original_post! : post, [isSharedPost, post]);
    const displayUserId = useMemo(() => displayPost.user_id, [displayPost]);
    const displayUserName = useMemo(() => displayPost.userName, [displayPost]);
    const displayUserAvatar = useMemo(() => displayPost.userAvatar, [displayPost]);
    const displayContent = useMemo(() => displayPost.content, [displayPost]);
    const displayLocation = useMemo(() => displayPost.location, [displayPost]);

    // Memoize media grid class
    const mediaGridClass = useMemo(() => {
        if (!displayPost.images) return '';
        const imageCount = displayPost.images.length;
        return `grid gap-2 rounded-lg overflow-hidden ${
            imageCount === 1 ? 'grid-cols-1' :
            imageCount === 2 ? 'grid-cols-2' :
            imageCount === 3 ? 'grid-cols-2' :
            'grid-cols-2'
        }`;
    }, [displayPost.images]);

    const handleLikeChange = useCallback(async (postId: string | number, isLiked: boolean, newLikes: number) => {
        // Optimistic update
        const updatedPost = {
            ...post,
            likes: isSharedPost ? post.likes : newLikes,
            liked: isLiked,
            ...(isSharedPost && post.original_post && {
                original_post: {
                    ...post.original_post,
                    likes: newLikes
                }
            })
        };
        
        onPostChange(updatedPost);
    }, [post, isSharedPost, onPostChange]);

    const handleShareChange = useCallback((postId: string | number, newShares: number) => {
        const updatedPost = {
            ...post,
            shares: isSharedPost ? post.shares : newShares,
            ...(isSharedPost && post.original_post && {
                original_post: {
                    ...post.original_post,
                    shares: newShares
                }
            })
        };
        onPostChange(updatedPost);
    }, [post, isSharedPost, onPostChange]);

    const handleToggleComments = useCallback(async () => {
        setShowComments(!showComments);
        
        if (!commentsLoaded && !showComments) {
            try {
                const postId = isSharedPost ? post.original_post!.id : post.id;
                const response = await fetch(`/api/community/posts/${postId}/comments`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setComments(data.comments || []);
                    setCommentsLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load comments:', error);
            }
        }
    }, [showComments, commentsLoaded, isSharedPost, post]);

    const handleCommentsChange = useCallback((postId: string | number, newComments: any[]) => {
        setComments(newComments);
    }, []);

    const handleCommentCountChange = useCallback((postId: string | number, changeCount: number) => {
        const currentCount = isSharedPost ? post.original_post!.comments : post.comments;
        const newCount = currentCount + changeCount;
        
        const updatedPost = {
            ...post,
            comments: isSharedPost ? post.comments : newCount,
            ...(isSharedPost && post.original_post && {
                original_post: {
                    ...post.original_post,
                    comments: newCount
                }
            })
        };
        onPostChange(updatedPost);
    }, [post, isSharedPost, onPostChange]);

    return (
        <div className="border-b border-gray-100 pb-4 sm:pb-6 lg:pb-8 last:border-b-0">
            <div className="flex items-start space-x-3 sm:space-x-4">
                <UserAvatar 
                    userId={isSharedPost ? post.user_id : displayUserId}
                    userName={isSharedPost ? post.userName : displayUserName}
                    avatar={isSharedPost ? post.userAvatar : displayUserAvatar}
                    size="medium"
                />
                
                <div className="flex-1">
                    {/* Shared post header */}
                    {isSharedPost && (
                        <div className="mb-2 sm:mb-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                                <button 
                                    onClick={() => window.location.href = `/user/${post.user_id}`}
                                    className="font-semibold text-sm sm:text-base text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                                >
                                    {post.userName}
                                </button>
                                <span className="text-xs sm:text-sm text-gray-500">shared a post</span>
                                <span className="text-xs sm:text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                            {post.content && (
                                <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3">{post.content}</p>
                            )}
                        </div>
                    )}
                    
                    {/* Original post content */}
                    <div className={isSharedPost ? "bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4" : ""}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-3">
                            <button 
                                onClick={() => window.location.href = `/user/${displayUserId}`}
                                className="font-semibold text-sm sm:text-base text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                            >
                                {displayUserName}
                            </button>
                            <span className="text-xs sm:text-sm text-gray-500">
                                {isSharedPost ? displayPost.timestamp : post.timestamp}
                            </span>
                            {displayLocation && (
                                <span className="text-xs bg-[#E0F7FA] text-[#1A237E] px-2 py-1 rounded-full mt-1 sm:mt-0">
                                    📍 {displayLocation}
                                </span>
                            )}
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{displayContent}</p>
                        
                        {/* Media Display */}
                        {displayPost.media_type === 'images' && displayPost.images && displayPost.images.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                                <div className={mediaGridClass}>
                                    {displayPost.images.map((image, index) => (
                                        <PostImage
                                            key={`${displayPost.id}-${index}`}
                                            image={image}
                                            index={index}
                                            totalImages={displayPost.images!.length}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {displayPost.media_type === 'video' && displayPost.video && (
                            <PostVideo video={displayPost.video} />
                        )}
                        
                        {/* Post Interactions */}
                        <PostInteractions
                            postId={isSharedPost ? post.original_post!.id : post.id}
                            liked={post.liked || false}
                            likes={isSharedPost ? post.original_post!.likes : post.likes}
                            comments={isSharedPost ? post.original_post!.comments : post.comments}
                            shares={isSharedPost ? post.original_post!.shares : post.shares}
                            isAuthenticated={isAuthenticated}
                            onLikeChange={handleLikeChange}
                            onShareChange={handleShareChange}
                            onToggleComments={handleToggleComments}
                        />
                        
                        {/* Comments Section */}
                        <CommentSection
                            postId={isSharedPost ? post.original_post!.id : post.id}
                            isVisible={showComments}
                            comments={comments}
                            isAuthenticated={isAuthenticated}
                            onCommentsChange={handleCommentsChange}
                            onCommentCountChange={handleCommentCountChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

OptimizedPostCard.displayName = 'OptimizedPostCard';

export default OptimizedPostCard;