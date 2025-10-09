<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Create a notification
     */
    public function create(int $userId, int $senderId, string $type, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'sender_id' => $senderId,
            'type' => $type,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Get user's notifications
     */
    public function getUserNotifications(int $userId, int $limit = 10, bool $unreadOnly = false): Collection
    {
        $query = Notification::where('user_id', $userId)
            ->with(['sender:id,name,avatar'])
            ->orderBy('created_at', 'desc');

        if ($unreadOnly) {
            $query->unread();
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->unread()
            ->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->unread()
            ->update(['is_read' => true]);
    }

    /**
     * Delete old notifications (older than specified days)
     */
    public function deleteOldNotifications(int $days = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($days))
            ->delete();
    }

    /**
     * Create a post like notification
     */
    public function createPostLikeNotification(int $postOwnerId, int $likerId, int $postId, string $postContent): void
    {
        if ($postOwnerId === $likerId) return; // Don't notify yourself

        $liker = User::find($likerId);
        if (!$liker) return;

        $this->create(
            $postOwnerId,
            $likerId,
            'post_like',
            "{$liker->name} liked your post",
            [
                'post_id' => $postId,
                'post_content' => substr($postContent, 0, 50) . '...',
            ]
        );
    }

    /**
     * Create a post comment notification
     */
    public function createPostCommentNotification(int $postOwnerId, int $commenterId, int $postId, int $commentId, string $postContent, string $commentContent): void
    {
        if ($postOwnerId === $commenterId) return; // Don't notify yourself

        $commenter = User::find($commenterId);
        if (!$commenter) return;

        $this->create(
            $postOwnerId,
            $commenterId,
            'post_comment',
            "{$commenter->name} commented on your post",
            [
                'post_id' => $postId,
                'comment_id' => $commentId,
                'post_content' => substr($postContent, 0, 50) . '...',
                'comment_content' => substr($commentContent, 0, 50) . '...',
            ]
        );
    }

    /**
     * Create a post share notification
     */
    public function createPostShareNotification(int $postOwnerId, int $sharerId, int $postId, string $postContent): void
    {
        if ($postOwnerId === $sharerId) return; // Don't notify yourself

        $sharer = User::find($sharerId);
        if (!$sharer) return;

        $this->create(
            $postOwnerId,
            $sharerId,
            'post_share',
            "{$sharer->name} shared your post",
            [
                'post_id' => $postId,
                'post_content' => substr($postContent, 0, 50) . '...',
            ]
        );
    }

    /**
     * Create a friend request notification
     */
    public function createFriendRequestNotification(int $receiverId, int $senderId, int $friendshipId): void
    {
        $sender = User::find($senderId);
        if (!$sender) return;

        $this->create(
            $receiverId,
            $senderId,
            'friend_request',
            "{$sender->name} sent you a friend request",
            [
                'friendship_id' => $friendshipId,
                'sender_name' => $sender->name,
                'sender_avatar' => $sender->avatar,
            ]
        );
    }

    /**
     * Create a friend request accepted notification
     */
    public function createFriendAcceptedNotification(int $requesterId, int $accepterId, int $friendshipId): void
    {
        $accepter = User::find($accepterId);
        if (!$accepter) return;

        $this->create(
            $requesterId,
            $accepterId,
            'friend_accepted',
            "{$accepter->name} accepted your friend request",
            [
                'friendship_id' => $friendshipId,
                'accepter_name' => $accepter->name,
                'accepter_avatar' => $accepter->avatar,
            ]
        );
    }
}