import { useState } from 'react';
import { toast } from 'react-toastify';
import { FriendshipStatus } from '@/types/community';

interface FriendshipActionsProps {
    userId: string | number;
    initialFriendshipStatus: FriendshipStatus;
    isOwnProfile: boolean;
    isAuthenticated?: boolean;
}

export default function FriendshipActions({
    userId,
    initialFriendshipStatus,
    isOwnProfile,
    isAuthenticated = false,
}: FriendshipActionsProps) {
    const [friendshipStatus, setFriendshipStatus] = useState(initialFriendshipStatus);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSendFriendRequest = async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to send friend requests', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch('/api/friendships/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ friend_id: userId }),
            });

            const data = await response.json();
            
            if (data.success) {
                setFriendshipStatus({
                    status: 'pending',
                    canSendRequest: false,
                    canAcceptRequest: false,
                    canCancelRequest: true,
                });
                toast.success('👥 Friend request sent!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                toast.error('❌ Failed to send friend request', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAcceptFriendRequest = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch('/api/friendships/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ friend_id: userId }),
            });

            const data = await response.json();
            
            if (data.success) {
                setFriendshipStatus({
                    status: 'accepted',
                    canSendRequest: false,
                    canAcceptRequest: false,
                    canCancelRequest: false,
                });
                toast.success('🎉 You are now friends!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelFriendRequest = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch('/api/friendships/cancel', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ friend_id: userId }),
            });

            const data = await response.json();
            
            if (data.success) {
                setFriendshipStatus({
                    status: 'none',
                    canSendRequest: true,
                    canAcceptRequest: false,
                    canCancelRequest: false,
                });
                toast.success('🔄 Friend request cancelled', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            toast.error('🚫 Network error. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isOwnProfile) return null;

    if (friendshipStatus.status === 'accepted') {
        return (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <span className="text-lg">✅</span>
                <span className="font-medium">Friends</span>
            </div>
        );
    }

    if (friendshipStatus.canAcceptRequest) {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={handleAcceptFriendRequest}
                    disabled={isProcessing}
                    className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50"
                >
                    {isProcessing ? 'Processing...' : 'Accept Request'}
                </button>
                <button
                    onClick={handleCancelFriendRequest}
                    disabled={isProcessing}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    Decline
                </button>
            </div>
        );
    }

    if (friendshipStatus.canCancelRequest) {
        return (
            <button
                onClick={handleCancelFriendRequest}
                disabled={isProcessing}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : 'Cancel Request'}
            </button>
        );
    }

    if (friendshipStatus.canSendRequest) {
        return (
            <button
                onClick={handleSendFriendRequest}
                disabled={isProcessing}
                className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50"
            >
                {isProcessing ? 'Sending...' : 'Add Friend'}
            </button>
        );
    }

    return null;
}