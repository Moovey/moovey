import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, User, Heart, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { getAvatarUrl } from '@/utils/fileUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SharedData } from '@/types';

interface NotificationData {
    post_id?: number;
    comment_id?: number;
    friendship_id?: number;
    post_content?: string;
    comment_content?: string;
    sender_name?: string;
    sender_avatar?: string;
    accepter_name?: string;
    accepter_avatar?: string;
}

interface NotificationSender {
    id: number;
    name: string;
    avatar?: string;
}

interface Notification {
    id: number;
    type: string;
    message: string;
    data: NotificationData;
    is_read: boolean;
    created_at: string;
    time_ago: string;
    sender: NotificationSender | null;
}

interface NotificationsResponse {
    notifications: Notification[];
}

interface UnreadCountResponse {
    count: number;
}

const NotificationDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { props } = usePage<SharedData>();
    const unreadCount = props.unreadNotificationCount ?? 0;
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const getInitials = useInitials();

    // Function to refresh notification count via Inertia
    const refreshNotificationCount = () => {
        router.reload({ only: ['unreadNotificationCount'] });
    };

    useEffect(() => {
        // Initial load of unread count
        refreshNotificationCount();
        
        // Set up aggressive polling for real-time updates
        pollIntervalRef.current = setInterval(() => {
            refreshNotificationCount();
        }, 3000); // Check every 3 seconds
        
        // Listen for custom notification events from other components
        const handleNotificationCreated = () => {
            refreshNotificationCount();
            if (isOpen) {
                fetchNotifications();
            }
        };

        window.addEventListener('notificationCreated', handleNotificationCreated);
        window.addEventListener('notificationUpdated', handleNotificationCreated);
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            window.removeEventListener('notificationCreated', handleNotificationCreated);
            window.removeEventListener('notificationUpdated', handleNotificationCreated);
        };
    }, [isOpen]);

    // Refresh notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            // Also refresh while dropdown is open
            const openInterval = setInterval(() => {
                fetchNotifications();
            }, 5000); // Refresh every 5 seconds while open
            
            return () => clearInterval(openInterval);
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications?limit=20', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data: NotificationsResponse = await response.json();
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/mark-as-read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(notif => 
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                ));
                refreshNotificationCount();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-as-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
                refreshNotificationCount();
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'post_like':
                return <Heart className="w-4 h-4 text-red-500" />;
            case 'post_comment':
                return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case 'post_share':
                return <Share2 className="w-4 h-4 text-green-500" />;
            case 'friend_request':
            case 'friend_accepted':
                return <UserPlus className="w-4 h-4 text-purple-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate to relevant page based on notification type
        if (notification.type === 'post_like' || notification.type === 'post_comment' || notification.type === 'post_share') {
            // Navigate to community page or specific post
            window.location.href = '/community';
        } else if (notification.type === 'friend_request') {
            // Navigate to sender's profile page to review and accept the request
            if (notification.sender?.id) {
                window.location.href = `/user/${notification.sender.id}`;
            } else {
                // Fallback to connections page if sender info is missing
                window.location.href = '/housemover/connections';
            }
        } else if (notification.type === 'friend_accepted') {
            // Navigate to the accepter's profile page
            if (notification.sender?.id) {
                window.location.href = `/user/${notification.sender.id}`;
            } else {
                // Fallback to connections page if sender info is missing
                window.location.href = '/housemover/connections';
            }
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-gray-600 hover:text-[#17B7C7] transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white rounded-xl shadow-2xl border-2 border-[#E0F7FA] p-0 max-h-96 overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-[#17B7C7] hover:text-[#139AAA] font-medium flex items-center gap-1 transition-colors"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto max-h-80">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#17B7C7] mx-auto"></div>
                            <p className="mt-2 text-sm">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-medium">No notifications yet</p>
                            <p className="text-sm text-gray-400">When someone interacts with your posts or sends you a friend request, you'll see it here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {notification.sender && (
                                            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                                                <AvatarImage 
                                                    src={getAvatarUrl(notification.sender.avatar) || undefined} 
                                                    alt={notification.sender.name} 
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-[#00BCD4] to-[#1A237E] text-white font-bold text-xs">
                                                    {getInitials(notification.sender.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {getNotificationIcon(notification.type)}
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            <p className="text-sm text-gray-900 mt-1">
                                                {notification.message}
                                            </p>
                                            
                                            {notification.data.post_content && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    "{notification.data.post_content}"
                                                </p>
                                            )}
                                            
                                            <p className="text-xs text-gray-400 mt-2">
                                                {notification.time_ago}
                                            </p>
                                        </div>

                                        {!notification.is_read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="text-xs text-[#17B7C7] hover:text-[#139AAA] font-medium p-1 rounded transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                window.location.href = '/housemover/dashboard';
                            }}
                            className="w-full text-center text-sm text-[#17B7C7] hover:text-[#139AAA] font-medium transition-colors"
                        >
                            View all activities
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;