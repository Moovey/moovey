import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface Conversation {
    id: number;
    other_user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    latest_message: {
        content: string;
        created_at: string;
        is_from_me: boolean;
    } | null;
    unread_count: number;
    last_message_at: string | null;
}

export default function MessageDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUnreadCount();
        
        // Set up polling for real-time updates
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/messages/unread-count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error('Failed to fetch unread message count:', error);
        }
    };

    const fetchConversations = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            // Use fetch instead of Inertia for dropdown data
            const response = await fetch('/api/messages/conversations-preview', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.conversations) {
                    setConversations(data.conversations.slice(0, 5)); // Show only first 5
                }
            } else {
                throw new Error('Failed to fetch conversations');
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDropdownToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && conversations.length === 0) {
            fetchConversations();
        }
    };

    const handleConversationClick = (conversationId: number) => {
        setIsOpen(false);
        router.visit(`/messages/${conversationId}`);
    };

    const handleStartMessage = (userId: number) => {
        setIsOpen(false);
        
        // Start new conversation
        fetch('/api/messages/conversation/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: 'same-origin',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                router.visit(`/messages/${data.conversation_id}`);
            } else {
                toast.error('Failed to start conversation');
            }
        })
        .catch(error => {
            console.error('Failed to start conversation:', error);
            toast.error('Failed to start conversation');
        });
    };

    const truncateMessage = (message: string, maxLength: number = 40) => {
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleDropdownToggle}
                className="relative p-2 text-gray-600 hover:text-[#17B7C7] transition-colors duration-200 rounded-lg hover:bg-gray-100"
                aria-label="Messages"
            >
                <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                </svg>
                
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-hidden">
                    {/* Header - Facebook style */}
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Chats</h3>
                            <Link
                                href="/messages"
                                className="text-[#17B7C7] hover:text-[#139AAA] font-medium text-xs sm:text-sm transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                See all in Messenger
                            </Link>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 sm:p-4">
                                <div className="flex items-center justify-center py-6 sm:py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#17B7C7]"></div>
                                    <span className="ml-2 text-gray-600">Loading conversations...</span>
                                </div>
                            </div>
                        ) : conversations.length > 0 ? (
                            <div>
                                {conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => handleConversationClick(conversation.id)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 relative">
                                                {conversation.other_user.avatar ? (
                                                    <img
                                                        src={conversation.other_user.avatar}
                                                        alt={conversation.other_user.name}
                                                        className="w-14 h-14 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <span className="text-white font-bold">
                                                            {conversation.other_user.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Online indicator */}
                                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {conversation.other_user.name}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {conversation.last_message_at && (
                                                            <span className="text-xs text-gray-500">
                                                                {conversation.last_message_at}
                                                            </span>
                                                        )}
                                                        {conversation.unread_count > 0 && (
                                                            <div className="w-3 h-3 bg-[#17B7C7] rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {conversation.latest_message && (
                                                    <p className={`text-sm mt-1 truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                        {conversation.latest_message.is_from_me ? 'You: ' : ''}
                                                        {truncateMessage(conversation.latest_message.content, 35)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="text-center py-6">
                                    <div className="text-3xl mb-3">💬</div>
                                    <p className="text-gray-900 font-medium text-sm mb-2">No conversations yet</p>
                                    <p className="text-xs text-gray-500">
                                        Visit user profiles to start messaging
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {conversations.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                            <Link
                                href="/messages"
                                className="block w-full text-center text-sm text-[#17B7C7] hover:text-[#139AAA] font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                View all conversations
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}