<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\CommunityComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Exception;
use App\Models\DeclutterItem;

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
                'images' => $post->images ? array_map(fn($img) => Storage::url($img), $post->images) : [],
                'video' => $post->video ? Storage::url($post->video) : null,
                'media_type' => $post->media_type,
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
                // For shared posts, the main liked status should reflect if user liked the ORIGINAL post
                $data['liked'] = Auth::check() ? $post->originalPost->isLikedByUser(Auth::id()) : false;
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
                'images' => $post->images ? array_map(fn($img) => Storage::url($img), $post->images) : [],
                'video' => $post->video ? Storage::url($post->video) : null,
                'media_type' => $post->media_type,
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
                // For shared posts, the main liked status should reflect if user liked the ORIGINAL post
                $data['liked'] = Auth::check() ? $post->originalPost->isLikedByUser(Auth::id()) : false;
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
        try {
            // Validate the request - adjusted limits to match PHP configuration
            $request->validate([
                'content' => 'required|string|max:5000',
                'location' => 'nullable|string|max:100',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:1800', // 1.8MB per image (under PHP 2MB limit)
                'video' => 'nullable|mimes:mp4,mov,avi,wmv,flv,webm|max:7000', // 7MB for video (under PHP 8MB post limit)
            ]);

            $images = [];
            $video = null;
            $mediaType = null;

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('community-images', 'public');
                    if ($path) {
                        $images[] = $path;
                    }
                }
                $mediaType = 'images';
            }

            // Handle video upload
            if ($request->hasFile('video')) {
                $videoFile = $request->file('video');
                $path = $videoFile->store('community-videos', 'public');
                
                if ($path) {
                    $video = $path;
                }
                $mediaType = 'video';
            }

            $post = CommunityPost::create([
                'user_id' => Auth::id(),
                'content' => $request->content,
                'location' => $request->location,
                'images' => !empty($images) ? $images : null,
                'video' => $video,
                'media_type' => $mediaType,
            ]);

            // Update user's profile post count
            $user = Auth::user();
            if ($user && $user->profile) {
                $user->profile->increment('post_count');
            }

            $post->load('user:id,name,avatar');

            $formattedPost = [
                'id' => $post->id,
                'user_id' => $post->user_id,
                'userName' => $post->user->name,
                'userAvatar' => $post->user->avatar,
                'timestamp' => $post->created_at->diffForHumans(),
                'content' => $post->content,
                'location' => $post->location,
                'images' => $post->images ? array_map(fn($img) => Storage::url($img), $post->images) : [],
                'video' => $post->video ? Storage::url($post->video) : null,
                'media_type' => $post->media_type,
                'likes' => $post->likes_count ?? 0,
                'comments' => $post->comments_count ?? 0,
                'shares' => $post->shares_count ?? 0,
                'liked' => false,
                'post_type' => $post->post_type ?? 'original',
            ];

            return response()->json([
                'success' => true,
                'post' => $formattedPost,
                'message' => 'Post created successfully!',
            ]);

        } catch (ValidationException $e) {
            Log::error('Community post validation failed', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);

            // Check for file upload errors specifically
            $errors = $e->errors();
            $message = 'Validation failed. Please check your inputs.';
            
            if (isset($errors['images.0']) || isset($errors['images']) || isset($errors['video'])) {
                $message = 'File upload failed. Please ensure your images are under 2MB and videos are under 7MB.';
            }

            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => $errors
            ], 422);
        } catch (Exception $e) {
            Log::error('Community post creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create post. Please try again.',
            ], 500);
        }
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
     * Get community-wide stats for sidebar widgets (API endpoint)
     */
    public function getStats()
    {
        // Active members: distinct users who created posts in the last 30 days
        $activeMembers = CommunityPost::where('created_at', '>=', now()->subDays(30))
            ->distinct('user_id')
            ->count('user_id');

        // Posts today
        $postsToday = CommunityPost::whereDate('created_at', now()->toDateString())
            ->count();

        // Items listed for sale in marketplace
        $itemsListed = DeclutterItem::forSale()->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'activeMembers' => $activeMembers,
                'postsToday' => $postsToday,
                'itemsListed' => $itemsListed,
            ],
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
            
            // Create notification for post owner
            $originalPost->createShareNotification($userId);
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

        // Delete associated media files
        if ($post->images) {
            foreach ($post->images as $image) {
                Storage::delete('public/' . $image);
            }
        }
        if ($post->video) {
            Storage::delete('public/' . $post->video);
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
