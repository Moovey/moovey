<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $unreadOnly = $request->boolean('unread_only', false);
        
        $notifications = $this->notificationService->getUserNotifications(
            Auth::id(),
            $limit,
            $unreadOnly
        );

        return response()->json([
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->toISOString(),
                    'time_ago' => $notification->time_ago,
                    'sender' => $notification->sender ? [
                        'id' => $notification->sender->id,
                        'name' => $notification->sender->name,
                        'avatar' => $notification->sender->avatar,
                    ] : null,
                ];
            })
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount(Auth::id());
        
        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $success = $this->notificationService->markAsRead($id, Auth::id());
        
        if ($success) {
            return response()->json(['message' => 'Notification marked as read']);
        }
        
        return response()->json(['message' => 'Notification not found'], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead(Auth::id());
        
        return response()->json([
            'message' => 'All notifications marked as read',
            'updated_count' => $count
        ]);
    }
}
