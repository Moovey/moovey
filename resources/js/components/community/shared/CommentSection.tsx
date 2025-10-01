import { useState } from 'react';
import { toast } from 'react-toastify';
import UserAvatar from './UserAvatar';

interface Comment {
    id: string | number;
    content: string;
    timestamp: string;
    userId: string | number;
    userName: string;
    userAvatar?: string;
    replies?: Comment[];
    canDelete?: boolean;
}

interface CommentSectionProps {
    postId: string | number;
    isVisible: boolean;
    comments: Comment[];
    isAuthenticated?: boolean;
    onCommentsChange: (postId: string | number, comments: Comment[]) => void;
    onCommentCountChange: (postId: string | number, change: number) => void;
}

export default function CommentSection({
    postId,
    isVisible,
    comments,
    isAuthenticated = false,
    onCommentsChange,
    onCommentCountChange,
}: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [newReply, setNewReply] = useState<{[key: string]: string}>({});
    const [isSubmittingReply, setIsSubmittingReply] = useState<{[key: string]: boolean}>({});

    const handleAddComment = async (parentId?: string | number) => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to comment', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const commentText = parentId ? newReply[String(parentId)] : newComment;
        
        if (!commentText?.trim()) return;

        const setSubmitting = parentId ? setIsSubmittingReply : setIsSubmittingComment;
        const submitKey = parentId ? String(parentId) : 'main';
        
        if (parentId) {
            setIsSubmittingReply(prev => ({ ...prev, [String(parentId)]: true }));
        } else {
            setIsSubmittingComment(true);
        }

        try {
            const response = await fetch(`/api/community/posts/${String(postId)}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ 
                    content: commentText,
                    parent_id: parentId || null
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                let updatedComments: Comment[];
                
                if (parentId) {
                    // Handle reply
                    updatedComments = comments.map(comment => 
                        String(comment.id) === String(parentId)
                            ? { ...comment, replies: [...(comment.replies || []), data.comment] }
                            : comment
                    );
                    setNewReply(prev => ({ ...prev, [String(parentId)]: '' }));
                    setReplyingTo(null);
                } else {
                    // Handle new comment
                    updatedComments = [{ ...data.comment, replies: [] }, ...comments];
                    setNewComment('');
                }
                
                onCommentsChange(postId, updatedComments);
                onCommentCountChange(postId, 1);
                
                toast.success(parentId ? '💬 Reply added successfully!' : '💬 Comment added successfully!', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            if (parentId) {
                setIsSubmittingReply(prev => ({ ...prev, [String(parentId)]: false }));
            } else {
                setIsSubmittingComment(false);
            }
        }
    };

    const handleDeleteComment = async (commentId: string | number) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/community/posts/${String(postId)}/comments/${String(commentId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                // Remove the comment or reply from the comments list
                const updatedComments = comments.filter(comment => {
                    // If it's a main comment to delete, remove it completely
                    if (String(comment.id) === String(commentId)) {
                        return false;
                    }
                    return true;
                }).map(comment => ({
                    ...comment,
                    // If it's a reply, filter it out from replies
                    replies: comment.replies?.filter((reply: Comment) => String(reply.id) !== String(commentId)) || []
                }));
                
                onCommentsChange(postId, updatedComments);
                onCommentCountChange(postId, -1);
                
                toast.success('🗑️ Comment deleted successfully!', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                toast.error('❌ ' + (data.message || 'Failed to delete comment'), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="mt-6 pl-4 border-l-2 border-[#E0F7FA]">
            {/* Add Comment Form */}
            {isAuthenticated && (
                <div className="mb-4">
                    <div className="flex space-x-3">
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] resize-none text-sm text-gray-900 placeholder-gray-500"
                                rows={2}
                                disabled={isSubmittingComment}
                            />
                        </div>
                        <button
                            onClick={() => handleAddComment()}
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isSubmittingComment ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Comments List */}
            <div className="space-y-3">
                {comments.map((comment, index) => (
                    <div key={comment.id || index} className="space-y-3">
                        {/* Main Comment */}
                        <div className="flex space-x-3">
                            <UserAvatar 
                                userId={comment.userId}
                                userName={comment.userName}
                                avatar={comment.userAvatar}
                                size="medium"
                            />
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => window.location.href = `/user/${comment.userId || 1}`}
                                                className="font-medium text-sm text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                                            >
                                                {comment.userName}
                                            </button>
                                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                        </div>
                                        {comment.canDelete && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200"
                                                title="Delete comment"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                                    {/* Reply Button */}
                                    {isAuthenticated && (
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === String(comment.id) ? null : String(comment.id))}
                                            className="text-xs text-[#17B7C7] hover:text-[#139AAA] font-medium"
                                        >
                                            {replyingTo === String(comment.id) ? 'Cancel' : 'Reply'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === String(comment.id) && isAuthenticated && (
                            <div className="ml-11 mt-2">
                                <div className="flex space-x-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={newReply[String(comment.id)] || ''}
                                            onChange={(e) => setNewReply(prev => ({
                                                ...prev,
                                                [String(comment.id)]: e.target.value
                                            }))}
                                            placeholder={`Reply to ${comment.userName}...`}
                                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] resize-none text-sm text-gray-900 placeholder-gray-500"
                                            rows={2}
                                            disabled={isSubmittingReply[String(comment.id)]}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleAddComment(comment.id)}
                                        disabled={!newReply[String(comment.id)]?.trim() || isSubmittingReply[String(comment.id)]}
                                        className="bg-[#17B7C7] text-white px-3 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                    >
                                        {isSubmittingReply[String(comment.id)] ? 'Replying...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-11 space-y-2">
                                {comment.replies.map((reply: Comment, replyIndex: number) => (
                                    <div key={reply.id || replyIndex} className="flex space-x-3">
                                        <UserAvatar 
                                            userId={reply.userId}
                                            userName={reply.userName}
                                            avatar={reply.userAvatar}
                                            size="small"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-blue-50 rounded-lg p-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => window.location.href = `/user/${reply.userId || 1}`}
                                                            className="font-medium text-xs text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                                                        >
                                                            {reply.userName}
                                                        </button>
                                                        <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                                    </div>
                                                    {reply.canDelete && (
                                                        <button
                                                            onClick={() => handleDeleteComment(reply.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200"
                                                            title="Delete reply"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-700">{reply.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                {comments.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
                )}
            </div>
        </div>
    );
}