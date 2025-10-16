import { toast } from 'react-toastify';

interface PostInteractionsProps {
    postId: string | number;
    liked: boolean;
    likes: number;
    comments: number;
    shares: number;
    isAuthenticated?: boolean;
    onLikeChange: (postId: string | number, liked: boolean, likesCount: number) => void;
    onShareChange: (postId: string | number, sharesCount: number) => void;
    onToggleComments: (postId: string | number) => void;
}

export default function PostInteractions({
    postId,
    liked,
    likes,
    comments,
    shares,
    isAuthenticated = false,
    onLikeChange,
    onShareChange,
    onToggleComments,
}: PostInteractionsProps) {
    const handleLikePost = async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to like posts', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        try {
            const response = await fetch(`/api/community/posts/${String(postId)}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                onLikeChange(postId, data.liked, data.likes_count);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleSharePost = async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to share posts', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        try {
            const response = await fetch(`/api/community/posts/${String(postId)}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                onShareChange(postId, data.shares_count);
                toast.success('🔗 Post shared successfully!', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                toast.error(`🚫 ${data.message}`, {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            toast.error('🚫 Failed to share post. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 text-xs sm:text-sm">
            <button 
                onClick={handleLikePost}
                className={`flex items-center space-x-1 sm:space-x-2 transition-colors hover:bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg ${
                    liked ? 'text-[#17B7C7]' : 'text-gray-500 hover:text-[#17B7C7]'
                }`}
            >
                <span className="text-base sm:text-lg">👍</span>
                <span className="font-medium hidden sm:inline">{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
                <span className="font-medium sm:hidden">{likes}</span>
            </button>
            <button 
                onClick={() => onToggleComments(postId)}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#17B7C7] transition-colors hover:bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg"
            >
                <span className="text-base sm:text-lg">💬</span>
                <span className="font-medium hidden sm:inline">
                    {comments === 0 ? '0 comment' : `${comments} comments`}
                </span>
                <span className="font-medium sm:hidden">{comments}</span>
            </button>
            <button 
                onClick={handleSharePost}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#17B7C7] transition-colors hover:bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg"
            >
                <span className="text-base sm:text-lg">🔗</span>
                <span className="font-medium hidden sm:inline">{shares} Shares</span>
                <span className="font-medium sm:hidden">{shares}</span>
            </button>
        </div>
    );
}