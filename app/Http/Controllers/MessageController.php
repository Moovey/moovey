<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\BusinessProfile;
use App\Models\CustomerLead;
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
                    'latest_message' => $conversation->messages->isNotEmpty() ? (function() use ($conversation, $user) {
                        $message = $conversation->messages->first();
                        $content = $message->content;
                        
                        // Check if this is an item context message
                        $decoded = json_decode($message->content, true);
                        if (is_array($decoded) && isset($decoded['type']) && $decoded['type'] === 'item_context') {
                            // For messages index, show a nice summary instead of JSON
                            $itemName = $decoded['item']['name'] ?? 'Unknown item';
                            $content = "💬 About: {$itemName}";
                        }
                        
                        return [
                            'content' => $content,
                            'created_at' => $message->created_at->diffForHumans(),
                            'is_from_me' => $message->sender_id === $user->id,
                        ];
                    })() : null,
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
                // Check if this is an item context message
                $isItemContext = false;
                $itemData = null;
                $displayContent = $message->content;
                
                // Try to decode as JSON to check for item context
                $decoded = json_decode($message->content, true);
                if (is_array($decoded) && isset($decoded['type']) && $decoded['type'] === 'item_context') {
                    $isItemContext = true;
                    $itemData = $decoded['item'] ?? null;
                    $displayContent = $decoded['message'] ?? $message->content;
                }
                
                return [
                    'id' => $message->id,
                    'content' => $displayContent,
                    'is_item_context' => $isItemContext,
                    'item_data' => $itemData,
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
     * Send a marketplace message about an item
     */
    public function sendMarketplaceMessage(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'recipient_id' => 'required|exists:users,id|different:' . Auth::id(),
                'message' => 'required|string|max:2000',
                'item_id' => 'nullable|exists:declutter_items,id',
                'item_name' => 'nullable|string|max:255',
            ]);

            $user = Auth::user();
            $recipientId = $validated['recipient_id'];

            // Ensure consistent ordering: lower ID is always user_one
            $userOneId = min($user->id, $recipientId);
            $userTwoId = max($user->id, $recipientId);

            // Find or create conversation
            $conversation = Conversation::firstOrCreate([
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId
            ], [
                'last_message_at' => now()
            ]);

            // Prepare message content with item context if provided
            $messageContent = $validated['message'];
            $itemContext = null;
            
            if (isset($validated['item_id']) && $validated['item_id']) {
                // Get item details
                $item = \App\Models\DeclutterItem::find($validated['item_id']);
                if ($item) {
                    $itemContext = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'price' => $item->estimated_value,
                        'condition' => $item->condition,
                        'image' => $item->images ? $item->images[0] ?? null : null
                    ];
                    
                    // Add item context to the beginning of the conversation if it's the first message
                    if ($conversation->messages()->count() === 0) {
                        $contextMessage = Message::create([
                            'conversation_id' => $conversation->id,
                            'sender_id' => $user->id,
                            'content' => json_encode([
                                'type' => 'item_context',
                                'item' => $itemContext,
                                'message' => "💬 Conversation about: {$item->name}"
                            ]),
                        ]);
                    }
                }
            }

            // Create the actual message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $messageContent,
            ]);

            // Update conversation's last message time
            $conversation->update(['last_message_at' => now()]);

            $message->load('sender:id,name,avatar');

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully!',
                'data' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'conversation_id' => $conversation->id,
                    'item_context' => $itemContext,
                    'sender' => [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'avatar' => $message->sender->avatar_url,
                    ],
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
                'messages' => function ($query) use ($user) {
                    // Prioritize showing received messages over sent messages
                    $query->latest()->limit(10);
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherParticipant($user->id);
                
                $latestMessage = null;
                if ($conversation->messages->isNotEmpty()) {
                    // First, try to find the latest received message (from the other user)
                    $receivedMessage = $conversation->messages->firstWhere('sender_id', '!=', $user->id);
                    // If no received message, fall back to any latest message
                    $message = $receivedMessage ?? $conversation->messages->first();
                    $content = $message->content;
                    
                    // Check if this is an item context message
                    $decoded = json_decode($message->content, true);
                    if (is_array($decoded) && isset($decoded['type']) && $decoded['type'] === 'item_context') {
                        // For dropdown preview, show a nice summary instead of JSON
                        $itemName = $decoded['item']['name'] ?? 'Unknown item';
                        $content = "💬 About: {$itemName}";
                    }
                    
                    $latestMessage = [
                        'content' => $content,
                        'created_at' => $message->created_at->diffForHumans(),
                        'is_from_me' => $message->sender_id === $user->id,
                    ];
                }
                
                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar' => $otherUser->avatar_url,
                    ],
                    'latest_message' => $latestMessage,
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

    /**
     * Connect a housemover with a business - starts conversation and creates lead
     */
    public function connectWithBusiness(Request $request)
    {
        try {
            $validated = $request->validate([
                'business_profile_id' => 'required|exists:business_profiles,id',
                'message' => 'nullable|string|max:500',
            ]);

            $customer = Auth::user();
            $businessProfile = BusinessProfile::with('user')->findOrFail($validated['business_profile_id']);
            $businessOwner = $businessProfile->user;

            // Check if trying to connect with self
            if ($businessOwner->id === $customer->id) {
                return back()->withErrors(['message' => 'You cannot connect with your own business']);
            }

            // Start or get existing conversation
            $userOneId = min($customer->id, $businessOwner->id);
            $userTwoId = max($customer->id, $businessOwner->id);

            $conversation = Conversation::firstOrCreate([
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId
            ]);

            // Create or update lead
            $lead = CustomerLead::updateOrCreate(
                [
                    'business_profile_id' => $businessProfile->id,
                    'customer_id' => $customer->id,
                ],
                [
                    'conversation_id' => $conversation->id,
                    'status' => 'new',
                    'contacted_at' => now(),
                ]
            );

            // Send initial message if provided
            $initialMessage = $validated['message'] ?? "Hi! I'm interested in your services and would like to discuss my moving needs.";
            
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $customer->id,
                'content' => $initialMessage,
            ]);

            // Update conversation's last message time
            $conversation->update(['last_message_at' => now()]);

            // Redirect to the conversation with success message
            return redirect()->route('messages.show', $conversation->id)
                ->with('success', 'Connected successfully! You can now message this business.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Failed to connect: ' . $e->getMessage()]);
        }
    }
}