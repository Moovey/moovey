import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { CommunityHero } from '@/components/community';
import { 
    LazyCommunityStats, 
    LazyCommunityGuidelines, 
    LazyCommunityCTA 
} from '@/components/community/lazy';
import OptimizedCommunityFeed from '@/components/community/OptimizedCommunityFeed';
import { CommunityPost } from '@/types/community';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { postCache } from '@/hooks/useCache';

interface PaginationInfo {
    hasMore: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
}

interface CommunityProps {
    initialPosts: CommunityPost[];
    pagination: PaginationInfo;
}

export default function Community({ initialPosts = [], pagination }: CommunityProps) {
    const { auth } = usePage<SharedData>().props;
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialPosts);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>(pagination);

    // Initialize cache with initial data
    useEffect(() => {
        if (initialPosts.length > 0) {
            postCache.set('community-posts', initialPosts);
            postCache.set('community-pagination', pagination);
        }
    }, [initialPosts, pagination]);

    // Preload critical data on mount
    useEffect(() => {
        // Preload user data if authenticated
        if (auth?.user) {
            // Prefetch user profile data in background
            fetch(`/api/user/${auth.user.id}/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
            }).then(data => {
                if (data) {
                    postCache.set(`user-profile-${auth.user.id}`, data);
                }
            }).catch(() => {
                // Silently fail prefetch
            });
        }
    }, [auth?.user]);

    return (
        <>
            <Head title="Community - Connect with Fellow Movers">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
                {/* Preload critical resources */}
                <link rel="preload" href="/api/community/posts?page=2" as="fetch" crossOrigin="anonymous" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="community" />

                <CommunityHero />
                <OptimizedCommunityFeed 
                    posts={communityPosts} 
                    onPostsChange={setCommunityPosts}
                    isAuthenticated={!!auth?.user}
                    pagination={paginationInfo}
                    onPaginationChange={setPaginationInfo}
                    currentUser={auth?.user ? {
                        ...auth.user,
                        role: auth.user.role || 'user'
                    } : undefined}
                />
                <LazyCommunityStats />
                <LazyCommunityGuidelines />
                <LazyCommunityCTA />

                <WelcomeFooter />
            </div>
        </>
    );
}
