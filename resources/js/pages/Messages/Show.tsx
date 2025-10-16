import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface Message {
    id: number;
    content: string;
    sender: {
        id: number;
        name: string;
        avatar: string | null;
    };
    is_from_me: boolean;
    created_at: string;
    formatted_date: string;
}

interface Conversation {
    id: number;
    other_user: {
        id: number;
        name: string;
        avatar: string | null;
    };
}

interface ConversationShowProps {
    conversation: Conversation;
    messages: Message[];
}

export default function ConversationShow({ conversation, messages: initialMessages }: ConversationShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [newMessage]);

    // Set up real-time polling for new messages
    useEffect(() => {
        const pollMessages = () => {
            router.reload({
                only: ['messages'],
                onSuccess: (page: any) => {
                    if (page.props.messages && page.props.messages.length > messages.length) {
                        setMessages(page.props.messages);
                    }
                }
            });
        };

        // Poll every 3 seconds for new messages
        const interval = setInterval(pollMessages, 3000);

        return () => clearInterval(interval);
    }, [messages.length]);

    // Mark conversation as read when component mounts
    useEffect(() => {
        fetch(`/api/messages/conversations/${conversation.id}/mark-as-read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            credentials: 'same-origin',
        }).catch(console.error);
    }, [conversation.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newMessage.trim() || isSending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    conversation_id: conversation.id,
                    content: messageContent,
                }),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                toast.success('Message sent!', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.', {
                position: 'bottom-right',
                autoClose: 3000,
            });
            setNewMessage(messageContent); // Restore message content
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const grouped: { [date: string]: Message[] } = {};
        
        messages.forEach(message => {
            const date = message.formatted_date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(message);
        });
        
        return grouped;
    };

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <>
            <Head title={`Messages - ${conversation.other_user.name}`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white font-['Inter',sans-serif] flex flex-col">
                <GlobalHeader currentPage="messages" />

                {/* Facebook-style layout with sidebar and main chat */}
                <div className="flex-1 flex mt-16 md:mt-20">
                    {/* Sidebar - Conversations List - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden lg:flex w-80 xl:w-96 bg-white border-r border-gray-200 flex-col">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
                        </div>
                        
                        {/* Quick Back Link */}
                        <div className="p-3 border-b border-gray-100">
                            <Link
                                href="/messages"
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to all chats
                            </Link>
                        </div>

                        {/* Current Conversation - Active State */}
                        <div className="p-3 bg-[#E0F7FA] border-l-4 border-[#17B7C7]">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    {conversation.other_user.avatar ? (
                                        <img
                                            src={conversation.other_user.avatar}
                                            alt={conversation.other_user.name}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#17B7C7] to-[#1A237E] flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {conversation.other_user.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {conversation.other_user.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">Active now</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col w-full lg:w-auto">
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    {/* Back button - visible on mobile/tablet */}
                                    <Link
                                        href="/messages"
                                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                    
                                    {conversation.other_user.avatar ? (
                                        <img
                                            src={conversation.other_user.avatar}
                                            alt={conversation.other_user.name}
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#17B7C7] to-[#1A237E] flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {conversation.other_user.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="min-w-0">
                                        <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                            {conversation.other_user.name}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-gray-500">Active now</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <Link
                                        href={`/user/${conversation.other_user.id}`}
                                        className="p-1.5 sm:p-2 text-[#17B7C7] hover:bg-[#E0F7FA] rounded-full transition-colors"
                                        title="View Profile"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-hidden bg-gray-50">
                            <div className="h-full flex flex-col">
                                {/* Messages Area - Facebook style */}
                                <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    {Object.keys(groupedMessages).length > 0 ? (
                                        <div className="space-y-2">
                                            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                                                <div key={date}>
                                                    {/* Date Separator */}
                                                    <div className="flex justify-center my-4">
                                                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded-full">
                                                            {date}
                                                        </span>
                                                    </div>

                                                    {/* Messages for this date */}
                                                    <div className="space-y-1">
                                                        {dayMessages.map((message, index) => {
                                                            const prevMessage = dayMessages[index - 1];
                                                            const showAvatar = !message.is_from_me && (!prevMessage || prevMessage.is_from_me || prevMessage.sender.id !== message.sender.id);
                                                            
                                                            return (
                                                                <div
                                                                    key={message.id}
                                                                    className={`flex items-end ${message.is_from_me ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mb-2' : 'mb-1'}`}
                                                                >
                                                                    {/* Avatar for other user */}
                                                                    {!message.is_from_me && (
                                                                        <div className="w-7 h-7 mr-2 flex-shrink-0">
                                                                            {showAvatar ? (
                                                                                message.sender.avatar ? (
                                                                                    <img
                                                                                        src={message.sender.avatar}
                                                                                        alt={message.sender.name}
                                                                                        className="w-7 h-7 rounded-full object-cover"
                                                                                    />
                                                                            ) : (
                                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#17B7C7] to-[#1A237E] flex items-center justify-center">
                                                                                    <span className="text-white font-bold text-xs">
                                                                                        {message.sender.name.charAt(0)}
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                            ) : null}
                                                                        </div>
                                                                    )}
                                                                    
                                                                {/* Message Bubble */}
                                                                <div className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl ${
                                                                    message.is_from_me
                                                                        ? 'bg-[#17B7C7] text-white'
                                                                        : 'bg-gray-200 text-gray-900'
                                                                }`}>
                                                                    <p className="text-xs sm:text-sm break-words">
                                                                        {message.content}
                                                                    </p>
                                                                </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="text-4xl mb-4">💬</div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Start the conversation
                                            </h3>
                                            <p className="text-gray-500">
                                                Send a message to {conversation.other_user.name}
                                            </p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input - Facebook style */}
                                <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                                    <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                ref={textareaRef}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder={`Aa`}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-0 resize-none min-h-[40px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px] text-sm text-gray-900 placeholder-gray-500"
                                                rows={1}
                                                disabled={isSending}
                                            />
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#17B7C7] text-white rounded-full hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                                        >
                                            {isSending ? (
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}