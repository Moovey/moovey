# Real-Time Messaging Implementation

## Overview
Implemented a comprehensive real-time messaging system using Inertia.js that provides near-instant updates without requiring page reloads or WebSockets.

## Implementation Strategy

### Event-Driven Architecture
Created a custom event system using browser's native `CustomEvent` API to coordinate updates across components:

**Events Used:**
- `messageSent` - Dispatched when user sends a message
- `messageReceived` - Dispatched when new message is detected in conversation
- `conversationUpdated` - Dispatched when new conversation is created
- `conversationsLoaded` - Dispatched when conversation list is refreshed

### Components Updated

#### 1. MessageDropdown Component (`resources/js/components/MessageDropdown.tsx`)
**Features:**
- Aggressive 3-second polling for unread message count using `router.reload({ only: ['unreadMessageCount'] })`
- Event listeners for `messageSent`, `messageReceived`, `conversationUpdated` events
- Auto-refresh conversations when dropdown is open (5-second interval)
- Immediate refresh when custom events are dispatched
- Properly cleans up intervals and event listeners on unmount

**Key Code:**
```typescript
useEffect(() => {
    // Initial load
    refreshMessageCount();
    
    // Set up aggressive polling
    pollIntervalRef.current = setInterval(() => {
        refreshMessageCount();
    }, 3000);
    
    // Listen for custom events
    window.addEventListener('messageSent', handleMessageSent);
    window.addEventListener('messageReceived', handleMessageReceived);
    window.addEventListener('conversationUpdated', handleMessageSent);
    
    return () => {
        // Cleanup
        clearInterval(pollIntervalRef.current);
        window.removeEventListener('messageSent', handleMessageSent);
        // ... etc
    };
}, [isOpen]);
```

#### 2. Messages Show Page (`resources/js/pages/Messages/Show.tsx`)
**Features:**
- 3-second polling for new messages in active conversation
- Dispatches `messageSent` event after successfully sending a message
- Dispatches `messageReceived` event when detecting new message from other user
- Refreshes Inertia shared props (`unreadMessageCount`) after sending

**Key Code:**
```typescript
// After sending message
if (data.success) {
    setMessages(prev => [...prev, data.message]);
    window.dispatchEvent(new CustomEvent('messageSent'));
    router.reload({ only: ['unreadMessageCount'] });
}

// In polling effect
if (page.props.messages && page.props.messages.length > messages.length) {
    const newMessages = page.props.messages;
    setMessages(newMessages);
    
    const latestMessage = newMessages[newMessages.length - 1];
    if (latestMessage && !latestMessage.is_from_me) {
        window.dispatchEvent(new CustomEvent('messageReceived'));
    }
}
```

#### 3. OptimizedSearchResults Component (`resources/js/components/trade-directory/OptimizedSearchResults.tsx`)
**Features:**
- Dispatches `conversationUpdated` event after successfully connecting with business
- Triggers immediate refresh of message dropdown and unread count

**Key Code:**
```typescript
connectForm.post('/api/messages/connect-business', {
    onSuccess: () => {
        window.dispatchEvent(new CustomEvent('conversationUpdated'));
        // Inertia redirect happens automatically
    }
});
```

## Backend Support

