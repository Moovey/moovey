<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with([
                'userOne:id,name,avatar',
                'userTwo:id,name,avatar',
                'messages' => function ($query) {
                    $query->latest()->limit(1);
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherParticipant($user->id);
                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar' => $otherUser->avatar_url,
                    ],
                    'latest_message' => $conversation->messages->isNotEmpty() ? [
                        'content' => $conversation->messages->first()->content,
                        'created_at' => $conversation->messages->first()->created_at->diffForHumans(),
                        'is_from_me' => $conversation->messages->first()->sender_id === $user->id,
                    ] : null,
                    'unread_count' => $conversation->messages()
                        ->where('sender_id', '!=', $user->id)
                        ->where('is_read', false)
                        ->count(),
                    'last_message_at' => $conversation->last_message_at?->diffForHumans(),
                ];
            });

        // Calculate total unread messages
        $unreadCount = Message::whereHas('conversation', function ($query) use ($user) {
            $query->where('user_one_id', $user->id)
                  ->orWhere('user_two_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->where('is_read', false)
        ->count();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Get messages for a specific conversation
     */
    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user is participant in conversation
        if (!$conversation->hasParticipant($user->id)) {
            abort(403, 'Unauthorized access to conversation');
        }

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->get()
            ->map(function ($message) use ($user) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender' => [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'avatar' => $message->sender->avatar_url,
                    ],
                    'is_from_me' => $message->sender_id === $user->id,
                    'created_at' => $message->created_at->format('g:i A'),
                    'formatted_date' => $message->created_at->format('M j, Y'),
                ];
            });

        $otherUser = $conversation->getOtherParticipant($user->id);

        return Inertia::render('Messages/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'avatar' => $otherUser->avatar_url,
                ],
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a new message
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'conversation_id' => 'required|exists:conversations,id',
                'content' => 'required|string|max:2000',
            ]);

            $user = Auth::user();
            $conversation = Conversation::findOrFail($validated['conversation_id']);

            // Check if user is participant in conversation
            if (!$conversation->hasParticipant($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to conversation'
                ], 403);
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $validated['content'],
            ]);

            // Update conversation's last message time
            $conversation->update(['last_message_at' => now()]);

            $message->load('sender:id,name,avatar');

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender' => [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'avatar' => $message->sender->avatar_url,
                    ],
                    'is_from_me' => true,
                    'created_at' => $message->created_at->format('g:i A'),
                    'formatted_date' => $message->created_at->format('M j, Y'),
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start a new conversation with a user
     */
    public function startConversation(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id|different:' . Auth::id(),
            ]);

            $user = Auth::user();
            $otherUser = User::findOrFail($validated['user_id']);

            // Ensure consistent ordering: lower ID is always user_one
            $userOneId = min($user->id, $otherUser->id);
            $userTwoId = max($user->id, $otherUser->id);

            $conversation = Conversation::firstOrCreate([
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId
            ]);

            return response()->json([
                'success' => true,
                'conversation_id' => $conversation->id,
                'message' => 'Conversation ready'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start conversation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unread message count
     */
    public function getUnreadCount(): JsonResponse
    {
        $user = Auth::user();
        
        $unreadCount = Message::whereHas('conversation', function ($query) use ($user) {
            $query->where('user_one_id', $user->id)
                  ->orWhere('user_two_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->where('is_read', false)
        ->count();
        
        return response()->json([
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Get conversations preview for dropdown
     */
    public function conversationsPreview(): JsonResponse
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with([
                'userOne:id,name,avatar',
                'userTwo:id,name,avatar',
                'messages' => function ($query) {
                    $query->latest()->limit(1);
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherParticipant($user->id);
                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar' => $otherUser->avatar_url,
                    ],
                    'latest_message' => $conversation->messages->isNotEmpty() ? [
                        'content' => $conversation->messages->first()->content,
                        'created_at' => $conversation->messages->first()->created_at->diffForHumans(),
                        'is_from_me' => $conversation->messages->first()->sender_id === $user->id,
                    ] : null,
                    'unread_count' => $conversation->messages()
                        ->where('sender_id', '!=', $user->id)
                        ->where('is_read', false)
                        ->count(),
                    'last_message_at' => $conversation->last_message_at?->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'conversations' => $conversations
        ]);
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        if (!$conversation->hasParticipant($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }
}