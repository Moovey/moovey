import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

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

interface MessagesIndexProps {
    conversations: Conversation[];
    unreadCount: number;
}

export default function MessagesIndex({ conversations, unreadCount }: MessagesIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredConversations, setFilteredConversations] = useState(conversations);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showComposeModal, setShowComposeModal] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            setFilteredConversations(
                conversations.filter(conversation =>
                    conversation.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, conversations]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setMenuOpen(false);
        if (menuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [menuOpen]);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    const handleComposeClick = () => {
        router.visit('/trade-directory');
    };

    const handleConversationClick = (conversationId: number) => {
        setSelectedConversation(conversationId);
        router.visit(`/messages/${conversationId}`);
    };

    const truncateMessage = (message: string, maxLength: number = 40) => {
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    return (
        <>
            <Head title="Messages">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="messages" />

                {/* Facebook-style Layout */}
                <div className="pt-16 h-screen flex">
                    {/* Left Sidebar - Conversations */}
                    <div className="w-full md:w-80 lg:w-96 xl:w-[400px] bg-white md:border-r border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chats</h1>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <div className="relative">
                                        <button 
                                            onClick={handleMenuToggle}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Options"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                                            </svg>
                                        </button>
                                        {menuOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                                <Link
                                                    href="/profile-settings"
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Settings
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Refresh Conversations
                                                </button>
                                                <Link
                                                    href="/trade-directory"
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Browse Businesses
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleComposeClick}
                                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Find businesses to connect"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Messenger"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#17B7C7] transition-all"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length > 0 ? (
                                <div>
                                    {filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            onClick={() => handleConversationClick(conversation.id)}
                                            className={`w-full p-2.5 sm:p-3 text-left hover:bg-gray-50 transition-colors focus:outline-none ${
                                                selectedConversation === conversation.id ? 'bg-[#E0F7FA] border-r-2 border-[#17B7C7]' : ''
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2.5 sm:space-x-3">
                                                <div className="relative flex-shrink-0">
                                                    {conversation.other_user.avatar ? (
                                                        <img
                                                            src={conversation.other_user.avatar}
                                                            alt={conversation.other_user.name}
                                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#17B7C7] to-[#1A237E] flex items-center justify-center">
                                                            <span className="text-white font-bold text-base sm:text-xl">
                                                                {conversation.other_user.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Online status indicator */}
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                    
                                                    {conversation.unread_count > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`text-base font-medium truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                                                            {conversation.other_user.name}
                                                        </h3>
                                                        {conversation.last_message_at && (
                                                            <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                                {conversation.last_message_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {conversation.latest_message ? (
                                                        <div className="flex items-center mt-1">
                                                            <p className={`text-sm truncate flex-1 ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                                {conversation.latest_message.is_from_me ? (
                                                                    <span className="text-gray-500">You: </span>
                                                                ) : ''}
                                                                {truncateMessage(conversation.latest_message.content)}
                                                            </p>
                                                            {conversation.unread_count === 0 && (
                                                                <span className="ml-2 text-blue-500 text-xs">✓</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 mt-1">No messages yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    {searchQuery.trim() !== '' ? (
                                        <>
                                            <div className="text-4xl mb-4">🔍</div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                No conversations found
                                            </h3>
                                            <p className="text-gray-500 mb-4 text-sm">
                                                Try searching with a different name
                                            </p>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                Clear search
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-4">💬</div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                No conversations yet
                                            </h3>
                                            <p className="text-gray-500 mb-6 text-sm">
                                                Start connecting with the community!
                                            </p>
                                            <Link
                                                href="/community"
                                                className="inline-flex items-center px-4 py-2 bg-[#17B7C7] text-white font-medium rounded-lg hover:bg-[#139AAA] transition-colors text-sm"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Visit Community
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area - Facebook style welcome screen - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                        <div className="text-center px-4">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 bg-gradient-to-br from-[#17B7C7] to-[#1A237E] rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
                            <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6 max-w-sm lg:max-w-md">
                                Send private messages to friends and connect with the Moovey community.
                            </p>
                            <Link
                                href="/community"
                                className="inline-flex items-center px-6 py-3 bg-[#17B7C7] text-white font-medium rounded-lg hover:bg-[#139AAA] transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Find People to Message
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}