### Inertia Shared Props
The `HandleInertiaRequests` middleware provides `unreadMessageCount` to all pages:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'unreadMessageCount' => $request->user() 
            ? Message::where('conversation_id', function($query) use ($request) {
                    // Count unread messages from other users
                })
                ->where('sender_id', '!=', $request->user()->id)
                ->where('is_read', false)
                ->count()
            : 0,
    ];
}
```

### API Endpoints
- `POST /api/messages` - Send message (returns JSON with message data)
- `GET /api/messages/conversations-preview` - Get latest 5 conversations with unread counts
- `POST /api/messages/connect-business` - Create conversation + lead (redirects to conversation)
- `PATCH /api/messages/conversations/{id}/mark-as-read` - Mark messages as read

## How It Works

### Scenario 1: User Sends Message
1. User types message and submits in `Messages/Show.tsx`
2. POST request to `/api/messages` creates message
3. Component dispatches `messageSent` event
4. Component calls `router.reload({ only: ['unreadMessageCount'] })`
5. `MessageDropdown` hears `messageSent` event and:
   - Refreshes unread count via `router.reload()`
   - Refreshes conversation list if dropdown is open
6. All components update in <1 second

### Scenario 2: User Receives Message
1. `Messages/Show.tsx` polls every 3 seconds via `router.reload({ only: ['messages'] })`
2. New message detected (length increased)
3. Check if `!is_from_me` (message from other user)
4. Component dispatches `messageReceived` event
5. `MessageDropdown` hears event and:
   - Refreshes unread count immediately
   - Updates conversation preview if open
6. Badge shows new unread count in <3 seconds

### Scenario 3: User Connects with Business
1. User clicks "Connect" in trade directory
2. POST to `/api/messages/connect-business` creates conversation + lead
3. Component dispatches `conversationUpdated` event
4. Inertia redirects to conversation page
5. `MessageDropdown` refreshes in background

### Scenario 4: Background Updates
1. `MessageDropdown` polls every 3 seconds (always running)
2. Detects changes to `unreadMessageCount` via Inertia
3. Updates badge automatically without any user action
4. When dropdown opened, fetches latest conversations
5. While open, polls conversations every 5 seconds

## Performance Considerations

### Optimizations Used
- **Partial Reloads**: Only reload specific Inertia props (`{ only: ['unreadMessageCount'] }`)
- **Conditional Fetching**: Conversation list only fetched when dropdown is open
- **Event Coordination**: Components communicate via events instead of constant polling
- **Interval Cleanup**: Properly clear intervals on component unmount
- **Aggressive But Targeted**: 3-second polling only for unread count (small payload)

### Network Traffic
- **Idle User**: ~1 request every 3 seconds (unread count only, ~100 bytes)
- **Active Conversation**: ~2 requests every 3 seconds (messages + count, ~2-5KB)
- **Dropdown Open**: Additional request every 5 seconds (conversations, ~3-8KB)
- **Estimated Load**: ~20-40 requests/minute for active user

### Future Enhancements
If network load becomes an issue, consider:
1. **Laravel Echo + WebSockets**: Push notifications instead of polling
2. **Server-Sent Events (SSE)**: One-way real-time updates
3. **Longer Polling Intervals**: 5-10 seconds for less critical updates
4. **Smart Polling**: Exponential backoff when no changes detected

## Testing Checklist

- [x] Send message updates dropdown badge immediately
- [x] Receive message updates badge within 3 seconds
- [x] Connect button creates conversation and updates badge
- [x] Dropdown shows latest conversations when opened
- [x] Unread count matches actual unread messages
- [x] Events properly cleaned up on component unmount
- [x] Polling stops when user leaves page
- [x] Works across multiple browser tabs
- [ ] Test with slow network conditions
- [ ] Test with multiple concurrent conversations
- [ ] Verify no memory leaks from uncleaned intervals

## Deployment Notes

### Production Considerations
1. **Polling Intervals**: Current 3-second intervals are aggressive. Monitor server load.
2. **Caching**: Consider caching unread counts in Redis for high-traffic scenarios
3. **Database Indexes**: Ensure indexes on `sender_id`, `is_read`, `conversation_id` columns
4. **Queue Jobs**: Consider queueing notification emails to avoid blocking responses

### Environment Variables
No additional environment variables required. Works with standard Laravel + Inertia setup.

### Monitoring
Watch these metrics:
- Average response time for `/api/messages/conversations-preview`
- Database query count for unread message calculation
- Memory usage on frontend (potential leak from intervals)
- WebSocket connection count (if upgrading to Echo)

## Migration from Polling to WebSockets (Future)

If you want to upgrade to true real-time with Laravel Echo:

1. Install Laravel Echo and Pusher/Soketi
2. Replace polling intervals with Echo event listeners
3. Dispatch Laravel events when messages are created:
   ```php
   event(new MessageSent($message));
   ```
4. Listen on frontend:
   ```typescript
   Echo.private(`user.${userId}`)
       .listen('MessageSent', (e) => {
           refreshMessageCount();
       });
   ```
5. Remove all polling intervals

## Conclusion

This implementation provides a near-real-time messaging experience using only Inertia.js and standard Laravel features. Updates appear within 1-3 seconds without WebSockets or complex infrastructure. Perfect balance of functionality and simplicity for most applications.
