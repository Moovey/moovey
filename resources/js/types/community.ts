export interface CommunityPost {
    id: string | number;
    user_id: string | number;
    userName: string;
    userAvatar: string;
    timestamp: string;
    content: string;
    location?: string;
    images?: string[];
    video?: string;
    media_type?: 'images' | 'video' | null;
    likes: number;
    comments: number;
    shares: number;
    liked?: boolean;
    post_type?: 'original' | 'shared';
    original_post?: {
        id: string | number;
        user_id: string | number;
        userName: string;
        userAvatar: string;
        timestamp: string;
        content: string;
        location?: string;
        images?: string[];
        video?: string;
        media_type?: 'images' | 'video' | null;
        likes: number;
        comments: number;
        shares: number;
    };
}

export interface UserProfile {
    id: string | number;
    user_id: string | number;
    bio?: string;
    location?: string;
    website?: string;
    post_count: number;
    friend_count: number;
    last_active?: string;
    created_at: string;
}

export interface User {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    created_at: string;
    profile?: UserProfile;
}

export interface FriendshipStatus {
    status: 'none' | 'pending' | 'accepted' | 'received_pending' | 'declined' | 'blocked';
    canSendRequest: boolean;
    canAcceptRequest: boolean;
    canCancelRequest: boolean;
}