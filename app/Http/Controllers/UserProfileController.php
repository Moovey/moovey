<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    /**
     * Show the user profile page.
     */
    public function show(Request $request, $userId)
    {
        $user = User::with('profile')->findOrFail($userId);
        $currentUser = Auth::user();
        
        // Create profile if it doesn't exist
        if (!$user->profile) {
            $user->profile()->create([
                'post_count' => 0,
                'friend_count' => 0,
            ]);
            $user->load('profile');
        }

        // Calculate actual post count (both original posts and shared posts)
        $actualPostCount = CommunityPost::where('user_id', $userId)->count();
        
        // Calculate actual friend count (both sent and received accepted friendships)
        $actualFriendCount = $user->friends()->count() + $user->friendsOf()->count();
        
        // Update the profile counts if they're different
        $updateData = [];
        if ($user->profile->post_count !== $actualPostCount) {
            $updateData['post_count'] = $actualPostCount;
        }
        if ($user->profile->friend_count !== $actualFriendCount) {
            $updateData['friend_count'] = $actualFriendCount;
        }
        
        if (!empty($updateData)) {
            $user->profile->update($updateData);
            $user->profile->refresh();
        }

        // Get user's posts (both original posts and shared posts)
        $posts = CommunityPost::where('user_id', $userId)
            ->with(['user', 'originalPost.user'])
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($post) use ($currentUser) {
                $data = [
                    'id' => $post->id,
                    'user_id' => $post->user_id,
                    'userName' => $post->user->name,
                    'userAvatar' => $post->user->avatar,
                    'timestamp' => $post->getTimeAgoAttribute(),
                    'content' => $post->content,
                    'location' => $post->location,
                    'likes' => $post->likes_count,
                    'comments' => $post->comments_count,
                    'shares' => $post->shares_count,
                    'liked' => $currentUser ? $post->isLikedByUser($currentUser->id) : false,
                    'post_type' => $post->post_type ?? 'original',
                ];

                // If this is a shared post, include original post data
                if ($post->post_type === 'shared' && $post->originalPost) {
                    $data['original_post'] = [
                        'id' => $post->originalPost->id,
                        'user_id' => $post->originalPost->user_id,
                        'userName' => $post->originalPost->user->name,
                        'userAvatar' => $post->originalPost->user->avatar,
                        'timestamp' => $post->originalPost->getTimeAgoAttribute(),
                        'content' => $post->originalPost->content,
                        'location' => $post->originalPost->location,
                        'likes' => $post->originalPost->likes_count,
                        'comments' => $post->originalPost->comments_count,
                        'shares' => $post->originalPost->shares_count,
                    ];
                }

                return $data;
            });

        // Determine friendship status
        $friendshipStatus = [
            'status' => 'none',
            'canSendRequest' => true,
            'canAcceptRequest' => false,
            'canCancelRequest' => false,
        ];

        if ($currentUser && $currentUser->id != $userId) {
            $friendship = Friendship::where(function ($q) use ($currentUser, $userId) {
                $q->where('user_id', $currentUser->id)
                  ->where('friend_id', $userId);
            })->orWhere(function ($q) use ($currentUser, $userId) {
                $q->where('user_id', $userId)
                  ->where('friend_id', $currentUser->id);
            })->first();

            if ($friendship) {
                if ($friendship->status === 'accepted') {
                    $friendshipStatus = [
                        'status' => 'accepted',
                        'canSendRequest' => false,
                        'canAcceptRequest' => false,
                        'canCancelRequest' => false,
                    ];
                } elseif ($friendship->status === 'pending') {
                    if ($friendship->user_id === $currentUser->id) {
                        $friendshipStatus = [
                            'status' => 'pending',
                            'canSendRequest' => false,
                            'canAcceptRequest' => false,
                            'canCancelRequest' => true,
                        ];
                    } else {
                        $friendshipStatus = [
                            'status' => 'received_pending',
                            'canSendRequest' => false,
                            'canAcceptRequest' => true,
                            'canCancelRequest' => false,
                        ];
                    }
                }
            }
        } elseif (!$currentUser) {
            $friendshipStatus['canSendRequest'] = false;
        }

        return Inertia::render('UserProfile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'created_at' => $user->created_at->toDateString(),
            ],
            'profile' => [
                'id' => $user->profile->id,
                'user_id' => $user->profile->user_id,
                'bio' => $user->profile->bio,
                'location' => $user->profile->location,
                'website' => $user->profile->website,
                'post_count' => $user->profile->post_count,
                'friend_count' => $user->profile->friend_count,
                'last_active' => $user->profile->last_active?->toDateString(),
                'created_at' => $user->profile->created_at->toDateString(),
            ],
            'posts' => $posts,
            'friendshipStatus' => $friendshipStatus,
            'isOwnProfile' => $currentUser && $currentUser->id == $userId,
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }
        
        $request->validate([
            'bio' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
        ]);

        $profile = $user->profile()->firstOrCreate([], [
            'post_count' => 0,
            'friend_count' => 0,
        ]);
        
        $profile->update($request->only(['bio', 'location', 'website']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'profile' => $profile
        ]);
    }
}
