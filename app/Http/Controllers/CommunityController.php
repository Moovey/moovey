<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\CommunityComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommunityController extends Controller
{
    /**
     * Display the community page with posts
     */
    public function index()
    {
        $posts = CommunityPost::with(['user:id,name,avatar', 'originalPost.user:id,name,avatar'])
            ->latestWithPinned()
            ->paginate(5); // Reduced to 5 for faster loading

        $formattedPosts = $posts->map(function ($post) {
            $data = [
                'id' => $post->id,
                'user_id' => $post->user_id,
                'userName' => $post->user->name,
                'userAvatar' => $post->user->avatar, // Send null if no avatar
                'timestamp' => $post->created_at->diffForHumans(),
                'content' => $post->content,
                'location' => $post->location,
                'likes' => $post->likes_count,
                'comments' => $post->comments_count,
                'shares' => $post->shares_count,
                'liked' => Auth::check() ? $post->isLikedByUser(Auth::id()) : false,
                'post_type' => $post->post_type ?? 'original',
            ];

            // If this is a shared post, include original post data
            if ($post->post_type === 'shared' && $post->originalPost) {
                $data['original_post'] = [
                    'id' => $post->originalPost->id,
                    'user_id' => $post->originalPost->user_id,
                    'userName' => $post->originalPost->user->name,
                    'userAvatar' => $post->originalPost->user->avatar,
                    'timestamp' => $post->originalPost->created_at->diffForHumans(),
                    'content' => $post->originalPost->content,
                    'location' => $post->originalPost->location,
                    'likes' => $post->originalPost->likes_count,
                    'comments' => $post->originalPost->comments_count,
                    'shares' => $post->originalPost->shares_count,
                ];
            }

            return $data;
        });

        return Inertia::render('community', [
            'initialPosts' => $formattedPosts,
            'pagination' => [
                'hasMore' => $posts->hasMorePages(),
                'currentPage' => $posts->currentPage(),
                'lastPage' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get paginated posts (API endpoint)
     */
    public function getPosts(Request $request)
    {
        $page = $request->get('page', 1);
        $posts = CommunityPost::with(['user:id,name,avatar', 'originalPost.user:id,name,avatar'])
            ->latestWithPinned()
            ->paginate(5, ['*'], 'page', $page); // 5 posts per page for faster loading

        $formattedPosts = $posts->map(function ($post) {
            $data = [
                'id' => $post->id,
                'user_id' => $post->user_id,
                'userName' => $post->user->name,
                'userAvatar' => $post->user->avatar, // Use the post author's avatar
                'timestamp' => $post->created_at->diffForHumans(),
                'content' => $post->content,
                'location' => $post->location,
                'likes' => $post->likes_count,
                'comments' => $post->comments_count,
                'shares' => $post->shares_count,
                'liked' => Auth::check() ? $post->isLikedByUser(Auth::id()) : false,
                'post_type' => $post->post_type ?? 'original',
            ];

            // If this is a shared post, include original post data
            if ($post->post_type === 'shared' && $post->originalPost) {
                $data['original_post'] = [
                    'id' => $post->originalPost->id,
                    'user_id' => $post->originalPost->user_id,
                    'userName' => $post->originalPost->user->name,
                    'userAvatar' => $post->originalPost->user->avatar,
                    'timestamp' => $post->originalPost->created_at->diffForHumans(),
                    'content' => $post->originalPost->content,
                    'location' => $post->originalPost->location,
                    'likes' => $post->originalPost->likes_count,
                    'comments' => $post->originalPost->comments_count,
                    'shares' => $post->originalPost->shares_count,
                ];
            }

            return $data;
        });

        return response()->json([
            'success' => true,
            'posts' => $formattedPosts,
            'pagination' => [
                'hasMore' => $posts->hasMorePages(),
                'currentPage' => $posts->currentPage(),
                'lastPage' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Store a new community post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'location' => 'nullable|string|max:100',
        ]);

        $post = CommunityPost::create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'location' => $validated['location'] ?? null,
        ]);

        // Update user's profile post count
        $user = Auth::user();
        if ($user->profile) {
            $user->profile->increment('post_count');
        }

        $post->load('user:id,name,avatar');

        $formattedPost = [
            'id' => $post->id,
            'user_id' => $post->user_id,
            'userName' => $post->user->name,
            'userAvatar' => $post->user->avatar, // Use the post author's avatar
            'timestamp' => $post->created_at->diffForHumans(),
            'content' => $post->content,
            'location' => $post->location,
            'likes' => $post->likes_count,
            'comments' => $post->comments_count,
            'shares' => $post->shares_count,
            'liked' => false,
        ];

        return response()->json([
            'success' => true,
            'post' => $formattedPost,
            'message' => 'Post created successfully!',
        ]);
    }

    /**
     * Toggle like on a post
     */
    public function toggleLike(CommunityPost $post)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to like posts.',
            ], 401);
        }

        $isLiked = $post->toggleLike(Auth::id());

        return response()->json([
            'success' => true,
            'liked' => $isLiked,
            'likes_count' => $post->fresh()->likes_count,
        ]);
    }

    /**
     * Store a new comment on a post
     */
    public function storeComment(Request $request, CommunityPost $post)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to comment.',
            ], 401);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:500',
            'parent_id' => 'nullable|exists:community_comments,id',
        ]);

        // If parent_id is provided, ensure the parent comment belongs to this post
        if ($validated['parent_id']) {
            $parentComment = CommunityComment::find($validated['parent_id']);
            if (!$parentComment || $parentComment->community_post_id !== $post->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid parent comment.',
                ], 400);
            }
        }

        $comment = CommunityComment::create([
            'user_id' => Auth::id(),
            'community_post_id' => $post->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        $comment->load('user:id,name,avatar');
        $post->increment('comments_count');

        return response()->json([
            'success' => true,
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'userName' => $comment->user->name,
                'userId' => $comment->user_id,
                'timestamp' => $comment->created_at->diffForHumans(),
                'canDelete' => true, // User just created this comment
                'parentId' => $comment->parent_id,
            ],
            'message' => 'Comment added successfully!',
        ]);
    }

    /**
     * Get comments for a post
     */
    public function getComments(CommunityPost $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id') // Only get top-level comments
            ->with(['user:id,name,avatar', 'replies.user:id,name,avatar'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'userName' => $comment->user->name,
                    'userAvatar' => $comment->user->avatar,
                    'userId' => $comment->user_id,
                    'timestamp' => $comment->created_at->diffForHumans(),
                    'canDelete' => Auth::check() && Auth::id() === $comment->user_id,
                    'replies' => $comment->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'content' => $reply->content,
                            'userName' => $reply->user->name,
                            'userAvatar' => $reply->user->avatar,
                            'userId' => $reply->user_id,
                            'timestamp' => $reply->created_at->diffForHumans(),
                            'canDelete' => Auth::check() && Auth::id() === $reply->user_id,
                        ];
                    })->toArray(),
                ];
            });

        return response()->json([
            'success' => true,
            'comments' => $comments,
        ]);
    }

    /**
     * Delete a comment (only by the author)
     */
    public function destroyComment(CommunityPost $post, CommunityComment $comment)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to delete comments.',
            ], 401);
        }

        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own comments.',
            ], 403);
        }

        if ($comment->community_post_id !== $post->id) {
            return response()->json([
                'success' => false,
                'message' => 'Comment does not belong to this post.',
            ], 400);
        }

        $comment->delete();
        $post->decrement('comments_count');

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully.',
        ]);
    }

    /**
     * Share a post (create shared post and increment share count)
     */
    public function sharePost(CommunityPost $post)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to share posts.',
            ], 401);
        }

        $userId = Auth::id();

        // Check if user is trying to share their own post
        if ($post->user_id === $userId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot share your own posts.',
            ], 400);
        }

        // Get the original post ID (in case this is already a shared post)
        $originalPostId = $post->post_type === 'shared' ? $post->original_post_id : $post->id;

        // Check if user has already shared this post (prevent duplicate shares)
        $existingShare = CommunityPost::where('user_id', $userId)
            ->where('post_type', 'shared')
            ->where('original_post_id', $originalPostId)
            ->exists();

        if ($existingShare) {
            return response()->json([
                'success' => false,
                'message' => 'You have already shared this post.',
            ], 400);
        }

        // Create the shared post
        $sharedPost = CommunityPost::create([
            'user_id' => $userId,
            'content' => '', // Shared posts can have empty content or add sharing comment later
            'post_type' => 'shared',
            'original_post_id' => $originalPostId,
            'likes_count' => 0,
            'comments_count' => 0,
            'shares_count' => 0,
        ]);

        // Update user's profile post count (shared posts count as posts)
        $user = Auth::user();
        if ($user->profile) {
            $user->profile->increment('post_count');
        }

        // Increment the share count on the original post
        $originalPost = CommunityPost::find($originalPostId);
        if ($originalPost) {
            $originalPost->increment('shares_count');
        }

        return response()->json([
            'success' => true,
            'shares_count' => $originalPost ? $originalPost->fresh()->shares_count : $post->fresh()->shares_count,
            'message' => 'Post shared successfully!',
        ]);
    }

    /**
     * Delete a post (only by the author)
     */
    public function destroy(CommunityPost $post)
    {
        if ($post->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own posts.',
            ], 403);
        }

        // Update user's profile post count before deleting
        $user = Auth::user();
        if ($user->profile) {
            $user->profile->decrement('post_count');
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.',
        ]);
    }
}
