<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    /**
     * Send a friend request.
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id|different:' . Auth::id()
        ]);

        $friendId = $request->friend_id;
        $userId = Auth::id();

        // Check if friendship already exists
        $existingFriendship = Friendship::where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();

        if ($existingFriendship) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Friendship request already exists or you are already friends.'
                ], 400);
            }
            return back()->with('error', 'Friendship request already exists or you are already friends.');
        }

        // Create friendship request
        Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Friend request sent successfully.'
            ]);
        }

        return back()->with('success', 'Friend request sent successfully.');
    }

    /**
     * Accept a friend request.
     */
    public function acceptRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $friendId = $request->friend_id;
        $userId = Auth::id();

        // Find the friendship request where the current user is the recipient
        $friendship = Friendship::where('user_id', $friendId)
            ->where('friend_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return back()->with('error', 'No pending friend request found.');
        }

        $friendship->accept();

        return back()->with('success', 'Friend request accepted.');
    }

    /**
     * Decline a friend request.
     */
    public function declineRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $friendId = $request->friend_id;
        $userId = Auth::id();

        // Find the friendship request
        $friendship = Friendship::where('user_id', $friendId)
            ->where('friend_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return back()->with('error', 'No pending friend request found.');
        }

        $friendship->decline();

        return back()->with('success', 'Friend request declined.');
    }

    /**
     * Cancel a sent friend request.
     */
    public function cancelRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $friendId = $request->friend_id;
        $userId = Auth::id();

        // Find the friendship request sent by the current user
        $friendship = Friendship::where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->whereIn('status', ['pending', 'accepted'])
            ->first();

        if (!$friendship) {
            return response()->json([
                'success' => false,
                'message' => 'No friend request found.'
            ], 404);
        }

        // If accepted, update friend counts
        if ($friendship->status === 'accepted') {
            // Ensure profiles exist before decrementing
            if ($friendship->user->profile) {
                $friendship->user->profile()->decrement('friend_count');
            }
            if ($friendship->friend->profile) {
                $friendship->friend->profile()->decrement('friend_count');
            }
        }

        $friendship->delete();

        return response()->json([
            'success' => true,
            'message' => 'Friend request cancelled.'
        ]);
    }

    /**
     * Get user's friends.
     */
    public function getFriends()
    {
        $userId = Auth::id();

        // Get friends from both directions
        $sentFriends = Friendship::where('user_id', $userId)
            ->where('status', 'accepted')
            ->with(['friend' => function ($query) {
                $query->with('profile');
            }])
            ->get()
            ->pluck('friend');

        $receivedFriends = Friendship::where('friend_id', $userId)
            ->where('status', 'accepted')
            ->with(['user' => function ($query) {
                $query->with('profile');
            }])
            ->get()
            ->pluck('user');

        $friends = $sentFriends->merge($receivedFriends);

        return response()->json([
            'success' => true,
            'friends' => $friends
        ]);
    }

    /**
     * Get pending friend requests.
     */
    public function getPendingRequests()
    {
        $userId = Auth::id();

        // Get received friend requests
        $receivedRequests = Friendship::where('friend_id', $userId)
            ->where('status', 'pending')
            ->with(['user' => function ($query) {
                $query->with('profile');
            }])
            ->get();

        // Get sent friend requests
        $sentRequests = Friendship::where('user_id', $userId)
            ->where('status', 'pending')
            ->with(['friend' => function ($query) {
                $query->with('profile');
            }])
            ->get();

        return response()->json([
            'success' => true,
            'received_requests' => $receivedRequests,
            'sent_requests' => $sentRequests
        ]);
    }
}
